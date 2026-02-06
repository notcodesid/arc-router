import { type Hex } from "viem";
import { prisma } from "@/lib/prisma";
import {
  MESSAGE_TRANSMITTER_V2,
  ARC_CHAIN_ID,
  IRIS_API_URL,
  MessageTransmitterV2Abi,
  TransferStatus,
} from "@arc-router/shared";
import { getPublicClient, getWalletClient } from "./clients";
import { extractMessageFromReceipt, pollForAttestation } from "./utils";

/**
 * Process hop1: Source Chain -> Arc
 * 1. Get the tx receipt from source chain
 * 2. Extract MessageSent event (message + hash)
 * 3. Poll Iris API for attestation
 * 4. Call receiveMessage on Arc's MessageTransmitterV2
 */
export async function processHop1(transfer: {
  id: string;
  hop1TxHash: string;
  sourceChainId: number;
}) {
  const { id, hop1TxHash, sourceChainId } = transfer;
  const irisUrl = process.env.CCTP_ATTESTATION_API || IRIS_API_URL;

  console.log(`  [Hop1] Processing transfer ${id}`);
  console.log(`  [Hop1] Source tx: ${hop1TxHash} on chain ${sourceChainId}`);

  // 1. Get tx receipt from source chain
  const sourceClient = getPublicClient(sourceChainId);
  const receipt = await sourceClient.getTransactionReceipt({
    hash: hop1TxHash as Hex,
  });

  if (receipt.status !== "success") {
    throw new Error(`Source tx ${hop1TxHash} failed`);
  }

  // 2. Extract message from logs
  const messageData = extractMessageFromReceipt(receipt as any);
  if (!messageData) {
    throw new Error(`No MessageSent event found in tx ${hop1TxHash}`);
  }

  const { message, messageHash } = messageData;

  // Save message to DB
  await prisma.transfer.update({
    where: { id },
    data: {
      hop1Message: message,
      status: TransferStatus.ATTESTING_HOP1,
    },
  });

  console.log(`  [Hop1] Message hash: ${messageHash}`);

  // 3. Poll for attestation
  const attestation = await pollForAttestation(messageHash, irisUrl);

  await prisma.transfer.update({
    where: { id },
    data: {
      hop1Attestation: attestation,
      status: TransferStatus.RELAYING_TO_ARC,
    },
  });

  console.log(`  [Hop1] Attestation received, relaying to Arc...`);

  // 4. Call receiveMessage on Arc
  const arcPublic = getPublicClient(ARC_CHAIN_ID);
  const arcWallet = getWalletClient(ARC_CHAIN_ID);
  const messageTransmitter = MESSAGE_TRANSMITTER_V2[ARC_CHAIN_ID];

  const { request } = await arcPublic.simulateContract({
    address: messageTransmitter,
    abi: MessageTransmitterV2Abi,
    functionName: "receiveMessage",
    args: [message, attestation],
    account: arcWallet.account,
  });

  const txHash = await arcWallet.writeContract(request as any);
  console.log(`  [Hop1] Relay tx submitted: ${txHash}`);

  const relayReceipt = await arcPublic.waitForTransactionReceipt({
    hash: txHash,
  });

  if (relayReceipt.status !== "success") {
    throw new Error(`Relay tx on Arc failed: ${txHash}`);
  }

  await prisma.transfer.update({
    where: { id },
    data: {
      hop1RelayTxHash: txHash,
      status: TransferStatus.SETTLED_ON_ARC,
    },
  });

  console.log(`  [Hop1] USDC settled on Arc. Relay tx: ${txHash}`);
}

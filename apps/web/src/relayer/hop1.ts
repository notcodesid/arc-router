import { type Hex } from "viem";
import { prisma } from "@/lib/prisma";
import {
  CCTP_DOMAINS,
  MESSAGE_TRANSMITTER_V2,
  ARC_CHAIN_ID,
  IRIS_API_URL,
  MessageTransmitterV2Abi,
  TransferStatus,
} from "@arc-router/shared";
import { getPublicClient, getWalletClient } from "./clients";
import { pollAttestationV2 } from "./utils";

/**
 * Process hop1: Source Chain -> Arc
 * 1. Verify source tx succeeded
 * 2. Poll Iris V2 API for message + attestation (tight loop, every 2s)
 * 3. Call receiveMessage on Arc's MessageTransmitterV2
 */
export async function processHop1(transfer: {
  id: string;
  hop1TxHash: string;
  sourceChainId: number;
}): Promise<boolean> {
  const { id, hop1TxHash, sourceChainId } = transfer;
  const irisUrl = process.env.CCTP_ATTESTATION_API || IRIS_API_URL;
  const sourceDomain = CCTP_DOMAINS[sourceChainId];

  // 1. Verify source tx succeeded
  const sourceClient = getPublicClient(sourceChainId);
  const receipt = await sourceClient.getTransactionReceipt({
    hash: hop1TxHash as Hex,
  });

  if (receipt.status !== "success") {
    throw new Error(`Source tx ${hop1TxHash} failed`);
  }

  // 2. Poll Iris V2 API for message + attestation (tight loop)
  console.log(`  [Hop1] Waiting for attestation for ${id}...`);
  const { message, attestation } = await pollAttestationV2(sourceDomain, hop1TxHash, irisUrl, "Hop1");

  // Save message to DB and update status
  await prisma.transfer.update({
    where: { id },
    data: {
      hop1Message: message,
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
  return true;
}

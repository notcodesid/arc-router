import { type Hex, pad, stringToHex } from "viem";
import { prisma } from "@/lib/prisma";
import {
  TOKEN_MESSENGER_V2,
  MESSAGE_TRANSMITTER_V2,
  USDC_ADDRESSES,
  ARC_CHAIN_ID,
  ARC_DOMAIN,
  IRIS_API_URL,
  TokenMessengerV2Abi,
  MessageTransmitterV2Abi,
  ERC20Abi,
  ArcRouterAbi,
  TransferStatus,
} from "@arc-router/shared";
import { getPublicClient, getWalletClient } from "./clients";
import {
  addressToBytes32,
  checkAttestationV2,
} from "./utils";

/**
 * Process hop2: Arc -> Destination Chain
 * 1. Burn USDC on Arc (via ArcRouter contract or directly)
 * 2. Extract MessageSent event
 * 3. Poll Iris API for attestation
 * 4. Call receiveMessage on destination chain
 */
export async function processHop2(transfer: {
  id: string;
  destinationChainId: number;
  destinationDomain: number;
  recipient: string;
  amount: string;
  hop2TxHash?: string | null;
}) {
  const { id, destinationChainId, destinationDomain, recipient, amount } =
    transfer;
  const irisUrl = process.env.CCTP_ATTESTATION_API || IRIS_API_URL;

  const arcPublic = getPublicClient(ARC_CHAIN_ID);
  const arcWallet = getWalletClient(ARC_CHAIN_ID);
  const arcUsdc = USDC_ADDRESSES[ARC_CHAIN_ID];
  const arcRouterAddress = process.env
    .NEXT_PUBLIC_ARC_ROUTER_ADDRESS as `0x${string}`;

  let burnTxHash: Hex;

  // If hop2TxHash already exists, skip burn phase (already done)
  if (transfer.hop2TxHash) {
    burnTxHash = transfer.hop2TxHash as Hex;
    console.log(`  [Hop2] Burn already done for ${id}, checking attestation (tx: ${burnTxHash})`);
  } else {
    console.log(`  [Hop2] Burning on Arc for ${id}, sending to chain ${destinationChainId}`);

  if (arcRouterAddress) {
    // Route via ArcRouter contract
    console.log(`  [Hop2] Using ArcRouter at ${arcRouterAddress}`);

    // Transfer USDC to ArcRouter
    const transferAmount = BigInt(amount);

    // Approve ArcRouter to spend USDC
    const { request: approveReq } = await arcPublic.simulateContract({
      address: arcUsdc,
      abi: ERC20Abi,
      functionName: "approve",
      args: [arcRouterAddress, transferAmount],
      account: arcWallet.account,
    });
    const approveTx = await arcWallet.writeContract(approveReq as any);
    await arcPublic.waitForTransactionReceipt({ hash: approveTx });

    // Transfer USDC to ArcRouter
    const { request: transferReq } = await arcPublic.simulateContract({
      address: arcUsdc,
      abi: ERC20Abi,
      functionName: "transfer",
      args: [arcRouterAddress, transferAmount],
      account: arcWallet.account,
    });
    const transferTx = await arcWallet.writeContract(transferReq as any);
    await arcPublic.waitForTransactionReceipt({ hash: transferTx });

    // Call routeTransfer
    const transferIdBytes = pad(stringToHex(id, { size: 32 }), { size: 32 });
    const recipientBytes32 = addressToBytes32(recipient as `0x${string}`);

    const { request: routeReq } = await arcPublic.simulateContract({
      address: arcRouterAddress,
      abi: ArcRouterAbi,
      functionName: "routeTransfer",
      args: [
        transferIdBytes,
        transferAmount,
        destinationDomain,
        recipientBytes32,
      ],
      account: arcWallet.account,
    });
    burnTxHash = await arcWallet.writeContract(routeReq as any);
  } else {
    // Fallback: call depositForBurn directly from relayer wallet
    console.log(`  [Hop2] No ArcRouter, calling depositForBurn directly`);

    const transferAmount = BigInt(amount);
    const recipientBytes32 = addressToBytes32(recipient as `0x${string}`);

    // Approve TokenMessenger
    const { request: approveReq } = await arcPublic.simulateContract({
      address: arcUsdc,
      abi: ERC20Abi,
      functionName: "approve",
      args: [TOKEN_MESSENGER_V2, transferAmount],
      account: arcWallet.account,
    });
    const approveTx = await arcWallet.writeContract(approveReq as any);
    await arcPublic.waitForTransactionReceipt({ hash: approveTx });

    // Call depositForBurn
    const { request: burnReq } = await arcPublic.simulateContract({
      address: TOKEN_MESSENGER_V2,
      abi: TokenMessengerV2Abi,
      functionName: "depositForBurn",
      args: [
        transferAmount,
        destinationDomain,
        recipientBytes32,
        arcUsdc,
        "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex,
        0n,
        2000,
      ],
      account: arcWallet.account,
    });
    burnTxHash = await arcWallet.writeContract(burnReq as any);
  }

  await prisma.transfer.update({
    where: { id },
    data: {
      hop2TxHash: burnTxHash,
      status: TransferStatus.ATTESTING_HOP2,
    },
  });

  console.log(`  [Hop2] Burn tx on Arc: ${burnTxHash}`);

  // Wait for burn tx confirmation
  const burnReceipt = await arcPublic.waitForTransactionReceipt({
    hash: burnTxHash,
  });

  if (burnReceipt.status !== "success") {
    throw new Error(`Burn tx on Arc failed: ${burnTxHash}`);
  }
  } // end of else (burn phase)

  // Check V2 Iris API for message + attestation (non-blocking)
  const result = await checkAttestationV2(ARC_DOMAIN, burnTxHash, irisUrl);
  if (!result) {
    console.log(`  [Hop2] Attestation not ready yet for ${id}, will retry next cycle`);
    return;
  }

  const { message, attestation } = result;

  await prisma.transfer.update({
    where: { id },
    data: {
      hop2Message: message,
      hop2Attestation: attestation,
      status: TransferStatus.RELAYING_TO_DEST,
    },
  });

  console.log(`  [Hop2] Attestation received, relaying to destination...`);

  // Relay to destination chain
  const destPublic = getPublicClient(destinationChainId);
  const destWallet = getWalletClient(destinationChainId);
  const destMessageTransmitter = MESSAGE_TRANSMITTER_V2[destinationChainId];

  const { request: relayReq } = await destPublic.simulateContract({
    address: destMessageTransmitter,
    abi: MessageTransmitterV2Abi,
    functionName: "receiveMessage",
    args: [message, attestation],
    account: destWallet.account,
  });

  const relayTxHash = await destWallet.writeContract(relayReq as any);
  console.log(`  [Hop2] Relay tx submitted: ${relayTxHash}`);

  const relayReceipt = await destPublic.waitForTransactionReceipt({
    hash: relayTxHash,
  });

  if (relayReceipt.status !== "success") {
    throw new Error(
      `Relay tx on destination chain failed: ${relayTxHash}`
    );
  }

  await prisma.transfer.update({
    where: { id },
    data: {
      hop2RelayTxHash: relayTxHash,
      status: TransferStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  console.log(
    `  [Hop2] Transfer ${id} COMPLETED. USDC delivered to ${recipient}`
  );
}

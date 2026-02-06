import { PrismaClient } from "@prisma/client";
import { TransferStatus } from "@arc-router/shared";
import { processHop1 } from "./hop1";
import { processHop2 } from "./hop2";
import { getRelayerAccount } from "./clients";
import { sleep } from "./utils";

// Use a direct PrismaClient instance (not the Next.js singleton)
const prisma = new PrismaClient();

const POLL_INTERVAL = 5000; // 5 seconds

async function processTransfers() {
  // Find transfers that need hop1 processing
  const hop1Transfers = await prisma.transfer.findMany({
    where: {
      status: {
        in: [TransferStatus.ATTESTING_HOP1],
      },
      hop1TxHash: { not: null },
    },
  });

  for (const transfer of hop1Transfers) {
    try {
      console.log(`\n[Relayer] Processing hop1 for transfer ${transfer.id}`);
      await processHop1({
        id: transfer.id,
        hop1TxHash: transfer.hop1TxHash!,
        sourceChainId: transfer.sourceChainId,
      });
    } catch (error) {
      console.error(`[Relayer] Hop1 failed for ${transfer.id}:`, error);
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: TransferStatus.FAILED,
          error: String(error),
        },
      });
    }
  }

  // Find transfers that need hop2 processing
  const hop2Transfers = await prisma.transfer.findMany({
    where: {
      status: {
        in: [TransferStatus.SETTLED_ON_ARC, TransferStatus.BURNING_ON_ARC],
      },
    },
  });

  for (const transfer of hop2Transfers) {
    try {
      console.log(`\n[Relayer] Processing hop2 for transfer ${transfer.id}`);
      // Update to BURNING_ON_ARC
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: TransferStatus.BURNING_ON_ARC },
      });

      await processHop2({
        id: transfer.id,
        destinationChainId: transfer.destinationChainId,
        destinationDomain: transfer.destinationDomain,
        recipient: transfer.recipient,
        amount: transfer.amount,
      });
    } catch (error) {
      console.error(`[Relayer] Hop2 failed for ${transfer.id}:`, error);
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: TransferStatus.FAILED,
          error: String(error),
        },
      });
    }
  }
}

async function main() {
  console.log("=== Arc Router Relayer ===");

  const account = getRelayerAccount();
  console.log(`Relayer address: ${account.address}`);
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log("");

  // Main loop
  while (true) {
    try {
      await processTransfers();
    } catch (error) {
      console.error("[Relayer] Unexpected error:", error);
    }
    await sleep(POLL_INTERVAL);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

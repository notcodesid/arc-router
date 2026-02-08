import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CCTP_DOMAINS,
  SUPPORTED_CHAINS,
  TransferStatus,
} from "@arc-router/shared";
import type { CreateTransferRequest } from "@arc-router/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: CreateTransferRequest = await request.json();

    const { sender, recipient, sourceChainId, destinationChainId, amount, hop1TxHash } = body;

    // Validate required fields
    if (!sender || !recipient || !sourceChainId || !destinationChainId || !amount || !hop1TxHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate chains
    if (
      !SUPPORTED_CHAINS.includes(sourceChainId as (typeof SUPPORTED_CHAINS)[number]) ||
      !SUPPORTED_CHAINS.includes(destinationChainId as (typeof SUPPORTED_CHAINS)[number])
    ) {
      return NextResponse.json(
        { error: "Unsupported chain" },
        { status: 400 }
      );
    }

    if (sourceChainId === destinationChainId) {
      return NextResponse.json(
        { error: "Source and destination must be different" },
        { status: 400 }
      );
    }

    const sourceDomain = CCTP_DOMAINS[sourceChainId];
    const destinationDomain = CCTP_DOMAINS[destinationChainId];

    const transfer = await prisma.transfer.create({
      data: {
        sender,
        recipient,
        sourceChainId,
        destinationChainId,
        sourceDomain,
        destinationDomain,
        amount,
        status: TransferStatus.ATTESTING_HOP1,
        hop1TxHash,
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sender = searchParams.get("sender");

    const where = sender ? { sender: sender.toLowerCase() } : {};

    const transfers = await prisma.transfer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error listing transfers:", error);
    return NextResponse.json(
      { error: "Failed to list transfers" },
      { status: 500 }
    );
  }
}

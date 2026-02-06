import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Error fetching transfer:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connectivity
    const transferCount = await prisma.transfer.count();
    const pendingCount = await prisma.transfer.count({
      where: {
        status: {
          notIn: ["COMPLETED", "FAILED"],
        },
      },
    });

    return NextResponse.json({
      status: "ok",
      database: "connected",
      transfers: {
        total: transferCount,
        pending: pendingCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

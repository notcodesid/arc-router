"use client";

import { TransferStatus } from "@arc-router/shared";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  [TransferStatus.INITIATED]: { label: "Initiated", color: "bg-gray-500" },
  [TransferStatus.ATTESTING_HOP1]: {
    label: "Attesting (Hop 1)",
    color: "bg-yellow-500",
  },
  [TransferStatus.RELAYING_TO_ARC]: {
    label: "Relaying to Arc",
    color: "bg-yellow-500",
  },
  [TransferStatus.SETTLED_ON_ARC]: {
    label: "Settled on Arc",
    color: "bg-blue-500",
  },
  [TransferStatus.BURNING_ON_ARC]: {
    label: "Burning on Arc",
    color: "bg-orange-500",
  },
  [TransferStatus.ATTESTING_HOP2]: {
    label: "Attesting (Hop 2)",
    color: "bg-yellow-500",
  },
  [TransferStatus.RELAYING_TO_DEST]: {
    label: "Relaying to Dest",
    color: "bg-yellow-500",
  },
  [TransferStatus.COMPLETED]: { label: "Completed", color: "bg-green-500" },
  [TransferStatus.FAILED]: { label: "Failed", color: "bg-red-500" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white ${config.color}`}
    >
      {status !== TransferStatus.COMPLETED &&
        status !== TransferStatus.FAILED && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        )}
      {config.label}
    </span>
  );
}

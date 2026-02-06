"use client";

import { useParams } from "next/navigation";
import { useTransferStatus } from "@/hooks/useTransferStatus";
import { TransferProgress } from "@/components/tracking/TransferProgress";
import Link from "next/link";

export default function TransferTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { transfer, isLoading, error } = useTransferStatus(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-arc-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h2 className="mb-4 text-xl font-bold text-red-400">
          Transfer not found
        </h2>
        <p className="mb-6 text-gray-500">
          The transfer ID &quot;{id}&quot; could not be found.
        </p>
        <Link href="/transfer" className="btn-primary">
          New Transfer
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <TransferProgress transfer={transfer} />
      <div className="mt-6 text-center">
        <Link
          href="/transfer"
          className="text-sm text-arc-400 hover:text-arc-300"
        >
          Start another transfer
        </Link>
      </div>
    </div>
  );
}

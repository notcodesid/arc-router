"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CHAIN_NAMES, type Transfer } from "@arc-router/shared";
import { StatusBadge } from "@/components/tracking/StatusBadge";
import { ChainLogo } from "@/components/shared/ChainLogo";
import { AddressDisplay } from "@/components/shared/AddressDisplay";

export default function HistoryPage() {
  const { address } = useAccount();

  const { data: transfers, isLoading } = useQuery<Transfer[]>({
    queryKey: ["transfers", address],
    queryFn: async () => {
      const url = address
        ? `/api/transfers?sender=${address.toLowerCase()}`
        : "/api/transfers";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch transfers");
      return res.json();
    },
    refetchInterval: 10000,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfer History</h1>
          <p className="mt-2 text-gray-500">
            {address
              ? "Your recent cross-chain transfers"
              : "Connect wallet to see your transfers"}
          </p>
        </div>
        <Link href="/transfer" className="btn-primary">
          New Transfer
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-arc-500 border-t-transparent" />
        </div>
      ) : !transfers?.length ? (
        <div className="card py-12 text-center">
          <p className="text-gray-500">No transfers yet</p>
          <Link
            href="/transfer"
            className="mt-4 inline-block text-sm text-arc-400 hover:text-arc-300"
          >
            Make your first transfer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((transfer) => {
            const amountDisplay = (
              parseInt(transfer.amount) / 1e6
            ).toFixed(2);
            const date = new Date(transfer.createdAt).toLocaleString();

            return (
              <Link
                key={transfer.id}
                href={`/transfer/${transfer.id}`}
                className="card flex items-center gap-4 transition-colors hover:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <ChainLogo chainId={transfer.sourceChainId} size="sm" />
                  <span className="text-gray-600">→</span>
                  <ChainLogo
                    chainId={transfer.destinationChainId}
                    size="sm"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {CHAIN_NAMES[transfer.sourceChainId]?.replace(
                      " Sepolia",
                      ""
                    )}{" "}
                    →{" "}
                    {CHAIN_NAMES[transfer.destinationChainId]?.replace(
                      " Sepolia",
                      ""
                    )}
                  </p>
                  <p className="text-xs text-gray-600">{date}</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{amountDisplay} USDC</p>
                </div>

                <StatusBadge status={transfer.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

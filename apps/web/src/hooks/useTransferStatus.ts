"use client";

import { useQuery } from "@tanstack/react-query";
import type { Transfer } from "@arc-router/shared";
import { TransferStatus } from "@arc-router/shared";

export function useTransferStatus(transferId: string | null) {
  const { data, isLoading, error } = useQuery<Transfer>({
    queryKey: ["transfer", transferId],
    queryFn: async () => {
      const res = await fetch(`/api/transfers/${transferId}`);
      if (!res.ok) throw new Error("Failed to fetch transfer");
      return res.json();
    },
    enabled: !!transferId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling if completed or failed
      if (
        status === TransferStatus.COMPLETED ||
        status === TransferStatus.FAILED
      ) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });

  return { transfer: data, isLoading, error };
}

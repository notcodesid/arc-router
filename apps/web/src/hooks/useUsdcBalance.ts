"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_ADDRESSES, ERC20Abi } from "@arc-router/shared";

export function useUsdcBalance(
  chainId: number | null,
  address: `0x${string}` | undefined
) {
  const usdcAddress = chainId ? USDC_ADDRESSES[chainId] : undefined;

  const { data, isLoading, refetch } = useReadContract({
    address: usdcAddress,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chainId ?? undefined,
    query: {
      enabled: !!usdcAddress && !!address && !!chainId,
    },
  });

  const balance = data ? formatUnits(data as bigint, 6) : "0";

  return { balance, isLoading, refetch };
}

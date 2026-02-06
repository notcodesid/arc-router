"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { USDC_ADDRESSES, TOKEN_MESSENGER_V2, ERC20Abi } from "@arc-router/shared";

export function useUsdcApproval(chainId: number | null) {
  const usdcAddress = chainId ? USDC_ADDRESSES[chainId] : undefined;

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const approve = (amount: bigint) => {
    if (!usdcAddress || !chainId) return;
    writeContract({
      address: usdcAddress,
      abi: ERC20Abi,
      functionName: "approve",
      args: [TOKEN_MESSENGER_V2, amount],
      chainId,
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

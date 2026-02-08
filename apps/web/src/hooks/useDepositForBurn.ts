"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { pad } from "viem";
import {
  TOKEN_MESSENGER_V2,
  USDC_ADDRESSES,
  ARC_DOMAIN,
  TokenMessengerV2Abi,
} from "@arc-router/shared";

export function useDepositForBurn(chainId: number | null) {
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

  /**
   * Burns USDC on source chain, sending to `mintRecipient` on Arc (domain 26).
   * The mintRecipient is the relayer address (will be minted USDC on Arc).
   */
  const depositForBurn = (
    amount: bigint,
    mintRecipient: `0x${string}`
  ) => {
    if (!usdcAddress || !chainId) return;

    const recipientBytes32 = pad(mintRecipient, { size: 32 });

    writeContract({
      address: TOKEN_MESSENGER_V2,
      abi: TokenMessengerV2Abi,
      functionName: "depositForBurn",
      args: [
        amount,
        ARC_DOMAIN, // destination domain = Arc
        recipientBytes32,
        usdcAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`, // no caller restriction
        0n, // maxFee (0 for Standard Transfer)
        2000, // minFinalityThreshold (Standard Transfer - free)
      ],
      chainId,
    });
  };

  return {
    depositForBurn,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

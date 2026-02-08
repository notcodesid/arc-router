"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const WalletProviders = dynamic(
  () => import("./wallet-providers").then((m) => m.WalletProviders),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}


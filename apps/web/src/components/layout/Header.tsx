"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-arc-600 font-bold text-white">
            A
          </div>
          <span className="text-lg font-bold">Arc Router</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/transfer"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Transfer
          </Link>
          <Link
            href="/history"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            History
          </Link>
        </nav>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
}

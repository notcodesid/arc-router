"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md group-hover:bg-primary/35 transition-all duration-500" />
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative h-8 w-8 drop-shadow-[0_0_6px_hsl(199_89%_58%/0.5)]"
            >
              <rect width="32" height="32" rx="8" className="fill-primary" />
              <path
                d="M16 6L8 24h4l2-4.5h4L20 24h4L16 6Zm0 7.5L18.5 19h-5L16 13.5Z"
                className="fill-primary-foreground"
              />
              <path
                d="M10 26c3.5 1.5 8.5 1.5 12 0"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="stroke-primary-foreground/60"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-foreground font-semibold tracking-tighter text-lg">
            Arc Router
          </span>
        </div>

        {/* Wallet */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </header>
  );
}

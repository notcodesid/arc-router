import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arc Router - Cross-Chain USDC Transfers",
  description:
    "Instant cross-chain USDC transfers powered by Circle CCTP V2 and Arc L1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

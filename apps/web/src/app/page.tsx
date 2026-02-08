"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ChevronDown, Zap, Shield, Globe, ArrowUpRight, BookOpen, MessageCircle, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import { chains, type ChainInfo } from "@/lib/chains";
import { cn } from "@/lib/utils";
import { TransferAnimation } from "@/components/transfer/TransferAnimation";
import { Footer } from "@/components/layout/Footer";
import { getActiveStep, getStatusLabel } from "@/lib/transferStatus";
import { useTransfer } from "@/hooks/useTransfer";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useTransferStatus } from "@/hooks/useTransferStatus";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PageStatus = "idle" | "sending" | "completed";

function ChainDropdown({
  selected,
  onSelect,
  exclude,
}: {
  selected?: ChainInfo;
  onSelect: (c: ChainInfo) => void;
  exclude?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-foreground">
          {selected ? (
            <>
              <img src={selected.icon} alt={selected.name} className="h-5 w-5 rounded-full" />
              <span>{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select chain</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1 bg-card border-border" align="start">
        {chains
          .filter((c) => c.id !== exclude)
          .map((chain) => (
            <button
              key={chain.id}
              onClick={() => { onSelect(chain); setOpen(false); }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                selected?.id === chain.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <img src={chain.icon} alt={chain.name} className="h-5 w-5 rounded-full" />
              {chain.name}
            </button>
          ))}
      </PopoverContent>
    </Popover>
  );
}

const stats = [
  { label: "Total volume", value: "$1.2B+" },
  { label: "Transfers", value: "4.8M+" },
  { label: "Chains supported", value: "3" },
  { label: "Avg. speed", value: "<30s", highlight: true },
];

const features = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Cross-chain transfers complete in under 30 seconds with optimized routing.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description: "Battle-tested smart contracts with audited security and non-custodial transfers.",
  },
  {
    icon: Globe,
    title: "Multi-chain native",
    description: "Send across Ethereum, Base, and Arbitrum seamlessly via Arc L1.",
  },
];

const resources = [
  { icon: BookOpen, title: "Docs", description: "Explore our developer documentation and integration guides" },
  { icon: MessageCircle, title: "Support", description: "Get help from our team and community" },
  { icon: Users, title: "Community", description: "Join the conversation on Discord and Twitter" },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [fromChain, setFromChain] = useState<ChainInfo | undefined>(chains[0]);
  const [toChain, setToChain] = useState<ChainInfo | undefined>(chains[1]);
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [pageStatus, setPageStatus] = useState<PageStatus>("idle");

  const transfer = useTransfer();
  const { balance, isLoading: balanceLoading } = useUsdcBalance(
    fromChain?.id ?? null,
    address
  );
  const { transfer: backendTransfer } = useTransferStatus(transfer.transferId);

  const fee = amount && !isNaN(Number(amount)) ? (Number(amount) * 0.0002).toFixed(2) : "0.00";

  const canSend =
    isConnected &&
    fromChain &&
    toChain &&
    Number(amount) > 0 &&
    toAddress.length >= 10 &&
    pageStatus === "idle" &&
    transfer.step === "idle";

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleSend = useCallback(async () => {
    if (!fromChain || !toChain || !amount || Number(amount) <= 0) return;

    setPageStatus("sending");
    transfer.startTransfer({
      sourceChainId: fromChain.id,
      destinationChainId: toChain.id,
      amount,
      recipient: toAddress,
    });
  }, [fromChain, toChain, amount, toAddress, transfer]);

  // Watch approval success → execute burn
  useEffect(() => {
    if (transfer.approval.isSuccess && transfer.step === "approve") {
      transfer.onApprovalSuccess();
      const amountBigInt = parseUnits(amount, 6);
      transfer.executeBurn(amountBigInt);
    }
  }, [transfer.approval.isSuccess, transfer.step]);

  // Watch burn success → submit transfer to backend
  useEffect(() => {
    if (transfer.burn.isSuccess && transfer.step === "burn" && fromChain && toChain) {
      transfer.submitTransfer({
        sourceChainId: fromChain.id,
        destinationChainId: toChain.id,
        amount,
        recipient: toAddress,
      });
    }
  }, [transfer.burn.isSuccess, transfer.step]);

  // Watch backend status → mark completed
  useEffect(() => {
    if (backendTransfer?.status === "COMPLETED") {
      setPageStatus("completed");
    }
  }, [backendTransfer?.status]);

  // Watch for errors
  useEffect(() => {
    if (transfer.error) {
      setPageStatus("idle");
    }
  }, [transfer.error]);

  const handleReset = () => {
    setPageStatus("idle");
    setAmount("");
    setToAddress("");
    transfer.setStep("idle");
    transfer.setError(null);
  };

  // Compute animation step
  const activeStep = getActiveStep(transfer.step, backendTransfer?.status);
  const statusLabel = getStatusLabel(transfer.step, backendTransfer?.status);

  // Determine button text
  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (transfer.step === "approve") return "Approving...";
    if (transfer.step === "burn") return "Depositing...";
    if (transfer.step === "submitting") return "Submitting...";
    if (!fromChain || !toChain) return "Select chains";
    if (!amount || Number(amount) <= 0) return "Enter amount";
    if (toAddress.length < 10) return "Enter recipient address";
    return "Send";
  };

  const formattedBalance = balance
    ? Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

  return (
    <div className="flex flex-col items-center w-full">
      {/* Transfer Card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 w-full">
        <AnimatePresence mode="wait">
          {pageStatus !== "idle" && fromChain && toChain ? (
            <motion.div
              key="animation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-[420px]"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <TransferAnimation
                  fromChain={fromChain}
                  toChain={toChain}
                  amount={Number(amount)}
                  activeStep={activeStep}
                  statusLabel={statusLabel}
                />

                {transfer.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
                  >
                    {transfer.error}
                  </motion.div>
                )}

                {(pageStatus === "completed" || transfer.error) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button variant="outline" onClick={handleReset} className="w-full rounded-2xl">
                      New Transfer
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[420px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground">Send</h2>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* FROM */}
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">From</span>
                    <ChainDropdown selected={fromChain} onSelect={setFromChain} exclude={toChain?.id} />
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
                    }}
                    className="w-full bg-transparent text-3xl font-semibold tracking-tighter text-foreground placeholder:text-muted-foreground/40 outline-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {amount && !isNaN(Number(amount)) ? `$${Number(amount).toLocaleString()}` : ""}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Balance: {balanceLoading ? "..." : formattedBalance}
                      </span>
                      {isConnected && Number(balance) > 0 && (
                        <button onClick={() => setAmount(balance)} className="text-xs text-primary font-medium hover:underline">
                          MAX
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Swap button */}
                <div className="relative h-0 flex items-center justify-center z-10">
                  <button
                    onClick={handleSwapChains}
                    className="h-9 w-9 rounded-xl bg-secondary border-4 border-background flex items-center justify-center hover:bg-secondary/80 hover:rotate-180 transition-all duration-300"
                  >
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* TO */}
                <div className="p-4 pt-3 bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">To</span>
                    <ChainDropdown selected={toChain} onSelect={setToChain} exclude={fromChain?.id} />
                  </div>
                  <input
                    type="text"
                    placeholder="Recipient address (0x...)"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/40 outline-none py-2"
                  />
                </div>

                {/* Fee */}
                {Number(amount) > 0 && (
                  <div className="px-4 py-2.5 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <span>Fee</span>
                    <span>${fee}</span>
                  </div>
                )}
              </div>

              {/* Error display */}
              {transfer.error && (
                <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                  {transfer.error}
                </div>
              )}

              {/* Send button */}
              <div className="mt-3">
                <Button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="w-full h-14 rounded-2xl text-base font-semibold glow-blue disabled:opacity-40 disabled:shadow-none transition-all duration-200"
                >
                  {getButtonText()}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Sections */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-24 space-y-24">

        {/* Hero + Stats */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-start"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Cross-chain transfers.{" "}
              <span className="text-gradient">Made simple.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
              Arc delivers fast, secure cross-chain USDC transfers across major networks — powered by Circle CCTP V2 and Arc L1.
            </p>
            <button
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Start transferring <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-1">
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">Arc Protocol stats</span>
            </div>
            <div className="grid grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-5 border-t border-border">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <p className={cn(
                    "text-2xl md:text-3xl font-bold mt-1 tracking-tight",
                    stat.highlight ? "text-primary" : "text-foreground"
                  )}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-10">
            Built for speed &amp; security
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Supported chains */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Supported networks
          </h2>
          <p className="text-muted-foreground mb-8">Transfer across all major EVM chains</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {chains.map((chain) => (
              <div key={chain.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 transition-colors">
                <img src={chain.icon} alt={chain.name} className="h-8 w-8 rounded-full" />
                <div>
                  <span className="text-sm font-semibold text-foreground">{chain.name}</span>
                  <span className="block text-xs text-muted-foreground">{chain.nativeCurrency}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Resources */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">
            Explore Arc
          </h2>
          <div className="divide-y divide-border">
            {resources.map((r) => (
              <button key={r.title} className="flex items-center w-full py-5 group text-left">
                <r.icon className="h-5 w-5 text-muted-foreground mr-4 shrink-0" />
                <span className="text-lg font-semibold text-foreground mr-4">{r.title}</span>
                <span className="text-sm text-muted-foreground flex-1">{r.description}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors ml-4 shrink-0" />
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ChainInfo } from "@/lib/chains";

interface TransferAnimationProps {
  fromChain: ChainInfo;
  toChain: ChainInfo;
  amount: number;
  activeStep: number; // 0-4
  statusLabel?: string;
}

const steps = [
  { label: "Depositing", doneLabel: "Deposited" },
  { label: "Settling on Arc", doneLabel: "Settled" },
  { label: "Sending", doneLabel: "Sent" },
  { label: "Delivering", doneLabel: "Received" },
];

export function TransferAnimation({ fromChain, toChain, amount, activeStep, statusLabel }: TransferAnimationProps) {
  const isComplete = activeStep >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-8 py-8"
    >
      {/* Animated orbs */}
      <div className="relative w-64 h-32 flex items-center justify-center">
        {/* Glow backdrop */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* From chain orb */}
        <motion.div
          className="absolute left-4 flex flex-col items-center gap-2"
          animate={
            isComplete
              ? { x: 0, opacity: 0.6 }
              : { x: [0, 10, 0], opacity: 1 }
          }
          transition={{ duration: 1.5, repeat: isComplete ? 0 : Infinity, ease: "easeInOut" }}
        >
          <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg shadow-primary/10">
            <img src={fromChain.icon} alt={fromChain.name} className="h-9 w-9 rounded-full" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{fromChain.name}</span>
        </motion.div>

        {/* Center Arc node */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-2"
          animate={
            isComplete
              ? { scale: 1 }
              : { scale: [1, 1.05, 1] }
          }
          transition={{ duration: 1, repeat: isComplete ? 0 : Infinity, ease: "easeInOut" }}
        >
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-sm font-bold shadow-xl ${
            isComplete
              ? "bg-success/20 border-2 border-success text-success shadow-success/20"
              : "bg-primary/20 border-2 border-primary text-primary shadow-primary/20 animate-pulse-blue"
          }`}>
            {isComplete ? <Check className="h-6 w-6" /> : "ARC"}
          </div>
        </motion.div>

        {/* To chain orb */}
        <motion.div
          className="absolute right-4 flex flex-col items-center gap-2"
          animate={
            isComplete
              ? { x: 0, opacity: 1 }
              : { x: [0, -10, 0], opacity: 0.5 }
          }
          transition={{ duration: 1.5, repeat: isComplete ? 0 : Infinity, ease: "easeInOut" }}
        >
          <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg shadow-primary/10">
            <img src={toChain.icon} alt={toChain.name} className="h-9 w-9 rounded-full" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">{toChain.name}</span>
        </motion.div>

        {/* Traveling particle beam — left to center */}
        {!isComplete && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{ left: "70px", width: "60px" }}
            animate={{ opacity: [0, 1, 0], x: [0, 20, 40] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Traveling particle beam — center to right */}
        {!isComplete && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{ right: "70px", width: "60px" }}
            animate={{ opacity: [0, 0.5, 0], x: [0, 20, 40] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        )}
      </div>

      {/* Amount */}
      <motion.div
        className="text-center"
        animate={isComplete ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="text-3xl font-semibold tracking-tighter text-foreground">
          {amount.toLocaleString()} USDC
        </div>
        <div className={`text-sm mt-1 font-medium ${isComplete ? "text-success" : "text-primary"}`}>
          {statusLabel || (isComplete ? "Transfer complete!" : "Processing...")}
        </div>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <motion.div
              className="flex flex-col items-center gap-1 flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className={`h-2 w-full rounded-full transition-all duration-500 ${
                  i < activeStep
                    ? isComplete ? "bg-success" : "bg-primary"
                    : "bg-secondary"
                }`}
              />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {i < activeStep ? step.doneLabel : step.label}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

# Arc Router

**Trustless cross-chain USDC transfers in seconds, powered by Arc L1 and Circle CCTP V2.**

Built for [ETHGlobal HackMoney 2026](https://ethglobal.com/events/hackmoney2026) — [Arc Prize Track](https://ethglobal.com/events/hackmoney2026/prizes/arc)

---

## What is Arc Router?

Arc Router treats multiple blockchains as a single liquidity surface. Users deposit USDC on any supported chain, and it arrives on the destination chain — all routed through Arc L1 as a settlement hub.

No bridges. No wrapped tokens. Native USDC on every chain, powered by Circle's CCTP V2.

### How it works

```
Source Chain          Arc L1              Destination Chain
(Ethereum/Base/      (Settlement          (Ethereum/Base/
 Arbitrum)            Hub)                 Arbitrum)

  User burns   ──►  USDC settles  ──►   USDC minted
  USDC via           on Arc via          on destination
  CCTP V2            receiveMessage      via CCTP V2

     Hop 1              ArcRouter            Hop 2
  (depositForBurn)    (routeTransfer)     (receiveMessage)
```

1. **Hop 1** — User calls `depositForBurn` on the source chain. CCTP V2 burns USDC and emits a message.
2. **Settlement** — The relayer picks up Circle's attestation via the Iris API and calls `receiveMessage` on Arc, minting USDC there.
3. **Hop 2** — The ArcRouter contract on Arc approves and burns USDC via `depositForBurn` toward the destination chain.
4. **Delivery** — The relayer gets the second attestation and calls `receiveMessage` on the destination chain. USDC is minted to the recipient.

Total time: ~60-90 seconds on testnet (limited by Circle attestation speed).

---

## Demo

https://github.com/user-attachments/assets/demo-placeholder

> Connect wallet → Pick source/destination chains → Enter amount and recipient → Send → Watch the animated transfer progress in real-time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Transfer  │  │ Transfer │  │  Wallet (RainbowKit +  │ │
│  │   Form    │  │ Animation│  │  Wagmi + MetaMask)     │ │
│  └────┬─────┘  └────▲─────┘  └────────────────────────┘ │
│       │              │                                    │
│  ┌────▼─────┐  ┌────┴─────┐                             │
│  │useTransfer│  │useTransfer│                            │
│  │  (hooks) │  │  Status   │                             │
│  └────┬─────┘  └────▲─────┘                             │
│       │              │                                    │
│  ┌────▼──────────────┴─────┐                             │
│  │     API Routes          │                             │
│  │  POST /api/transfers    │                             │
│  │  GET  /api/transfers/:id│                             │
│  └────┬──────────────▲─────┘                             │
│       │              │                                    │
│  ┌────▼──────────────┴─────┐                             │
│  │    SQLite (Prisma)      │                             │
│  └────┬──────────────▲─────┘                             │
└───────┼──────────────┼───────────────────────────────────┘
        │              │
┌───────▼──────────────┴───────────────────────────────────┐
│                     Relayer                               │
│                                                           │
│  ┌─────────┐    ┌──────────┐    ┌─────────────────────┐  │
│  │  Hop 1  │───►│ ArcRouter│───►│      Hop 2          │  │
│  │ Attest  │    │  on Arc  │    │  Attest + Relay     │  │
│  │ + Relay │    │  (burn)  │    │  to Destination     │  │
│  └─────────┘    └──────────┘    └─────────────────────┘  │
│                                                           │
│  Polls Circle Iris API ←──── CCTP V2 Attestations        │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                  Smart Contracts                          │
│                                                           │
│  ArcRouter.sol (Arc Testnet)                             │
│  ├── routeTransfer() — Approve + burn USDC via CCTP V2  │
│  ├── setRelayer()    — Update authorized relayer         │
│  └── withdrawUsdc()  — Emergency withdrawal              │
│                                                           │
│  Uses Circle's deployed contracts:                        │
│  ├── TokenMessengerV2  (depositForBurn)                  │
│  └── MessageTransmitterV2 (receiveMessage)               │
└───────────────────────────────────────────────────────────┘
```

---

## Supported Networks

| Chain             | Chain ID   | CCTP Domain | USDC Address                                 |
|-------------------|------------|-------------|----------------------------------------------|
| Ethereum Sepolia  | 11155111   | 0           | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Arbitrum Sepolia  | 421614     | 3           | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |
| Base Sepolia      | 84532      | 6           | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Arc Testnet       | 5042002    | 26          | `0x3600000000000000000000000000000000000000` |

---

## Deployed Contracts

| Contract   | Network      | Address                                      |
|------------|--------------|----------------------------------------------|
| ArcRouter  | Arc Testnet  | `0x3E56fdBc57231570f56A1FCbe02251D32A4B273c` |

Circle CCTP V2 contracts (same on all testnets):
- **TokenMessengerV2**: `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`
- **MessageTransmitterV2**: `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275`

---

## Tech Stack

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Frontend         | Next.js 14, React 18, TailwindCSS, Framer Motion, shadcn/ui  |
| Wallet           | RainbowKit, Wagmi v2, Viem                                   |
| Backend / API    | Next.js API Routes                                            |
| Database         | SQLite via Prisma ORM                                         |
| Relayer          | Node.js (tsx), Viem wallet/public clients                     |
| Smart Contracts  | Solidity 0.8.24, Foundry (forge)                              |
| Monorepo         | pnpm workspaces, Turborepo                                    |
| Attestation API  | Circle Iris V2 Sandbox                                        |

---

## Project Structure

```
arc-router/
├── apps/web/                    # Next.js frontend + API + relayer
│   ├── src/
│   │   ├── app/                 # Pages, layout, API routes
│   │   │   ├── page.tsx         # Main transfer page (form + animation)
│   │   │   ├── api/transfers/   # REST API for transfer tracking
│   │   │   └── providers.tsx    # Wagmi + RainbowKit + React Query
│   │   ├── components/
│   │   │   ├── transfer/        # TransferAnimation
│   │   │   ├── layout/          # Header (Arc logo + ConnectButton), Footer
│   │   │   └── ui/              # Button, Popover (shadcn/ui)
│   │   ├── hooks/               # React hooks (all the blockchain logic)
│   │   │   ├── useTransfer.ts   # Approve → burn → submit orchestration
│   │   │   ├── useUsdcBalance.ts
│   │   │   ├── useUsdcApproval.ts
│   │   │   ├── useDepositForBurn.ts
│   │   │   └── useTransferStatus.ts
│   │   ├── relayer/             # Offchain relayer process
│   │   │   ├── index.ts         # Main loop
│   │   │   ├── hop1.ts          # Source → Arc attestation + relay
│   │   │   ├── hop2.ts          # Arc → Destination burn + relay
│   │   │   ├── clients.ts       # Viem wallet/public clients
│   │   │   └── utils.ts         # Attestation polling, helpers
│   │   └── lib/                 # Shared utilities
│   │       ├── chains.ts        # Chain display info
│   │       ├── transferStatus.ts # Status → animation step mapping
│   │       ├── utils.ts         # cn() utility
│   │       └── wagmi.ts         # Wagmi config
│   └── prisma/
│       └── schema.prisma        # Transfer database model
├── packages/
│   ├── contracts/               # Foundry project
│   │   ├── src/ArcRouter.sol    # Main contract
│   │   ├── test/ArcRouter.t.sol # Forge tests
│   │   └── script/Deploy.s.sol  # Deployment script
│   └── shared/                  # Shared constants, types, ABIs
│       └── src/
│           ├── constants.ts     # Contract addresses, CCTP domains
│           ├── types/           # Transfer type definitions
│           └── abis/            # Contract ABIs
└── turbo.json                   # Turborepo config
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contract deployment)
- A wallet with testnet ETH on the chains you want to test

### 1. Clone and install

```bash
git clone https://github.com/your-username/arc-router.git
cd arc-router
pnpm install
```

### 2. Set up environment

```bash
cp .env.example apps/web/.env
```

Edit `apps/web/.env`:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""     # Get from cloud.walletconnect.com
RELAYER_PRIVATE_KEY="0x..."                 # Private key for the relayer EOA
NEXT_PUBLIC_ARC_ROUTER_ADDRESS="0x3E56fdBc57231570f56A1FCbe02251D32A4B273c"
CCTP_ATTESTATION_API="https://iris-api-sandbox.circle.com"
ARC_TESTNET_RPC_URL="https://rpc.testnet.arc.network"
```

### 3. Set up database

```bash
cd apps/web
pnpm db:generate
pnpm db:push
```

### 4. Deploy ArcRouter (optional — already deployed)

```bash
cd packages/contracts
export RELAYER_ADDRESS=0xYourRelayerAddress
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast -vvv
```

### 5. Run the app

In one terminal — start the web app:
```bash
cd apps/web
pnpm dev
```

In another terminal — start the relayer:
```bash
cd apps/web
pnpm relayer
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Use

1. **Connect your wallet** using the button in the top-right corner
2. **Select source and destination chains** from the dropdowns
3. **Enter the USDC amount** — your balance is shown automatically
4. **Enter the recipient address** (can be your own address on the destination chain)
5. **Click Send** — MetaMask will prompt for two transactions:
   - Approve USDC spending
   - `depositForBurn` (burns USDC on source chain)
6. **Watch the animation** as the transfer progresses through 4 stages:
   - Depositing → Settling on Arc → Sending → Delivered
7. The relayer handles everything else automatically

---

## Transfer Lifecycle

```
User Action          Status              What Happens
─────────────────────────────────────────────────────────────
Click "Send"    →    ATTESTING_HOP1      USDC burned on source chain
                                         Relayer polls Iris API for attestation
                →    RELAYING_TO_ARC     Attestation received, relaying to Arc
                →    SETTLED_ON_ARC      USDC minted on Arc
                →    BURNING_ON_ARC      ArcRouter burns USDC toward destination
                →    ATTESTING_HOP2      Relayer polls for second attestation
                →    RELAYING_TO_DEST    Attestation received, relaying to dest
                →    COMPLETED           USDC minted on destination chain
```

---

## Smart Contract

### ArcRouter.sol

Deployed on Arc Testnet. Called by the relayer after hop 1 settlement.

```solidity
function routeTransfer(
    bytes32 transferId,     // Unique transfer ID for tracking
    uint256 amount,         // USDC amount (6 decimals)
    uint32 destinationDomain, // CCTP domain of destination
    bytes32 recipient       // Recipient address (bytes32-padded)
) external onlyRelayer
```

**Flow:** Checks USDC balance → Approves TokenMessengerV2 → Calls `depositForBurn` → Emits `TransferRouted` event.

### Running Tests

```bash
cd packages/contracts
forge test -vvv
```

---

## Prize Category

**Best Chain Abstracted USDC Apps Using Arc as a Liquidity Hub** ($5,000)

Arc Router uses Arc L1 as a central liquidity hub for USDC. Instead of point-to-point bridges between every chain pair, all transfers route through Arc — creating a single settlement layer that connects Ethereum, Base, and Arbitrum.

- Users don't need to know about Arc — they pick source and destination chains, and the routing is handled automatically
- USDC is never wrapped or synthetic — it's native Circle USDC on every chain via CCTP V2
- The ArcRouter contract on Arc acts as the hub, receiving USDC from any chain and forwarding it to any other supported chain
- The relayer automates the two-hop process, polling Circle's Iris API and submitting relay transactions

---

## Team

Built by **Siddharth** at ETHGlobal HackMoney 2026.

---

## License

MIT

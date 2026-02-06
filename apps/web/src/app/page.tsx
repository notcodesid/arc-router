import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="text-arc-400">Arc</span> Router
        </h1>
        <p className="mb-4 text-xl text-gray-400">
          Cross-chain USDC transfers in seconds, not minutes.
        </p>
        <p className="mb-12 text-lg text-gray-500">
          Powered by Circle CCTP V2 and Arc L1 for instant settlement across
          Ethereum, Base, and Arbitrum.
        </p>

        <div className="mb-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/transfer" className="btn-primary text-lg">
            Start Transfer
          </Link>
          <Link href="/history" className="btn-secondary text-lg">
            View History
          </Link>
        </div>

        {/* Flow Diagram */}
        <div className="card mx-auto max-w-xl">
          <h3 className="mb-6 text-lg font-semibold text-gray-300">
            How it works
          </h3>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arc-600/20 text-arc-400">
                1
              </div>
              <span className="text-gray-400">Source Chain</span>
              <span className="text-xs text-gray-600">Burn USDC</span>
            </div>
            <div className="h-px flex-1 bg-gray-700" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arc-600/20 text-arc-400">
                2
              </div>
              <span className="text-gray-400">Arc L1</span>
              <span className="text-xs text-gray-600">Settle & Route</span>
            </div>
            <div className="h-px flex-1 bg-gray-700" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arc-600/20 text-arc-400">
                3
              </div>
              <span className="text-gray-400">Dest Chain</span>
              <span className="text-xs text-gray-600">Mint USDC</span>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            Two CCTP V2 hops with fast finality. ~20-40 seconds total.
          </p>
        </div>
      </div>
    </div>
  );
}

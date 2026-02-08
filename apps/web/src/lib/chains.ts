export interface ChainInfo {
  id: number;
  name: string;
  icon: string;
  color: string;
  nativeCurrency: string;
}

export const chains: ChainInfo[] = [
  { id: 84532, name: "Base Sepolia", icon: "/chains/base.png", color: "hsl(217, 91%, 60%)", nativeCurrency: "ETH" },
  { id: 421614, name: "Arbitrum Sepolia", icon: "/chains/arbitrum.png", color: "hsl(210, 80%, 55%)", nativeCurrency: "ETH" },
  { id: 11155111, name: "Ethereum Sepolia", icon: "/chains/ethereum.png", color: "hsl(230, 50%, 55%)", nativeCurrency: "ETH" },
];

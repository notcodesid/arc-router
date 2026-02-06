export const ArcRouterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_tokenMessenger",
        type: "address",
        internalType: "address",
      },
      { name: "_usdc", type: "address", internalType: "address" },
      { name: "_relayer", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeTransfer",
    inputs: [
      { name: "transferId", type: "bytes32", internalType: "bytes32" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "destinationDomain", type: "uint32", internalType: "uint32" },
      { name: "recipient", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "relayer",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenMessenger",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setRelayer",
    inputs: [
      { name: "_relayer", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "TransferRouted",
    inputs: [
      {
        name: "transferId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "destinationDomain",
        type: "uint32",
        indexed: false,
        internalType: "uint32",
      },
      {
        name: "recipient",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
] as const;

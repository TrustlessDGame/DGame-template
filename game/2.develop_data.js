// YOUR_ASSETS
let GAME_ASSETS = {
  create_wasm: "bfs://42070/0x0C7d44Ac4959eeB42e8D5f8792738D779a545F7E/0xE55EAdE1B17BbA28A80a71633aF8C15Dc2D556A5/create.wasm",
  create_0001_zkey: "bfs://42070/0x0C7d44Ac4959eeB42e8D5f8792738D779a545F7E/0xE55EAdE1B17BbA28A80a71633aF8C15Dc2D556A5/create_0001.zkey",
  move_wasm: "bfs://42070/0x0C7d44Ac4959eeB42e8D5f8792738D779a545F7E/0xE55EAdE1B17BbA28A80a71633aF8C15Dc2D556A5/move.wasm",
  move_0001_zkey: "bfs://42070/0x0C7d44Ac4959eeB42e8D5f8792738D779a545F7E/0xE55EAdE1B17BbA28A80a71633aF8C15Dc2D556A5/move_0001.zkey",
};
// YOUR GAME CONTRACT ABI JSON INTERFACE
const GAME_CONTRACT_ABI_INTERFACE_JSON = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "move",
        type: "string",
      },
    ],
    name: "Click",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "move",
        type: "string",
      },
    ],
    name: "ClickEvent",
    type: "event",
  },
  {
    inputs: [],
    name: "Reset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playboard",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PlayboardView",
    outputs: [
      {
        internalType: "string",
        name: "result",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMove",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

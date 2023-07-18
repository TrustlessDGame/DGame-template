
const BFS_CONTRACTT_ADDRESS = "0x0C7d44Ac4959eeB42e8D5f8792738D779a545F7E";
const GAME_TOKEN_ERC20_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAME_NFT_ERC721_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAME_TOKEN_ERC1155_ADDRESS = "0x0000000000000000000000000000000000000000";
const GAME_ID = 1;
const SALT_PASS = "1234";

const GAME_ASSETS = {
    asset_1: "bfs://42070/0xE55EAdE1B17BbA28A80a71633aF8C15Dc2D556A5/cryptojsmin@4.1.1.js",
};
const GAME_CONTRACT_ADDRESS = "0x9A63FF46dfA34296a2CBd5A0F0a3AB28d27Ebc07";
// YOUR GAME PLAY CONTRACT HERE
const GAME_CONTRACT_ABI_INTERFACE_JSON = [{
    "inputs": [{
        "internalType": "uint256", "name": "x", "type": "uint256"
    }, {
        "internalType": "uint256", "name": "y", "type": "uint256"
    }, {
        "internalType": "string", "name": "move", "type": "string"
    }], "name": "Click", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [], "name": "Reset", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [], "stateMutability": "nonpayable", "type": "constructor"
}, {
    "inputs": [{
        "internalType": "uint256", "name": "", "type": "uint256"
    }, {
        "internalType": "uint256", "name": "", "type": "uint256"
    }], "name": "playboard", "outputs": [{
        "internalType": "string", "name": "", "type": "string"
    }], "stateMutability": "view", "type": "function"
}, {
    "inputs": [], "name": "PlayboardView", "outputs": [{
        "internalType": "string", "name": "result", "type": "string"
    }], "stateMutability": "view", "type": "function"
}, {
    "inputs": [], "name": "totalMove", "outputs": [{
        "internalType": "uint256", "name": "", "type": "uint256"
    }], "stateMutability": "view", "type": "function"
}]
// YOUR GAME PLAY CONTRACT HERE
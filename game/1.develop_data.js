const GAME_CONTRACT_ADDRESS = "0x9A63FF46dfA34296a2CBd5A0F0a3AB28d27Ebc07";// YOUR_GAME_CONTRACT_ADDRESS
const GAME_TOKEN_ERC20_ADDRESS = "YOUR_ERC_20_CONTRACT_ADDRESS";
const GAME_NFT_ERC721_ADDRESS = "YOUR_ERC_721_CONTRACT_ADDRESS";
const GAME_TOKEN_ERC1155_ADDRESS = "YOUR_ERC_721_CONTRACT_ADDRESS";

// YOUR_ASSETS
const GAME_ASSETS = {
    asset_1: "./assets/1",
};
// YOUR GAME CONTRACT ABI JSON INTERFACE
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
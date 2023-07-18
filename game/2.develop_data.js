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
    "inputs": [], "stateMutability": "nonpayable", "type": "constructor"
}, {
    "anonymous": false, "inputs": [{
        "indexed": false, "internalType": "uint256", "name": "x", "type": "uint256"
    }, {
        "indexed": false, "internalType": "uint256", "name": "y", "type": "uint256"
    }, {
        "indexed": false, "internalType": "string", "name": "move", "type": "string"
    }], "name": "ClickEvent", "type": "event"
}, {
    "inputs": [], "name": "Reset", "outputs": [], "stateMutability": "nonpayable", "type": "function"
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
// DO NOT EDIT
let web3;

function preload() {
    web3 = new Web3(Web3.givenProvider)
    if (!window.ethereum) {
        alert('Please install metamask')
    }
}

preload();
// DO NOT EDIT
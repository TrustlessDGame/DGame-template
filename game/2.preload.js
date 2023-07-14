// DO NOT EDIT
let provider;

function preload() {
  if (!window.ethereum) {
    alert("Please install metamask");
    return;
  }
  // provider = new ethers.providers.Web3Provider(window.ethereum);
  const rpcUrl = "https://l2-node.regtest.trustless.computer/"; // Replace with your RPC URL
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);
}

preload();
// DO NOT EDIT

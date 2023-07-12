// DO NOT EDIT
let provider;

function preload() {
  if (!window.ethereum) {
    alert("Please install metamask");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
}

preload();
// DO NOT EDIT

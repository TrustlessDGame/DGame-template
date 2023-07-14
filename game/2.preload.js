// DO NOT EDIT
let provider;

function preload() {
  if (!window.ethereum) {
    alert("Please install metamask");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
}

function importUIDefault() {
  const header = document.createElement("header");
  header.id = "header";
  document.body.insertBefore(header, document.body.firstChild);
}

preload();
importUIDefault();
// DO NOT EDIT

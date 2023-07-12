// DO NOT EDIT

async function getWalletAddress() {
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  const currentAddress = accounts[0];
  console.log("Current address:", currentAddress);
  localStorage.setItem("walletData", currentAddress);
}

class WalletData {
  Wallet;
  Balance;

  constructor() {}

  async connectWallet() {
    // Check if Metamask is available in the browser
    if (!window.ethereum || typeof window.ethereum === "undefined") {
      alert("Please install Metamask to connect your wallet.");
      return;
    }

    let walletData = localStorage.getItem("walletData");

    if (walletData) return;

    try {
      //   window.ethereum.enable();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      getWalletAddress();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  async LoadWallet() {
    let walletData = localStorage.getItem("walletData");
    if (walletData == null) {
      console.log("not exist wallet");
      let account = web3.eth.accounts.create(web3.utils.randomHex(32));
      let wallet = web3.eth.accounts.wallet.add(account);
      let keystore = wallet.encrypt(web3.utils.randomHex(32));
      walletData = {
        account: account,
        wallet: wallet,
        keystore: keystore,
      };
      localStorage.setItem("walletData", JSON.stringify(walletData));
    } else {
      console.log("exist wallet");
      walletData = JSON.parse(walletData);
    }
    this.Wallet = walletData;
    this.Balance = await web3.eth.getBalance(this.Wallet.account.address);
    console.log(
      this.Wallet.account.address,
      web3.utils.fromWei(this.Balance.toString()),
      "TC"
    );
  }
}

let wallet = new WalletData();
wallet.connectWallet();
// wallet.LoadWallet();
// DO NOT EDIT

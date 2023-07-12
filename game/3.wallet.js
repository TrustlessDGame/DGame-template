// DO NOT EDIT
class WalletData {
    Wallet;
    Balance;

    constructor() {
    }

    async LoadWallet() {
        let walletData = localStorage.getItem("walletData");
        if (walletData == null) {
            console.log("not exist wallet");
            let account = web3.eth.accounts.create(web3.utils.randomHex(32));
            let wallet = web3.eth.accounts.wallet.add(account);
            let keystore = wallet.encrypt(web3.utils.randomHex(32));
            walletData = {
                account: account, wallet: wallet, keystore: keystore
            };
            localStorage.setItem("walletData", JSON.stringify(walletData));
        } else {
            console.log("exist wallet");
            walletData = JSON.parse(walletData)
        }
        this.Wallet = walletData
        this.Balance = await web3.eth.getBalance(this.Wallet.account.address);
        console.log(this.Wallet.account.address, web3.utils.fromWei(this.Balance.toString()), "TC");
    }
}

let wallet = new WalletData();
wallet.LoadWallet();
// DO NOT EDIT
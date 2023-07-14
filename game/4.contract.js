// DO NOT EDIT
class ContractInteraction {
  provider;
  WalletData;

  constructor() {}

  loadContract(abiJson, contractAddress) {
    const wallet = new ethers.Wallet(
      this.WalletData.Wallet.privateKey,
      provider
    );
    const signer = wallet.connect(provider);
    let contract = new ethers.Contract(contractAddress, abiJson, signer);
    return contract;
  }

  checkTransactionStatus(txHash) {
    return new Promise(async (resolve, reject) => {
      try {
        let intervalId;

        const checkStatus = async () => {
          try {
            const receipt = await provider.getTransactionReceipt(txHash);

            if (receipt && receipt.blockNumber) {
              console.log(
                "Transaction confirmed in block:",
                receipt.blockNumber
              );
              clearInterval(intervalId);
              resolve(receipt);
            } else {
              console.log("Transaction is still pending.");
            }
          } catch (error) {
            console.log("Error retrieving transaction receipt:", error);
            clearInterval(intervalId);
            reject(error);
          }
        };

        intervalId = setInterval(checkStatus, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  async signAndSendTx(tx) {
    const wallet = new ethers.Wallet(
      this.WalletData.Wallet.privateKey,
      provider
    );
    const signedTx = await wallet.signTransaction(tx);

    if (signedTx.rawTransaction != null) {
      let sentTx = await this.provider.sendTransaction(signedTx.rawTransaction);

      sentTx = await sentTx.wait(); // Wait for transaction confirmation
      return sentTx;
    }
  }

  async Call(abiJson, contractAddress, methodWithParams, ...params) {
    console.log(
      "Call contract",
      contractAddress,
      "method",
      methodWithParams,
      "with params",
      params
    );
    const contract = this.loadContract(abiJson, contractAddress);
    return await contract.functions[methodWithParams.replace(/\s/g, "")](
      ...params
    );
  }

  async Send(
    abiJson,
    contractAddress,
    nonce,
    gas,
    methodWithParams,
    ...params
  ) {
    console.log(
      "Send tx to contract",
      contractAddress,
      "method",
      methodWithParams,
      "with params",
      params
    );

    const contract = this.loadContract(abiJson, contractAddress);
    const tx = await contract.functions[methodWithParams.replace(/\s/g, "")](
      ...params
    );
    const receipt = await this.checkTransactionStatus(tx.hash);
    return receipt;
  }
}

let contractInteraction = new ContractInteraction();
contractInteraction.WalletData = wallet;
contractInteraction.provider = provider;
// DO NOT EDIT

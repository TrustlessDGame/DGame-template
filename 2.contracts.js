class ContractInteraction {
    Web3;
    WalletData;

    constructor() {
    }

    loadContract(abiJson, contractAddress) {
        let contract = new this.Web3.eth.Contract(abiJson, contractAddress);
        return contract;
    }

    async signAndSendTx(tx) {
        const signedTx = this.Web3.eth.accounts.signTransaction(tx, WalletData.account.privateKey);
        if (signedTx.rawTransaction != null) {
            let sentTx = await this.Web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, txHash) {
                if (!err) {
                    console.log("The hash of your transaction is: ", hash, "\nCheck mempool to view the status of your transaction!")
                } else {
                    console.log("Something went wrong when submitting your transaction:", err)
                }
            });
            return sentTx;
        }
    }

    async Call(abiJson, contractAddress, methodWithParams, ...params) {
        console.log("Call contract", contractAddress, "method", methodWithParams, "with params", params);
        const contract = this.loadContract(abiJson, contractAddress)
        const tx = {
            from: this.WalletData.from, to: contractAddress,
        }
        const methods = contract.methods;
        return await methods[methodWithParams.replace(/\s/g, '')](...params).call(tx);
    }

    async Send(abiJson, contractAddress, nonce, gas, methodWithParams, ...params) {
        console.log("Send tx to contract", contractAddress, "method", methodWithParams, "with params", params);
        const contract = this.loadContract(abiJson, contractAddress)
        const methods = contract.methods;
        const method = methods[methodWithParams.replace(/\s/g, '')](...params);
        if (nonce == 0) {
            nonce = await this.Web3.eth.getTransactionCount(this.WalletData.account.address, "latest") //get latest nonce
        }
        const tx = {
            from: this.WalletData.from, to: contractAddress, nonce: nonce, gas: gas, data: method
        }
        if (tx.gas == 0) {
            tx.gas = await method.estimateGas(tx);
        }
        return await this.signAndSendTx(tx);
    }

}

let contractInteraction = new ContractInteraction();
contractInteraction.WalletData = wallet;
contractInteraction.Web3 = web3;
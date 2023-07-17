// DO NOT EDIT
const NAME_KEY = "walletData";
const ACCOUNT_KEY = "ACCOUNT_CIPHER_TEXT";
const ADDRESS_KEY = "ADDRESS_STORAGE";
const PASS_WORD = "NUMBER_STORAGE_L2";

const doubleHash = (key) => {
  const hash = CryptoJS.SHA256(key);
  return CryptoJS.SHA256(hash).toString();
};

const encryptAES = (text, key) => {
  const password = doubleHash(key);
  return CryptoJS.AES.encrypt(text, password).toString();
};

const decryptAES = (cipherText, key) => {
  const password = doubleHash(key);
  const decrypted = CryptoJS.AES.decrypt(cipherText, password);
  const str = decrypted.toString(CryptoJS.enc.Utf8);

  if (decrypted) {
    if (str.length > 0) {
      return str;
    }
  }
  return "";
};

const formatAddress = (address) => {
  const prefixLength = 4;
  const suffixLength = 4;

  const truncatedAddress = `${address.slice(0, prefixLength)}...${address.slice(
    -suffixLength
  )}`;

  return truncatedAddress;
};

const handleCopy = (wallet) => {
  navigator.clipboard
    .writeText(wallet)
    .then(() => {
      alert("Copied successfully");
    })
    .catch((error) => {
      console.error("Error copying text:", error);
    });
};

function isValidPrivateKey(privateKey) {
  try {
    const key = CryptoJS.enc.Hex.parse(privateKey);
    return key.sigBytes === 32;
  } catch (error) {
    return false;
  }
}
let isLoading = false;

class WalletData {
  Wallet;
  Balance;

  constructor() {}

  async _onGetWalletAddress() {
    const currentAddress = window.ethereum.selectedAddress;
    return currentAddress;
  }

  async _getBalance() {
    if (!this.Wallet.address) {
      return null;
    }

    try {
      const balance = await provider.getBalance(this.Wallet.address);
      const formatBalance = ethers.utils.formatEther(balance);

      this.Balance = formatBalance;
      const isEsixtBalanceUI =
        document.querySelectorAll(".balance-ui").length > 0;

      if (isEsixtBalanceUI) {
        const displayBalance = document.getElementById("display-balance");
        displayBalance.textContent = formatBalance;
        return;
      }

      this._loadBalanceUI();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  _formatWalletData(walletData) {
    return {
      privateKey: decryptAES(
        walletData[ACCOUNT_KEY],
        decryptAES(walletData[PASS_WORD], SALT_PASS) + SALT_PASS
      ),
      address: walletData[ADDRESS_KEY],
      password: decryptAES(walletData[PASS_WORD], SALT_PASS),
    };
  }

  async _onWithdraw(toAddress, amount) {
    try {
      const wallet = new ethers.Wallet(this.Wallet.privateKey, provider);
      const amountEther = ethers.utils.parseEther(amount);

      const gasLimit = 500000;
      const gasPrice = ethers.utils.parseUnits("1", "gwei");

      // Build the transaction object
      const transaction = {
        to: toAddress,
        value: amountEther,
      };
      const customGas = {
        gasLimit,
        gasPrice,
      };

      // Send the signed transaction
      const txResponse = await wallet.sendTransaction(transaction, customGas);
      if (txResponse) {
        this._closeAllModal();
        this._loadModalLoading("Processing...");
      }

      // Wait for the transaction to be mined
      await txResponse.wait();

      this._getBalance();
      this._closeAllModal();
    } catch (error) {
      console.log(error);
    }
  }

  async _onTopup(amount) {
    if (!amount || amount <= 0) {
      alert("amount invalid");
      return;
    }
    try {
      // Connect to MetaMask wallet
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();

      // Define the recipient's address and transfer amount
      const recipientAddress = this.Wallet.address;
      const transferAmount = ethers.utils.parseEther(amount);

      // Create a new transaction
      const transaction = {
        to: recipientAddress,
        value: transferAmount,
      };

      // Send the transaction
      const txResponse = await signer.sendTransaction(transaction);

      if (txResponse) {
        this._closeAllModal();
        this._loadModalLoading("Processing...");
      }

      // Wait for the transaction to be mined
      await txResponse.wait();

      this._getBalance();
      this._closeAllModal();
    } catch (error) {
      console.log(error);
    }
  }

  _onExportPrivateKey(password) {
    const walletData = JSON.parse(
      localStorage.getItem(`${NAME_KEY}_${GAME_ID}`)
    );
    const prvKey = decryptAES(walletData[ACCOUNT_KEY], password + SALT_PASS);
    if (!prvKey) {
      alert("Password incorrect!");
      return;
    }
    const formatPrvKey = formatAddress(prvKey);
    const modalAccount = document.getElementById("modal-account");
    modalAccount.innerHTML = `
    <div class="show-key">
      Your private key: <span class="text-gray">${formatPrvKey}</span>
    </div>
    <div class="action">
      <button class="btn-default primary w-full mt-medium" id="btn-copy-prvKey">Click to copy</button>
    </div>
    `;

    document
      .getElementById("btn-copy-prvKey")
      .addEventListener("click", function () {
        handleCopy(prvKey);
      });
  }

  _onImportPrivateKey = (prvKey, password) => {
    const address = new ethers.Wallet(prvKey).address;
    // Create game key
    const finalPassword = password + SALT_PASS;
    // Create hash private key
    const hashPrvKey = encryptAES(prvKey, finalPassword);

    let walletData = {
      [ACCOUNT_KEY]: hashPrvKey,
      [ADDRESS_KEY]: address,
      [PASS_WORD]: encryptAES(password, SALT_PASS),
    };

    // Store on storage
    localStorage.setItem(`${NAME_KEY}_${GAME_ID}`, JSON.stringify(walletData));

    this.Wallet = this._formatWalletData(walletData);
    alert("Import prvkey successfully!");
    this._checkLogin();
  };

  async _generateAccount(password) {
    // Create new private key
    const id = CryptoJS.lib.WordArray.random(32);
    const prvKey = "0x" + id;
    const address = new ethers.Wallet(prvKey).address;

    // Create game key
    const finalPassword = password + SALT_PASS;
    // Create hash private key
    const hashPrvKey = encryptAES(prvKey, finalPassword);

    let walletData = {};
    walletData[ACCOUNT_KEY] = hashPrvKey;
    walletData[ADDRESS_KEY] = address;
    walletData[PASS_WORD] = encryptAES(password, SALT_PASS);

    // Store on storage
    localStorage.setItem(`${NAME_KEY}_${GAME_ID}`, JSON.stringify(walletData));

    this.Wallet = this._formatWalletData(walletData);
    alert("Generate prvkey successfully!");
    this._checkLogin();
  }

  _closeAllModal() {
    const wrapModals = document.querySelectorAll(".wrap-modal");
    wrapModals.forEach((item) => {
      item.remove();
    });
  }

  _loadModalLoading(content) {
    const modalLoading = document.createElement("div");
    modalLoading.classList = "wrap-modal";

    modalLoading.innerHTML = `
      <div class="loading-content">
        ${content}
      </div>
    `;

    document.body.appendChild(modalLoading);
  }

  _loadBalanceUI() {
    const balanceUI = document.createElement("div");
    const header = document.getElementById("header");

    balanceUI.classList.add("balance-ui");

    balanceUI.innerHTML = `
    <div class="inner">Balance: <span class="display" id="display-balance">${this.Balance} TC</span></div>
   `;

    // document.body.appendChild(balanceUI);
    header.insertBefore(balanceUI, header.firstChild);
  }

  _loadModalWithdraw() {
    const modalWithdraw = document.createElement("div");
    modalWithdraw.classList.add("wrap-modal");
    modalWithdraw.innerHTML = `
    <div class="bg-modal" id="bg-modal-withdraw"></div>
      <div class="modal modal-topup">
        <div class="form-inner">
          <p class="title-form">Withdraw</p>
          <div class="item">
            <label>To Address</label>
            <div class="address-input">
              <input id="addressInput" type="text" class="input-style" />
            </div>
          </div>
          <div class="item">
            <label>Amount</label>
            <div class="withdraw-input">
              <input id="withdrawInput" type="text" class="input-style" />
              <button id="max-btn">max</button>
            </div>
          </div>
          <div class="item">
            <button class="submit" id="submitWithdraw">Withdraw</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalWithdraw);
    // Click outside to close
    const bgModal = document.getElementById("bg-modal-withdraw");
    bgModal.addEventListener("click", () => {
      modalWithdraw.remove();
    });

    const withdrawInput = document.getElementById("withdrawInput");
    const addressInput = document.getElementById("addressInput");
    const submitBtn = document.getElementById("submitWithdraw");
    const maxBtn = document.getElementById("max-btn");

    const isValidation = () => {
      if (!withdrawInput.value || !addressInput.value) {
        alert("Input is empty");
        return false;
      }
      if (withdrawInput.value > this.Balance) {
        alert("Amount can't higher your balance");
        return false;
      }

      return true;
    };

    maxBtn.addEventListener(
      "click",
      async function () {
        // Estimate the gas price
        // const gasPrice = await provider.getGasPrice();
        // const gasLimit = 40000;
        const gasLimit = 500000;
        const gasPrice = ethers.utils.parseUnits("1", "gwei");

        const transactionCost = ethers.utils.formatEther(
          gasPrice.mul(gasLimit)
        );

        const showBalance = (
          parseFloat(this.Balance) - parseFloat(transactionCost)
        ).toString();
        withdrawInput.value = showBalance;
      }.bind(this)
    );

    submitBtn.addEventListener(
      "click",
      function () {
        if (isValidation()) {
          console.log("withdrawInput.value: ", withdrawInput.value);
          this._onWithdraw(addressInput.value, withdrawInput.value);
        }
      }.bind(this)
    );
  }

  _loadModalTopup() {
    const modalTopup = document.createElement("div");
    modalTopup.classList.add("wrap-modal");
    modalTopup.innerHTML = `
    <div class="bg-modal" id="bg-modal-topup"></div>
      <div class="modal modal-topup">
        <div class="form-inner">
          <p class="title-form">Topup</p>
          <div class="item">
            <label>Amount</label>
            <div class="topup-input">
              <input id="topupInput" type="text" class="input-style" />
            </div>
          </div>
          <div class="item">
            <button class="submit" id="submitTopup">Topup</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalTopup);
    // Click outside to close
    const bgModal = document.getElementById("bg-modal-topup");
    bgModal.addEventListener("click", () => {
      modalTopup.remove();
    });

    const topupInput = document.getElementById("topupInput");
    const submitBtn = document.getElementById("submitTopup");

    submitBtn.addEventListener(
      "click",
      async function () {
        const isConnectWallet = await this._isConnectedMetamask();

        if (!isConnectWallet) {
          (async () => {
            await this._oncConnectWallet();
            await checkAndSwitchNetwork();
            window.ethereum.on("chainChanged", (chainId) => {
              if (chainId) {
                this._onTopup(topupInput.value);
              }
            });
          })();
          return;
        }
        console.log("aaaaaaa");
        this._onTopup(topupInput.value);
      }.bind(this)
    );
  }

  _loadAccountDetail() {
    if (!this.Wallet) return;

    var header = document.getElementById("header");
    const headerActions = document.createElement("div");
    headerActions.classList.add("header-actions");

    headerActions.innerHTML = `
        <div class="inner">
          <button class="btn-withdraw btn-default" id="btn-withdraw">Withdraw</button>
          <button class="btn-topup btn-default" id="btn-topup">Topup</button>
          <button class="btn-export btn-default" id="btn-export">Export private key</button>
          <button class="wallet-display btn-default" id="wallet-display">${formatAddress(
            this.Wallet.address
          )}</button>
        </div>
      `;
    header.insertBefore(headerActions, header.firstChild);

    const walletDisplay = document.getElementById("wallet-display");
    const btnTopup = document.getElementById("btn-topup");
    const btnWithdraw = document.getElementById("btn-withdraw");
    const btnExport = document.getElementById("btn-export");

    btnExport.addEventListener(
      "click",
      function () {
        this._loadModalAccount("export");
      }.bind(this)
    );

    btnTopup.addEventListener(
      "click",
      function () {
        this._loadModalTopup();
      }.bind(this)
    );

    btnWithdraw.addEventListener(
      "click",
      function () {
        this._loadModalWithdraw();
      }.bind(this)
    );

    walletDisplay.addEventListener(
      "click",
      function () {
        handleCopy(this.Wallet.address);
      }.bind(this)
    );

    return;
  }

  _loadModalAccount(type) {
    // Import Modal
    const modalAccount = document.createElement("div");
    modalAccount.classList.add("wrap-modal");

    modalAccount.innerHTML = `
    <div class="bg-modal" id="bg-modal-account"></div>
    <div class="modal modal-account" id="modal-account">
      <form autocomplete="off" class="form-account">
        <div class="form-inner">
          ${
            type === "import"
              ? `
          <div class="item">
          <label>Your private key</label>
          <div class="password-input">
            <input id="keyInput" type="text" />
          </div>
        </div>
          `
              : ""
          }
          <div class="item">
            <label>Password</label>
            <div class="password-input">
              <input id="passwordInput" type="password" />
              <i id="passwordToggle" class="toggle-icon fa fa-eye"></i>
            </div>
          </div>
          <div class="item">
            <label>Confirm Password</label>
            <div class="password-input">
              <input id="confirmPasswordInput" type="password" />
              <i id="confirmPasswordToggle" class="toggle-icon fa fa-eye"></i>
            </div>
          </div>
          <button id="submitButton" class="submit" type="submit">Submit</button>
        </div>
      </form>
    </div>`;

    document.body.appendChild(modalAccount);

    // Click outside to close
    const bgModal = document.getElementById("bg-modal-account");
    bgModal.addEventListener("click", () => {
      modalAccount.remove();
    });

    // Handle form's action
    const keyInput = document.getElementById("keyInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordInput = document.getElementById(
      "confirmPasswordInput"
    );
    const submitButton = document.getElementById("submitButton");
    const passwordToggle = document.getElementById("passwordToggle");
    const confirmPasswordToggle = document.getElementById(
      "confirmPasswordToggle"
    );

    submitButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        if (validateForm()) {
          const password = passwordInput?.value;

          switch (type) {
            case "create-new":
              this._generateAccount(password);
              modalAccount.remove();
              break;
            case "export":
              this._onExportPrivateKey(password);
              break;
            case "import":
              const privateKey = keyInput?.value.trim();
              this._onImportPrivateKey(privateKey, password);
              modalAccount.remove();
              break;
            default:
              break;
          }
        }
      }.bind(this)
    );

    function validateForm() {
      if (type === "import" && !isValidPrivateKey(keyInput?.value.trim())) {
        alert("Malformed private key or empty");
        return;
      }
      if (passwordInput.value === "" || confirmPasswordInput.value === "") {
        alert("Please enter both passwords");
        return false;
      } else if (passwordInput.value !== confirmPasswordInput.value) {
        alert("Passwords do not match");
        return false;
      }
      return true;
    }

    // Toggle xem password
    passwordToggle.addEventListener("click", function () {
      togglePasswordVisibility(passwordInput, passwordToggle);
    });

    confirmPasswordToggle.addEventListener("click", function () {
      togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
    });

    function togglePasswordVisibility(input, toggleIcon) {
      if (input.type === "password") {
        input.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
      }
    }
  }

  _loadModalActions() {
    const modalActions = document.createElement("div");
    modalActions.classList.add("wrap-modal");

    modalActions.innerHTML = `
    <div class="bg-modal" id="bg-modal-action"></div>
    <div class="modal modal-acitons">
      <div class="row">
        <button class="btn-default primary" id="action-create">Create new account</button>
        <button class="btn-default gray" id="action-import">Import private key</button>
      </div>
      </div>
    `;

    document.body.appendChild(modalActions);

    const actionCreate = document.getElementById("action-create");
    const actionImport = document.getElementById("action-import");
    const bgModal = document.getElementById("bg-modal-action");

    // Click outside to close
    bgModal.addEventListener("click", () => {
      modalActions.remove();
    });

    // Select action
    actionCreate.addEventListener(
      "click",
      function () {
        this._loadModalAccount("create-new");
        modalActions.remove();
      }.bind(this)
    );

    actionImport.addEventListener(
      "click",
      function () {
        this._loadModalAccount("import");
        modalActions.remove();
      }.bind(this)
    );
  }

  async _oncConnectWallet() {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  async _isConnectedMetamask() {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      return true;
    }
    return false;
  }

  async _checkLogin() {
    // Check if Metamask is available in the browser
    if (!window.ethereum || typeof window.ethereum === "undefined") {
      alert("Please install Metamask to connect your wallet.");
      return;
    }

    let walletData = JSON.parse(localStorage.getItem(`${NAME_KEY}_${GAME_ID}`));

    if (walletData) {
      this.Wallet = this._formatWalletData(walletData);
      await this._getBalance();
      this._loadAccountDetail();
      return;
    }
    this._loadModalActions();
  }
}

let wallet = new WalletData();
// wallet._checkLogin();
// DO NOT EDIT

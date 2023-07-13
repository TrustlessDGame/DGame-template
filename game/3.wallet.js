// DO NOT EDIT
const gameKeyFake = "1234";

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

class WalletData {
  Wallet;
  Balance;

  // walletDataEx = {
  //   ACCOUNT_KEY: "",
  //   ADDRESS_KEY: "",
  //   PASS_WORD: "",
  // };

  constructor() {}

  async _onGetWalletAddress() {
    const currentAddress = window.ethereum.selectedAddress;
    return currentAddress;
  }

  _getGameKey() {
    return gameKeyFake;
  }

  _formatWalletData(walletData) {
    const gameKey = this._getGameKey();
    return {
      privateKey: decryptAES(
        walletData[ACCOUNT_KEY],
        walletData[PASS_WORD] + gameKey
      ),
      address: walletData[ADDRESS_KEY],
      password: walletData[PASS_WORD],
    };
  }

  async _generateAccount(password) {
    // Create new private key
    const id = CryptoJS.lib.WordArray.random(32);
    const prvKey = "0x" + id;
    const address = new ethers.Wallet(prvKey).address;

    console.log("prvKey: ", prvKey);

    // Create game key
    const gameKey = this._getGameKey();
    const finalPassword = password + gameKey;
    // Create hash private key
    const hashPrvKey = encryptAES(prvKey, finalPassword);

    let walletData = {};
    walletData[ACCOUNT_KEY] = hashPrvKey;
    walletData[ADDRESS_KEY] = address;
    walletData[PASS_WORD] = password;

    // Store on storage
    localStorage.setItem(`${NAME_KEY}_${GAME_ID}`, JSON.stringify(walletData));

    this.Wallet = this._formatWalletData(walletData);
    alert("Generate prvkey successfully!");
  }

  _loadModalAccount() {
    console.log("start import modal");
    // Import Modal
    const modalAccount = document.createElement("div");
    modalAccount.classList.add("wrap-modal");

    modalAccount.innerHTML = `
    <div class="bg-modal" id="bg-modal-account"></div>
    <div class="modal modal-account">
      <form autocomplete="off" class="form-account">
        <div class="form-inner">
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
        </div>
        <button id="submitButton" type="submit">Submit</button>
      </form>
    </div>`;

    document.body.appendChild(modalAccount);

    // Click outside to close
    const bgModal = document.getElementById("bg-modal-account");
    bgModal.addEventListener("click", () => {
      modalAccount.remove();
    });

    // Handle form's action
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
          const password = document.getElementById("passwordInput").value;
          const confirmPassword = document.getElementById(
            "confirmPasswordInput"
          ).value;

          this._generateAccount(password);
          modalAccount.remove();
        }
      }.bind(this)
    );

    function validateForm() {
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
        <button id="action-create">Create new account</button>
        <button id="action-import">Import private key</button>
      </div>
      </div>
    `;

    document.body.appendChild(modalActions);

    const actionCreate = document.getElementById("action-create");
    const bgModal = document.getElementById("bg-modal-action");

    // Click outside to close
    bgModal.addEventListener("click", () => {
      modalActions.remove();
    });

    // Select action
    actionCreate.addEventListener(
      "click",
      function () {
        this._loadModalAccount();
        modalActions.remove();
      }.bind(this)
    );
  }

  async _oncConnectWallet() {
    try {
      //   window.ethereum.enable();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      this._onGetWalletAddress();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }

  async checkLogin() {
    // Check if Metamask is available in the browser
    if (!window.ethereum || typeof window.ethereum === "undefined") {
      alert("Please install Metamask to connect your wallet.");
      return;
    }

    let walletData = JSON.parse(localStorage.getItem(`${NAME_KEY}_${GAME_ID}`));

    console.log("walletData:", walletData);

    if (walletData) {
      this.Wallet = this._formatWalletData(walletData);
      return;
    }
    this._loadModalActions();
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
wallet.checkLogin();
// wallet.LoadWallet();
// DO NOT EDIT

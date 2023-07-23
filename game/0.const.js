// DO NOT EDIT
// Contract data
const GAME_ID = 1;
const SALT_PASS = "1234";
const CHAIN_ID = 22213;
const RPC = "https://tc-node.trustless.computer";
const RPC_EXPLORER = "https://explorer.trustless.computer";
const NETWORK_NAME = "Trustless Computer";
const CURRENCY_SYMBOL = "TC";
let LIB_ASSETS = {};

// name CONTRACT_INTERACTION_BASIC
let provider;
const chainIdDefault = "0x" + Number(CHAIN_ID).toString(16);

// preload asset and lib
function importUIDefault() {
  const header = document.createElement("header");
  header.id = "header";
  header.innerHTML = `
    <div class="menu-list" id="header-menu-list"></div>
    <button class="navbar-icon" id="nav-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.12 7.2H2.88002C2.43842 7.2 2.40002 7.5576 2.40002 8C2.40002 8.4424 2.43842 8.8 2.88002 8.8H13.12C13.5616 8.8 13.6 8.4424 13.6 8C13.6 7.5576 13.5616 7.2 13.12 7.2ZM13.12 10.4H2.88002C2.43842 10.4 2.40002 10.7576 2.40002 11.2C2.40002 11.6424 2.43842 12 2.88002 12H13.12C13.5616 12 13.6 11.6424 13.6 11.2C13.6 10.7576 13.5616 10.4 13.12 10.4ZM2.88002 5.6H13.12C13.5616 5.6 13.6 5.2424 13.6 4.8C13.6 4.3576 13.5616 4 13.12 4H2.88002C2.43842 4 2.40002 4.3576 2.40002 4.8C2.40002 5.2424 2.43842 5.6 2.88002 5.6Z" fill="white"/>
      /svg>
    </button>
  `;
  document.body.insertBefore(header, document.body.firstChild);

  const menuList = document.getElementById("header-menu-list");
  const navbarBtn = document.getElementById("nav-icon");

  navbarBtn.addEventListener("click", function () {
    menuList.style.right = "0";
  });
}

async function preload() {
  if (!window.ethereum) {
    provider = new ethers.providers.JsonRpcProvider(RPC);
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  // Check and switch network
  checkAndSwitchNetwork();
}

function getScreenWidth() {
  // Lấy chiều rộng của cửa sổ
  const windowWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  return windowWidth;
}

async function checkAndSwitchNetwork() {
  const sW = getScreenWidth();
  if (sW > 800) {
    if (typeof window.ethereum === "undefined") {
      loadNoti("warning", "Please install MetaMask on browser");
      return;
    }
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId !== chainIdDefault) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdDefault,
            chainName: NETWORK_NAME,
            nativeCurrency: {
              name: CURRENCY_SYMBOL,
              symbol: CURRENCY_SYMBOL,
              decimals: 18,
            },
            rpcUrls: [RPC],
            blockExplorerUrls: [RPC_EXPLORER],
          },
        ],
      });
      provider = window.ethereum
        ? new ethers.providers.Web3Provider(window.ethereum)
        : new ethers.providers.JsonRpcProvider(RPC);
      return;
    } catch (error) {
      console.log(error);
    }
  }

  return;
}

async function preloadData(key, value, ext = ".gz") {
  // bfs://chainid/address/file_name
  console.log("asset bfs", key, value);
  // split bfs path;
  const bfsPathArray = value.split("/");
  const _ = bfsPathArray[2]; // chain ID
  const bfsAddr = bfsPathArray[3]; // bfs
  const address = bfsPathArray[4]; // address
  const fileName = bfsPathArray[5]; // file_name
  let contract = new ethers.Contract(
    bfsAddr,
    BFS_CONTRACTT_ABI_INTERFACE_JSON,
    provider
  );
  let dataBytesArray = new Uint8Array();
  let nextChunk = 0;
  do {
    console.log("Get data", value, "chunk #", parseInt(nextChunk));
    const chunkData = await contract.load(address, fileName + ext, nextChunk);
    nextChunk = chunkData[1];
    if (chunkData[0].length > 0) {
      const data = ethers.utils.arrayify(chunkData[0]);
      dataBytesArray = concatTypedArrays(dataBytesArray, data);
    }
  } while (nextChunk != -1);
  return dataBytesArray;
}

async function preloadLIBASSETS() {
  if (LIB_ASSETS != null && Object.keys(LIB_ASSETS).length > 0) {
    for (const key in LIB_ASSETS) {
      const value = LIB_ASSETS[key];
      if (value.indexOf("bfs://") > -1) {
        try {
          const dataBytesArray = await preloadData(key, value, "");
          if (dataBytesArray.length > 0) {
            const dataString = toString(dataBytesArray);
            await getGzipFile(dataURItoBlob(dataString));
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log("asset", key, value);
      }
    }
  }
}

async function preloadASSETS() {
  if (GAME_ASSETS != null && Object.keys(GAME_ASSETS).length > 0) {
    const promises = [];
    for (const key in GAME_ASSETS) {
      const value = GAME_ASSETS[key];
      if (value.indexOf("bfs://") > -1) {
        promises.push(
          preloadData(key, value, "")
            .then((dataBytesArray) => {
              if (dataBytesArray.length > 0) {
                const dataString = toString(dataBytesArray);
                const blobFile = URL.createObjectURL(dataURItoBlob(dataString));
                return fetch(blobFile)
                  .then((res) => res.arrayBuffer())
                  .then((e) => {
                    return new Promise((resolve, reject) => {
                      window.gunzip(new Uint8Array(e), (e1, n) => {
                        if (e1 == null) {
                          GAME_ASSETS[key] = URL.createObjectURL(
                            new Blob([new Uint8Array(n, 0, n.length)])
                          );
                        } else {
                          GAME_ASSETS[key] = blobFile;
                        }
                        resolve();
                      });
                    });
                  });
              }
            })
            .catch((e) => {
              console.log(e);
            })
        );
      } else {
        console.log("asset", key, value);
      }
    }

    await Promise.all(promises);
  }
  await preloadLIBASSETS();
}

const toString = (bytes) => {
  var result = "";
  for (var i = 0; i < bytes.length; ++i) {
    const byte = bytes[i];
    const text = byte.toString(16);
    result += (byte < 16 ? "%0" : "%") + text;
  }
  return decodeURIComponent(result);
};

function concatTypedArrays(a, b) {
  // a, b TypedArray of same type
  var c = new a.constructor(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

// wallet
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

const formatAddress = (address, prefix, suffix) => {
  const prefixLength = prefix || 4;
  const suffixLength = suffix || 4;

  const truncatedAddress = `${address.slice(0, prefixLength)}...${address.slice(
    -suffixLength
  )}`;

  return truncatedAddress;
};

const loadNoti = (type, text, time = 2500) => {
  const noti = document.createElement("div");
  noti.classList.add(`wrap-noti`);
  noti.classList.add(type);
  noti.innerHTML = `
        <div class="inner">
        ${text}
        </div>
    `;

  document.body.appendChild(noti);

  setTimeout(() => {
    noti.classList.add("close");
  }, time);
  setTimeout(() => {
    noti.remove();
  }, time + 1500);
};

const handleCopy = (wallet) => {
  // navigator.clipboard
  //   .writeText(wallet)
  //   .then(() => {
  //     loadNoti("success", "Copied successfully!");
  //   })
  //   .catch((error) => {
  //     console.error("Error copying text:", error);
  //   });
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = wallet;
  document.body.appendChild(tempTextarea);

  tempTextarea.select();
  document.execCommand("copy");
  loadNoti("success", "Copied successfully!");

  document.body.removeChild(tempTextarea);
};

const isValidPrivateKey = (privateKey) => {
  if (privateKey.includes("0x")) {
    privateKey = privateKey.slice(2);
  }
  try {
    const key = CryptoJS.enc.Hex.parse(privateKey);
    return key.sigBytes === 32;
  } catch (error) {
    return false;
  }
};

const customGas = {
  gasLimit: 50000,
  gasPrice: ethers.utils.parseUnits("1", "gwei"),
};
const getTransactionCost = () => {
  const transactionCost = ethers.utils.formatEther(
    customGas.gasPrice.mul(customGas.gasLimit)
  );
  return transactionCost;
};

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
        displayBalance.textContent = Number(formatBalance).toFixed(4);
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

      // Build the transaction object
      const transaction = {
        to: toAddress,
        value: amountEther,
        ...customGas,
      };

      // Send the signed transaction
      const txResponse = await wallet.sendTransaction(transaction);
      if (txResponse) {
        this._closeAllModal();
        this._loadModalLoading("Processing...");
      }

      // Wait for the transaction to be mined
      await txResponse.wait();

      loadNoti("success", "Withdraw successfully!");
      this._getBalance();
      this._closeAllModal();
    } catch (error) {
      console.log(error);
    }
  }

  async _onTopup(amount) {
    const accounts = await provider.listAccounts();
    const currentAddress = accounts[0];

    const balance = await provider.getBalance(currentAddress);
    const balanceInEther = Number(ethers.utils.parseEther(balance.toString()));

    if (balanceInEther < Number(topupInput.value)) {
      loadNoti("warning", "Your balance is not enough");
      return;
    }

    if (!amount || amount <= 0) {
      loadNoti("warning", "Amount invalid!");
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

      loadNoti("success", "Topup successfully!");

      this._getBalance();
      this._closeAllModal();
    } catch (error) {
      console.log(error);
    }
  }

  _onExportPrivateKey(password, isNew = false) {
    const walletData = JSON.parse(
      localStorage.getItem(`${NAME_KEY}_${GAME_ID}`)
    );
    const prvKey = decryptAES(walletData[ACCOUNT_KEY], password + SALT_PASS);
    if (!prvKey) {
      loadNoti("warning", "Password incorrect! Please type again", 3500);
      return;
    }
    const formatPrvKey = formatAddress(prvKey, 6, 6);
    const modalAccount = document.getElementById("modal-account");
    modalAccount.innerHTML = `
    <div class="form-inner">
        <p class="title-form">Your private key</p>
        ${
          isNew
            ? `<div class="note">Please copy your private key and save it somewhere safe for you, we will not be responsible if you lose your private key.</div>`
            : ""
        }
        <div class="item-input">
            <input disabled={true} value="${formatPrvKey}"/>
            <button class="child primary w-full" id="btn-copy-prvKey">Copy</button>
        </div>
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
    loadNoti("success", "Import private key successfully!", 2500);
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

    loadNoti("success", "Generate private key successfully!");
    await checkAndSwitchNetwork();
    this._checkLogin();
  }

  _closeAllModal() {
    const wrapModals = document.querySelectorAll(".wrap-modal");
    wrapModals.forEach((item) => {
      item.remove();
    });
  }

  _closeLoading() {
    const modalLoading = document.getElementById("modal-loading");
    modalLoading.remove();
  }

  _loadModalLoading(content) {
    const modalLoading = document.createElement("div");
    modalLoading.classList = "wrap-modal";
    modalLoading.id = "modal-loading";

    modalLoading.innerHTML = `
      <div class="loading-content">
        <div class="inner">
          <?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(241, 242, 243); display: block; shape-rendering: auto; animation-play-state: running; animation-delay: 0s;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><g style="animation-play-state: running; animation-delay: 0s;"> <circle cx="60" cy="50" r="4" fill="#ffffff" style="animation-play-state: running; animation-delay: 0s;"> <animate attributeName="cx" repeatCount="indefinite" dur="1s" values="95;35" keyTimes="0;1" begin="-0.67s" style="animation-play-state: running; animation-delay: 0s;"></animate> <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" values="0;1;1" keyTimes="0;0.2;1" begin="-0.67s" style="animation-play-state: running; animation-delay: 0s;"></animate> </circle> <circle cx="60" cy="50" r="4" fill="#ffffff" style="animation-play-state: running; animation-delay: 0s;"> <animate attributeName="cx" repeatCount="indefinite" dur="1s" values="95;35" keyTimes="0;1" begin="-0.33s" style="animation-play-state: running; animation-delay: 0s;"></animate> <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" values="0;1;1" keyTimes="0;0.2;1" begin="-0.33s" style="animation-play-state: running; animation-delay: 0s;"></animate> </circle> <circle cx="60" cy="50" r="4" fill="#ffffff" style="animation-play-state: running; animation-delay: 0s;"> <animate attributeName="cx" repeatCount="indefinite" dur="1s" values="95;35" keyTimes="0;1" begin="0s" style="animation-play-state: running; animation-delay: 0s;"></animate> <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" values="0;1;1" keyTimes="0;0.2;1" begin="0s" style="animation-play-state: running; animation-delay: 0s;"></animate> </circle></g><g transform="translate(-15 0)" style="animation-play-state: running; animation-delay: 0s;"> <path d="M50 50L20 50A30 30 0 0 0 80 50Z" fill="#f3f3f3" transform="rotate(90 50 50)" style="animation-play-state: running; animation-delay: 0s;"></path> <path d="M50 50L20 50A30 30 0 0 0 80 50Z" fill="#f3f3f3" style="animation-play-state: running; animation-delay: 0s;"> <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;45 50 50;0 50 50" keyTimes="0;0.5;1" style="animation-play-state: running; animation-delay: 0s;"></animateTransform> </path> <path d="M50 50L20 50A30 30 0 0 1 80 50Z" fill="#f3f3f3" style="animation-play-state: running; animation-delay: 0s;"> <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;-45 50 50;0 50 50" keyTimes="0;0.5;1" style="animation-play-state: running; animation-delay: 0s;"></animateTransform> </path></g></svg>
        <div class="block">${content}</div>
        </div>
      </div>
    `;

    document.body.appendChild(modalLoading);
  }

  _loadBalanceUI() {
    const balanceUI = document.createElement("div");
    const header = document.getElementById("header");

    balanceUI.classList.add("balance-ui");

    balanceUI.innerHTML = `
        <button class="btn-default gray flex"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M14.6219 13.3325H13.3121V14.6672H14.6219V13.3325Z" fill="#FFDE46"/> <path d="M14.6219 6.66602H13.3121V7.99827H14.6219V6.66602Z" fill="#FFDE46"/> <path d="M13.3121 14.667H12V15.9992H13.3121V14.667Z" fill="#FFDE46"/> <path d="M13.3121 6.66602H12V7.99827H13.3121V6.66602Z" fill="#FFDE46"/> <path d="M12 14.667H10.6902V15.9992H12V14.667Z" fill="#FFDE46"/> <path d="M12 6.66602H10.6902V7.99827H12V6.66602Z" fill="#FFDE46"/> <path d="M10.6902 6.66602H9.38049V7.99827H10.6902V6.66602Z" fill="#FFDE46"/> <path d="M9.38049 7.99854H8.06836V9.33322H9.38049V7.99854Z" fill="#FFDE46"/> <path d="M8.06841 13.3325H6.75867V14.6672H8.06841V13.3325Z" fill="#FFDE46"/> <path d="M8.06841 12H6.75867V13.3323H8.06841V12Z" fill="#FFDE46"/> <path d="M8.06841 10.6655H6.75867V12.0002H8.06841V10.6655Z" fill="#FFDE46"/> <path d="M8.06841 9.33301H6.75867V10.6653H8.06841V9.33301Z" fill="#FFDE46"/> <path d="M18.5559 8.00792V6.66596H17.2437V5.33856H15.934V3.99902H8.06123V5.33856H6.75865V6.67324H5.44652V8.00792H4.13678V16.016H5.44652V18.6854H8.07078V20.0176H15.9435V18.666H17.2533V17.3313H18.5654V15.999H19.8751V8.00792H18.5559ZM18.5559 10.6773V14.6668H17.2437V15.999H15.934V17.3313H14.6219V18.666H9.37336V17.3313H8.06123V15.999H6.75865V14.6668H5.44652V9.32804H6.75865V8.00792H8.06839V6.66596H9.38052V5.33856H14.629V6.67324H15.9412V8.00792H17.2509V9.3426H18.563L18.5559 10.6773Z" fill="#FFDE46"/> <path d="M17.2437 12.0002V9.33085H15.934V8.0083H9.38049V9.34298H8.06836V15.9994H9.38049V17.3317H14.629V15.9994H15.9411V14.6671H17.2509V11.9978L17.2437 12.0002ZM13.3121 14.6696V16.0018H10.6878V13.3325H9.38049V10.6777H10.6902V9.33328H13.3145V10.6777H14.6242V14.6671L13.3121 14.6696Z" fill="#FFDE46"/> <path d="M19.8656 14.667H18.5558V15.9992H19.8656V14.667Z" fill="#FFDE46"/> <path d="M19.8656 13.3325H18.5558V14.6672H19.8656V13.3325Z" fill="#FFDE46"/> <path d="M19.8656 12H18.5558V13.3323H19.8656V12Z" fill="#FFDE46"/> <path d="M19.8656 10.6655H18.5558V12.0002H19.8656V10.6655Z" fill="#FFDE46"/> <path d="M19.8656 9.33301H18.5558V10.6653H19.8656V9.33301Z" fill="#FFDE46"/> <path d="M19.8656 7.99854H18.5558V9.33322H19.8656V7.99854Z" fill="#FFDE46"/> <path d="M18.5558 15.999H17.2437V17.3313H18.5558V15.999Z" fill="#FFDE46"/> <path d="M18.5558 14.667H17.2437V15.9992H18.5558V14.667Z" fill="#FFDE46"/> <path d="M17.2437 17.3315H15.934V18.6662H17.2437V17.3315Z" fill="#FFDE46"/> <path d="M17.2437 15.999H15.934V17.3313H17.2437V15.999Z" fill="#FFDE46"/> <path d="M17.2437 12H15.934V13.3323H17.2437V12Z" fill="#FA8804"/> <path d="M17.2437 10.6655H15.934V12.0002H17.2437V10.6655Z" fill="#FA8804"/> <path d="M17.2437 5.33154H15.934V6.66622H17.2437V5.33154Z" fill="#FA8804"/> <path d="M15.934 18.666H14.6219V19.9983H15.934V18.666Z" fill="#FA8804"/> <path d="M15.934 17.3315H14.6219V18.6662H15.934V17.3315Z" fill="#FFDE46"/> <path d="M14.6219 13.3325H13.3121V14.6672H14.6219V13.3325Z" fill="#FFDE46"/> <path d="M14.6219 12H13.3121V13.3323H14.6219V12Z" fill="#FF9E00"/> <path d="M14.6219 10.6655H13.3121V12.0002H14.6219V10.6655Z" fill="#FF9E00"/> <path d="M14.6219 6.66602H13.3121V7.99827H14.6219V6.66602Z" fill="#FFDE46"/> <path d="M13.3121 14.667H12V15.9992H13.3121V14.667Z" fill="#FFDE46"/> <path d="M13.3121 13.3325H12V14.6672H13.3121V13.3325Z" fill="#FF9E00"/> <path d="M13.3121 12H12V13.3323H13.3121V12Z" fill="#FF9E00"/> <path d="M13.3121 10.6655H12V12.0002H13.3121V10.6655Z" fill="#FF9E00"/> <path d="M13.3121 9.33301H12V10.6653H13.3121V9.33301Z" fill="#FF9E00"/> <path d="M13.3121 6.66602H12V7.99827H13.3121V6.66602Z" fill="#FFDE46"/> <path d="M12 14.667H10.6902V15.9992H12V14.667Z" fill="#FFDE46"/> <path d="M12 13.3325H10.6902V14.6672H12V13.3325Z" fill="#FF9E00"/> <path d="M12 12H10.6902V13.3323H12V12Z" fill="#FF9E00"/> <path d="M12 10.6655H10.6902V12.0002H12V10.6655Z" fill="#FF9E00"/> <path d="M12 9.33301H10.6902V10.6653H12V9.33301Z" fill="#FF9E00"/> <path d="M12 6.66602H10.6902V7.99827H12V6.66602Z" fill="#FFDE46"/> <path d="M10.6902 12H9.38049V13.3323H10.6902V12Z" fill="#FF9E00"/> <path d="M10.6902 10.6655H9.38049V12.0002H10.6902V10.6655Z" fill="#FF9E00"/> <path d="M10.6902 6.66602H9.38049V7.99827H10.6902V6.66602Z" fill="#FFDE46"/> <path d="M9.38049 7.99854H8.06836V9.33322H9.38049V7.99854Z" fill="#FFDE46"/> <path d="M8.06841 17.3315H6.75867V18.6662H8.06841V17.3315Z" fill="#FFDE46"/> <path d="M8.06841 13.3325H6.75867V14.6672H8.06841V13.3325Z" fill="#FFDE46"/> <path d="M8.06841 12H6.75867V13.3323H8.06841V12Z" fill="#FFDE46"/> <path d="M8.06841 10.6655H6.75867V12.0002H8.06841V10.6655Z" fill="#FFDE46"/> <path d="M8.06841 9.33301H6.75867V10.6653H8.06841V9.33301Z" fill="#FFDE46"/> <path d="M9.38049 3.99902H8.06836V5.33128H9.38049V3.99902Z" fill="#FF9E00"/> <path d="M8.06841 5.33154H6.75867V6.66622H8.06841V5.33154Z" fill="#FF9E00"/> <path d="M6.75866 6.66602H5.44653V7.99827H6.75866V6.66602Z" fill="#FF9E00"/> <path d="M4.13678 9.33322V10.6655V12.0002V13.3324V14.6671H5.44652V13.3324V12.0002V10.6655V9.33322V7.99854H4.13678V9.33322Z" fill="#FF9E00"/> <path d="M18.5558 13.3325H17.2437V14.6672H18.5558V13.3325Z" fill="#FFDE46"/> <path d="M18.5558 12H17.2437V13.3323H18.5558V12Z" fill="#FFDE46"/> <path d="M18.5558 10.6655H17.2437V12.0002H18.5558V10.6655Z" fill="#FFDE46"/> <path d="M18.5558 9.33301H17.2437V10.6653H18.5558V9.33301Z" fill="#FFDE46"/> <path d="M17.2437 14.667H15.934V15.9992H17.2437V14.667Z" fill="#FFDE46"/> <path d="M17.2437 12H15.934V13.3323H17.2437V12Z" fill="#FFDE46"/> <path d="M17.2437 10.6655H15.934V12.0002H17.2437V10.6655Z" fill="#FFDE46"/> <path d="M17.2437 7.99854H15.934V9.33322H17.2437V7.99854Z" fill="#FFDE46"/> <path d="M15.934 15.999H14.6219V17.3313H15.934V15.999Z" fill="#FFDE46"/> <path d="M15.934 14.667H14.6219V15.9992H15.934V14.667Z" fill="#FFDE46"/> <path d="M15.934 9.33301H14.6219V10.6653H15.934V9.33301Z" fill="#FFDE46"/> <path d="M15.934 6.66602H14.6219V7.99827H15.934V6.66602Z" fill="#FFDE46"/> <path d="M14.6219 17.3315H13.3121V18.6662H14.6219V17.3315Z" fill="#FFDE46"/> <path d="M14.6219 12H13.3121V13.3323H14.6219V12Z" fill="#FFDE46"/> <path d="M14.6219 10.6655H13.3121V12.0002H14.6219V10.6655Z" fill="#FFDE46"/> <path d="M14.6219 5.33154H13.3121V6.66622H14.6219V5.33154Z" fill="#FFDE46"/> <path d="M13.3121 17.3315H12V18.6662H13.3121V17.3315Z" fill="#FFDE46"/> <path d="M13.3121 13.3325H12V14.6672H13.3121V13.3325Z" fill="#FFDE46"/> <path d="M13.3121 12H12V13.3323H13.3121V12Z" fill="#FFDE46"/> <path d="M13.3121 10.6655H12V12.0002H13.3121V10.6655Z" fill="#FFDE46"/> <path d="M13.3121 9.33301H12V10.6653H13.3121V9.33301Z" fill="#FFDE46"/> <path d="M13.3121 5.33154H12V6.66622H13.3121V5.33154Z" fill="#FFDE46"/> <path d="M12 17.3315H10.6902V18.6662H12V17.3315Z" fill="#FFDE46"/> <path d="M12 13.3325H10.6902V14.6672H12V13.3325Z" fill="#FFDE46"/> <path d="M12 12H10.6902V13.3323H12V12Z" fill="#FFDE46"/> <path d="M12 9.33301H10.6902V10.6653H12V9.33301Z" fill="#FFDE46"/> <path d="M12 5.33154H10.6902V6.66622H12V5.33154Z" fill="#FFDE46"/> <path d="M10.6902 17.3315H9.38049V18.6662H10.6902V17.3315Z" fill="#FFDE46"/> <path d="M10.6902 15.999H9.38049V17.3313H10.6902V15.999Z" fill="#FFDE46"/> <path d="M10.6902 12H9.38049V13.3323H10.6902V12Z" fill="#FFDE46"/> <path d="M10.6902 10.6655H9.38049V12.0002H10.6902V10.6655Z" fill="#FFDE46"/> <path d="M10.6902 5.33154H9.38049V6.66622H10.6902V5.33154Z" fill="#FFDE46"/> <path d="M9.38049 15.999H8.06836V17.3313H9.38049V15.999Z" fill="#FFDE46"/> <path d="M9.38049 6.66602H8.06836V7.99827H9.38049V6.66602Z" fill="#FFDE46"/> <path d="M8.06841 14.667H6.75867V15.9992H8.06841V14.667Z" fill="#FFDE46"/> <path d="M19.8656 13.3325H18.5558V14.6672H19.8656V13.3325Z" fill="#FFDE46"/> <path d="M19.8656 10.6655H18.5558V12.0002H19.8656V10.6655Z" fill="#FFDE46"/> <path d="M18.5558 15.999H17.2437V17.3313H18.5558V15.999Z" fill="#FFDE46"/> <path d="M17.2437 17.3315H15.934V18.6662H17.2437V17.3315Z" fill="#FFDE46"/> <path d="M14.6219 13.3325H13.3121V14.6672H14.6219V13.3325Z" fill="#FFDE46"/> <path d="M12 6.66602H10.6902H9.38049V7.99827H10.6902H12H13.3121H14.6218V6.66602H13.3121H12Z" fill="#FFDE46"/> <path d="M10.6902 14.667V15.9992H12H13.3121V14.667H12H10.6902Z" fill="#FFDE46"/> <path d="M9.38049 7.99854H8.06836V9.33322H9.38049V7.99854Z" fill="#FFDE46"/> <path d="M6.75867 10.6653V11.9999V13.3322V14.6669H8.06841V13.3322V11.9999V10.6653V9.33301H6.75867V10.6653Z" fill="#FFDE46"/> <path d="M8.06841 7.99854H6.75867V9.33322H8.06841V7.99854Z" fill="#FFDE46"/> <path d="M6.75866 13.3325H5.44653V14.6672H6.75866V13.3325Z" fill="#FFDE46"/> <path d="M6.75866 12H5.44653V13.3323H6.75866V12Z" fill="#FFDE46"/> <path d="M6.75866 10.6655H5.44653V12.0002H6.75866V10.6655Z" fill="#FFDE46"/> <path d="M6.75866 9.33301H5.44653V10.6653H6.75866V9.33301Z" fill="#FFDE46"/> <path d="M17.2437 10.6653V11.9999V13.3322V14.6669H18.5558V13.3322V11.9999V10.6653V9.33301H17.2437V10.6653Z" fill="#DE5C2B"/> <path d="M17.2437 14.667H15.934V15.9992H17.2437V14.667Z" fill="#DE5C2B"/> <path d="M17.2437 7.99854H15.934V9.33322H17.2437V7.99854Z" fill="#DE5C2B"/> <path d="M15.934 15.999H14.6219V17.3313H15.934V15.999Z" fill="#DE5C2B"/> <path d="M15.934 6.66602H14.6219V7.99827H15.934V6.66602Z" fill="#DE5C2B"/> <path d="M12 17.3315H10.6902H9.38049V18.6662H10.6902H12H13.3121H14.6218V17.3315H13.3121H12Z" fill="#DE5C2B"/> <path d="M12 6.66622H13.3121H14.6218V5.33154H13.3121H12H10.6902H9.38049V6.66622H10.6902H12Z" fill="#DE5C2B"/> <path d="M9.38049 15.999H8.06836V17.3313H9.38049V15.999Z" fill="#DE5C2B"/> <path d="M9.38049 6.66602H8.06836V7.99827H9.38049V6.66602Z" fill="#DE5C2B"/> <path d="M8.06841 14.667H6.75867V15.9992H8.06841V14.667Z" fill="#DE5C2B"/> <path d="M8.06841 7.99854H6.75867V9.33322H8.06841V7.99854Z" fill="#DE5C2B"/> <path d="M6.75866 11.9999V10.6653V9.33301H5.44653V10.6653V11.9999V13.3322V14.6669H6.75866V13.3322V11.9999Z" fill="#DE5C2B"/> <path d="M19.8656 7.99854V9.33322V10.6655V12.0002V13.3324V14.6671V15.9993H21.1777V14.6671V13.3324V12.0002V10.6655V9.33322V7.99854H19.8656Z" fill="#DE5C2B"/> <path d="M19.8656 15.999H18.5558V17.3313H19.8656V15.999Z" fill="#DE5C2B"/> <path d="M19.8656 6.66602H18.5558V7.99827H19.8656V6.66602Z" fill="#DE5C2B"/> <path d="M18.5558 17.3315H17.2437V18.6662H18.5558V17.3315Z" fill="#DE5C2B"/> <path d="M18.5558 5.33154H17.2437V6.66622H18.5558V5.33154Z" fill="#DE5C2B"/> <path d="M17.2437 18.666H15.934V19.9983H17.2437V18.666Z" fill="#DE5C2B"/> <path d="M17.2437 3.99902H15.934V5.33128H17.2437V3.99902Z" fill="#DE5C2B"/> <path d="M13.3121 19.9985H12H10.6902H9.38049H8.06836V21.3332H9.38049H10.6902H12H13.3121H14.6218H15.934V19.9985H14.6218H13.3121Z" fill="#DE5C2B"/> <path d="M10.6902 3.99925H12H13.3121H14.6218H15.934V2.66699H14.6218H13.3121H12H10.6902H9.38049H8.06836V3.99925H9.38049H10.6902Z" fill="#DE5C2B"/> <path d="M8.06841 18.666H6.75867V19.9983H8.06841V18.666Z" fill="#DE5C2B"/> <path d="M8.06841 3.99902H6.75867V5.33128H8.06841V3.99902Z" fill="#DE5C2B"/> <path d="M6.75866 17.3315H5.44653V18.6662H6.75866V17.3315Z" fill="#DE5C2B"/> <path d="M6.75866 5.33154H5.44653V6.66622H6.75866V5.33154Z" fill="#DE5C2B"/> <path d="M5.44652 15.999H4.13678V17.3313H5.44652V15.999Z" fill="#DE5C2B"/> <path d="M5.44652 6.66602H4.13678V7.99827H5.44652V6.66602Z" fill="#DE5C2B"/> <path d="M4.13677 13.3324V12.0002V10.6655V9.33322V7.99854H2.82465V9.33322V10.6655V12.0002V13.3324V14.6671V15.9993H4.13677V14.6671V13.3324Z" fill="#DE5C2B"/></svg>
        <span id="display-balance" class="mr-small">${Number(
          this.Balance
        ).toFixed(4)}</span> TC</butotn>
        <button class="wallet-display btn-default gray flex" id="wallet-display">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.9565 16.9565V15.6522H15.6522V14.3478H14.3478V13.0435V12.1739V11.7391H15.6522V10.4348H16.9565V3.91305H15.6522V2.60871H14.7826H14.3478V1.30434H13.0435V0H6.95652V1.30434H5.65218V2.60871H4.34781V3.91305H3.04347V10.4348H4.34781V11.7391H5.65218V12.1739V13.0435V14.3478H4.34781V15.6522H3.04347V16.9565H1.73914V20H3.04347H16.9565H18.2609V16.9565H16.9565Z" fill="#60DC4D"/><path d="M5.65218 13.0435V14.3478H4.34781V15.6522H3.04347V16.9565H1.73914V20H4.34781V16.9565H5.65218V15.6522H6.95652V14.3478V13.0435H5.65218Z" fill="white"/><path d="M3.04346 9.13037V10.4347H4.34779V11.7391H5.65217V10.4347V9.13037H4.34779H3.04346Z" fill="white"/><path d="M15.6522 3.91305V2.60871H14.3478V1.30434H13.0435V0H6.9565V1.30434H5.65217V2.60871H4.34779V3.91305H3.04346V7.82609H4.34779H5.65217V3.91305H6.9565V2.60871H13.0435V3.91305H14.3478V5.21738H15.6522H16.9565V3.91305H15.6522Z" fill="white"/><path d="M4.34779 3.91309H3.04346V10.4348H4.34779V3.91309Z" fill="#233E66"/><path d="M16.9565 3.91309H15.6522V10.4348H16.9565V3.91309Z" fill="#233E66"/><path d="M13.0435 0H6.95654V1.30434H13.0435V0Z" fill="#233E66"/><path d="M5.65218 2.60889H4.34784V3.91322H5.65218V2.60889Z" fill="#233E66"/><path d="M6.9565 1.3042H5.65216V2.60854H6.9565V1.3042Z" fill="#233E66"/><path d="M14.3478 1.3042H13.0435V2.60854H14.3478V1.3042Z" fill="#233E66"/><path d="M15.6522 2.60889H14.3478V3.91322H15.6522V2.60889Z" fill="#233E66"/><path d="M5.65218 10.4346H4.34784V11.7389H5.65218V10.4346Z" fill="#233E66"/><path d="M15.6522 10.4346H14.3478V11.7389H15.6522V10.4346Z" fill="#233E66"/><path d="M13.0435 13.0436H11.7391V14.3479H13.0435H14.3478V13.0436V11.7393H13.0435V13.0436Z" fill="#233E66"/><path d="M4.34779 15.6523H3.04346V16.9567H4.34779V15.6523Z" fill="#233E66"/><path d="M16.9565 15.6523H15.6522V16.9567H16.9565V15.6523Z" fill="#233E66"/><path d="M16.9565 16.9565V18.6957H3.04347V16.9565H1.73914V18.6957V20H3.04347H16.9565H18.2609V18.6957V16.9565H16.9565Z" fill="#233E66"/><path d="M5.65218 14.3477H4.34784V15.652H5.65218V14.3477Z" fill="#233E66"/><path d="M15.6522 14.3477H14.3478V15.652H15.6522V14.3477Z" fill="#233E66"/><path d="M8.26083 14.3479V13.0436H6.9565V11.7393H5.65216V13.0436V14.3479H6.9565H8.26083Z" fill="#233E66"/></svg>
        ${formatAddress(this.Wallet.address)}</button>  
   `;

    // document.body.appendChild(balanceUI);
    header.appendChild(balanceUI);
    const walletDisplay = document.getElementById("wallet-display");
    walletDisplay.addEventListener(
      "click",
      function () {
        handleCopy(this.Wallet.address);
      }.bind(this)
    );
  }

  _loadModalWithdraw() {
    const modalWithdraw = document.createElement("div");
    modalWithdraw.classList.add("wrap-modal");
    modalWithdraw.innerHTML = `
    <div class="bg-modal" id="bg-modal-withdraw"></div>
      <div class="modal modal-topup">
        <button class="close-modal" id="close-modal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.96 4.45998L11.54 3.03998L7.99998 6.58998L4.45998 3.03998L3.03998 4.45998L6.58998 7.99998L3.03998 11.54L4.45998 12.96L7.99998 9.40998L11.54 12.96L12.96 11.54L9.40998 7.99998L12.96 4.45998Z" fill="white"/>
          </svg>
        </button>
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
            <div class="withdraw-input item-input">
              <input id="withdrawInput" value="0" type="text" class="input-style" />
              <button id="max-btn" class="max-btn child">Max</button>
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

    document
      .getElementById("close-modal")
      .addEventListener("click", function () {
        modalWithdraw.remove();
      });

    const withdrawInput = document.getElementById("withdrawInput");
    const addressInput = document.getElementById("addressInput");
    const submitBtn = document.getElementById("submitWithdraw");
    const maxBtn = document.getElementById("max-btn");

    const isValidation = () => {
      if (!withdrawInput.value || !addressInput.value) {
        loadNoti("warning", "Input is empty!");
        return false;
      }
      if (withdrawInput.value > this.Balance) {
        loadNoti("warning", "Amount can't higher your balance!");
        return false;
      }
      const transactionCost = getTransactionCost();
      if (transactionCost > this.Balance) {
        loadNoti("warning", "Your balance is not enough");
        return;
      }

      return true;
    };

    maxBtn.addEventListener(
      "click",
      async function () {
        const transactionCost = getTransactionCost();

        const showBalance = (
          parseFloat(this.Balance) -
          (parseFloat(transactionCost) + parseFloat(transactionCost) / 3)
        ).toString();

        if (parseFloat(showBalance) < 0) {
          loadNoti("warning", "Your balance is not enough");
          return;
        }

        withdrawInput.value = showBalance;
      }.bind(this)
    );

    submitBtn.addEventListener(
      "click",
      function () {
        if (isValidation()) {
          this._onWithdraw(addressInput.value, withdrawInput.value);
        }
      }.bind(this)
    );
  }

  async _loadModalTopup() {
    const modalTopup = document.createElement("div");
    modalTopup.classList.add("wrap-modal");
    modalTopup.innerHTML = `
    <div class="bg-modal" id="bg-modal-topup"></div>
      <div class="modal modal-topup">
        <button class="close-modal" id="close-modal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.96 4.45998L11.54 3.03998L7.99998 6.58998L4.45998 3.03998L3.03998 4.45998L6.58998 7.99998L3.03998 11.54L4.45998 12.96L7.99998 9.40998L11.54 12.96L12.96 11.54L9.40998 7.99998L12.96 4.45998Z" fill="white"/>
        </svg></button>
        <div class="form-inner">
          <p class="title-form">Topup</p>
          <div class="item-input">
          <input disabled={true} value="${formatAddress(
            this.Wallet.address,
            8,
            8
          )}"/>
          <button class="child primary w-full" id="btn-copy-prvKey">Copy</button>
      </div>
          <form autocomplete="off" class="mt-medium">
            <div class="item">
                <label>Amount</label>
                <div class="topup-input">
                    <input id="topupInput" value="1" type="text" class="input-style" />
                </div>
            </div>
            <div class="item">
            <button type="submit" class="submit" id="submitTopup">Topup</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modalTopup);

    document.getElementById("btn-copy-prvKey").addEventListener(
      "click",
      function () {
        handleCopy(this.Wallet.address);
      }.bind(this)
    );

    document
      .getElementById("close-modal")
      .addEventListener("click", function () {
        modalTopup.remove();
      });

    // Click outside to close
    const bgModal = document.getElementById("bg-modal-topup");
    bgModal.addEventListener("click", () => {
      modalTopup.remove();
    });

    const topupInput = document.getElementById("topupInput");
    const submitBtn = document.getElementById("submitTopup");

    const isConnectWallet = await this._isConnectedMetamask();

    submitBtn.addEventListener(
      "click",
      async function (event) {
        event.preventDefault();

        if (!isConnectWallet) {
          (async () => {
            submitBtn.setAttribute("disabled", "");
            await this._oncConnectWallet();
            await checkAndSwitchNetwork();
            this._onTopup(topupInput.value);
          })();
          return;
        }

        this._onTopup(topupInput.value);
      }.bind(this)
    );
  }

  _loadAccountDetail() {
    if (document.querySelector(".header-actions")) {
      document.querySelector(".header-actions").remove();
    }

    const header = document.getElementById("header-menu-list");
    const headerActions = document.createElement("div");

    if (!this.Wallet) {
      headerActions.classList.add("header-actions");
      headerActions.classList.add("end");
      headerActions.innerHTML = `
        <div class="inner">
          <button class="btn-login btn-default" id="btn-login"">Login</button>
          <button class="navbar-icon close" id="close-menu"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.96 4.45998L11.54 3.03998L7.99998 6.58998L4.45998 3.03998L3.03998 4.45998L6.58998 7.99998L3.03998 11.54L4.45998 12.96L7.99998 9.40998L11.54 12.96L12.96 11.54L9.40998 7.99998L12.96 4.45998Z" fill="white"/>
        </svg></button>
        </div>
      `;
      header.insertBefore(headerActions, header.firstChild);
      document.getElementById("btn-login").addEventListener(
        "click",
        function () {
          this._loadModalActions();
        }.bind(this)
      );
      const closeMenu = document.getElementById("close-menu");

      closeMenu.addEventListener("click", function () {
        document.getElementById("header-menu-list").style.right = "-100%";
      });

      document.querySelectorAll(".btn-default").forEach((item) => {
        item.addEventListener("click", () => {
          document.getElementById("header-menu-list").style.right = "-100%";
        });
      });
      return;
    }
    headerActions.classList.add("header-actions");
    headerActions.innerHTML = `
        <div class="inner">
          <button class="btn-withdraw btn-default flex" id="btn-withdraw">        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3.00097 11.8C2.97397 11.8 2.94602 11.799 2.91802 11.796C2.50602 11.751 2.20902 11.38 2.25402 10.969C2.61702 7.65199 4.619 4.79503 7.609 3.32703C7.842 3.21303 8.11699 3.22701 8.33599 3.36401C8.55599 3.50101 8.68999 3.74198 8.68999 4.00098V7.05103C8.68999 7.46503 8.35399 7.80103 7.93999 7.80103C7.52599 7.80103 7.18999 7.46503 7.18999 7.05103V5.31006C5.26699 6.64806 4.00596 8.74896 3.74596 11.132C3.70396 11.515 3.37797 11.8 3.00097 11.8ZM16.391 20.673C19.381 19.206 21.383 16.349 21.745 13.031C21.791 12.619 21.493 12.249 21.081 12.204C20.673 12.16 20.3 12.456 20.255 12.868C19.994 15.251 18.734 17.3519 16.81 18.6899V16.949C16.81 16.535 16.474 16.199 16.06 16.199C15.646 16.199 15.31 16.535 15.31 16.949V19.999C15.31 20.258 15.444 20.499 15.664 20.636C15.785 20.711 15.922 20.749 16.06 20.749C16.173 20.75 16.286 20.725 16.391 20.673ZM12 7C12 9.209 13.791 11 16 11C18.209 11 20 9.209 20 7C20 4.791 18.209 3 16 3C13.791 3 12 4.791 12 7ZM3.99999 17C3.99999 19.209 5.79099 21 7.99999 21C10.209 21 12 19.209 12 17C12 14.791 10.209 13 7.99999 13C5.79099 13 3.99999 14.791 3.99999 17Z" fill="white"/>
            </svg> Withdraw</button>
          <button class="btn-topup btn-default flex" id="btn-topup"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/>
            </svg>Topup</button>
          <button class="btn-export btn-default" id="btn-export">Export private key</button>
          <button class="navbar-icon close" id="close-menu"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.96 4.45998L11.54 3.03998L7.99998 6.58998L4.45998 3.03998L3.03998 4.45998L6.58998 7.99998L3.03998 11.54L4.45998 12.96L7.99998 9.40998L11.54 12.96L12.96 11.54L9.40998 7.99998L12.96 4.45998Z" fill="white"/>
        </svg></button>
        </div>
      `;
    header.insertBefore(headerActions, header.firstChild);

    const btnTopup = document.getElementById("btn-topup");
    const btnWithdraw = document.getElementById("btn-withdraw");
    const btnExport = document.getElementById("btn-export");
    const closeMenu = document.getElementById("close-menu");

    closeMenu.addEventListener("click", function () {
      document.getElementById("header-menu-list").style.right = "-100%";
    });

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

    document.querySelectorAll(".btn-default").forEach((item) => {
      item.addEventListener("click", () => {
        setTimeout(() => {
          document.getElementById("header-menu-list").style.right = "-100%";
        }, 500);
      });
    });

    return;
  }

  _loadModalAccount(type) {
    // Import Modal
    const modalAccount = document.createElement("div");
    modalAccount.classList.add("wrap-modal");
    const returnTitleForm = () => {
      switch (type) {
        case "create-new":
          return "Create New Account";
        case "export":
          return "Export private key";
        case "import":
          return "Import private key";
        default:
          break;
      }
    };
    modalAccount.innerHTML = `
    <div class="bg-modal" id="bg-modal-account"></div>
    <div class="modal modal-account" id="modal-account">
    <button class="close-modal" id="close-modal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.96 4.45998L11.54 3.03998L7.99998 6.58998L4.45998 3.03998L3.03998 4.45998L6.58998 7.99998L3.03998 11.54L4.45998 12.96L7.99998 9.40998L11.54 12.96L12.96 11.54L9.40998 7.99998L12.96 4.45998Z" fill="white"/>
          </svg>
        </button>
      <form autocomplete="off" class="form-account">
        <div class="form-inner">
        <p class="title-form">${returnTitleForm()}</p>
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
              <span id="passwordToggle" class="toggle-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 17.4001C10.932 17.4001 9.88795 17.0834 8.99992 16.49C8.1119 15.8967 7.41976 15.0533 7.01105 14.0666C6.60234 13.0799 6.4954 11.9941 6.70376 10.9466C6.91212 9.89911 7.42642 8.93692 8.18162 8.18172C8.93683 7.42652 9.89901 6.91222 10.9465 6.70386C11.994 6.4955 13.0798 6.60243 14.0665 7.01115C15.0532 7.41986 15.8966 8.11199 16.4899 9.00002C17.0833 9.88804 17.4 10.9321 17.4 12.0001C17.4 13.4323 16.8311 14.8058 15.8184 15.8185C14.8057 16.8312 13.4322 17.4001 12 17.4001ZM12 3.6001C3.6 3.6001 0 12.0001 0 12.0001C0 12.0001 3.6 20.4001 12 20.4001C20.4 20.4001 24 12.0001 24 12.0001C24 12.0001 20.4 3.6001 12 3.6001Z" fill="white"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/></svg><path d="M23.0156 12.8137C23.1708 12.5702 23.2529 12.2872 23.252 11.9984C23.2512 11.7096 23.1675 11.4271 23.0109 11.1844C21.7706 9.26625 20.1614 7.63688 18.3577 6.47203C16.3594 5.18203 14.1562 4.5 11.985 4.5C10.8404 4.50157 9.7035 4.6882 8.61843 5.05266C8.58807 5.06276 8.56079 5.08046 8.5392 5.10409C8.51761 5.12772 8.50242 5.15647 8.49509 5.18763C8.48776 5.21878 8.48853 5.25129 8.49732 5.28207C8.50611 5.31284 8.52263 5.34085 8.54531 5.36344L10.7597 7.57781C10.7827 7.60086 10.8113 7.61752 10.8427 7.62615C10.8741 7.63478 10.9072 7.63508 10.9387 7.62703C11.6893 7.44412 12.4744 7.45752 13.2183 7.66595C13.9622 7.87438 14.6399 8.27082 15.1862 8.8171C15.7325 9.36338 16.1289 10.0411 16.3373 10.785C16.5458 11.5289 16.5592 12.3139 16.3762 13.0645C16.3683 13.096 16.3686 13.129 16.3773 13.1603C16.3859 13.1916 16.4025 13.2202 16.4255 13.2431L19.6106 16.4306C19.6438 16.4638 19.6881 16.4834 19.735 16.4855C19.7819 16.4876 19.8278 16.472 19.8637 16.4419C21.0898 15.3968 22.1522 14.1739 23.0156 12.8137ZM12 16.5C11.3188 16.5 10.6465 16.3454 10.0337 16.0478C9.42094 15.7502 8.88375 15.3173 8.46263 14.7819C8.04151 14.2464 7.74745 13.6223 7.60262 12.9567C7.45779 12.2911 7.46598 11.6012 7.62656 10.9392C7.63452 10.9077 7.63417 10.8747 7.62555 10.8434C7.61692 10.8121 7.60031 10.7836 7.57734 10.7606L4.44422 7.62609C4.41099 7.59283 4.36649 7.57327 4.31952 7.57127C4.27255 7.56927 4.22655 7.58499 4.19062 7.61531C3.04734 8.59078 1.9875 9.77766 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81937 16.3997 5.59547 17.5486C7.59656 18.8438 9.74625 19.5 11.985 19.5C13.1412 19.4969 14.2899 19.3143 15.39 18.9586C15.4206 18.9488 15.4482 18.9313 15.4702 18.9078C15.4921 18.8842 15.5076 18.8554 15.5152 18.8242C15.5227 18.7929 15.5222 18.7602 15.5134 18.7293C15.5047 18.6983 15.4882 18.6701 15.4655 18.6473L13.2403 16.4227C13.2174 16.3997 13.1888 16.3831 13.1575 16.3744C13.1262 16.3658 13.0932 16.3655 13.0617 16.3734C12.7141 16.4577 12.3577 16.5002 12 16.5Z" fill="white"/></svg>
              </span>
            </div>
          </div>
          <div class="item">
            <label>Confirm Password</label>
            <div class="password-input">
              <input id="confirmPasswordInput" type="password" />
              <span id="confirmPasswordToggle" class="toggle-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 17.4001C10.932 17.4001 9.88795 17.0834 8.99992 16.49C8.1119 15.8967 7.41976 15.0533 7.01105 14.0666C6.60234 13.0799 6.4954 11.9941 6.70376 10.9466C6.91212 9.89911 7.42642 8.93692 8.18162 8.18172C8.93683 7.42652 9.89901 6.91222 10.9465 6.70386C11.994 6.4955 13.0798 6.60243 14.0665 7.01115C15.0532 7.41986 15.8966 8.11199 16.4899 9.00002C17.0833 9.88804 17.4 10.9321 17.4 12.0001C17.4 13.4323 16.8311 14.8058 15.8184 15.8185C14.8057 16.8312 13.4322 17.4001 12 17.4001ZM12 3.6001C3.6 3.6001 0 12.0001 0 12.0001C0 12.0001 3.6 20.4001 12 20.4001C20.4 20.4001 24 12.0001 24 12.0001C24 12.0001 20.4 3.6001 12 3.6001Z" fill="white"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/></svg><path d="M23.0156 12.8137C23.1708 12.5702 23.2529 12.2872 23.252 11.9984C23.2512 11.7096 23.1675 11.4271 23.0109 11.1844C21.7706 9.26625 20.1614 7.63688 18.3577 6.47203C16.3594 5.18203 14.1562 4.5 11.985 4.5C10.8404 4.50157 9.7035 4.6882 8.61843 5.05266C8.58807 5.06276 8.56079 5.08046 8.5392 5.10409C8.51761 5.12772 8.50242 5.15647 8.49509 5.18763C8.48776 5.21878 8.48853 5.25129 8.49732 5.28207C8.50611 5.31284 8.52263 5.34085 8.54531 5.36344L10.7597 7.57781C10.7827 7.60086 10.8113 7.61752 10.8427 7.62615C10.8741 7.63478 10.9072 7.63508 10.9387 7.62703C11.6893 7.44412 12.4744 7.45752 13.2183 7.66595C13.9622 7.87438 14.6399 8.27082 15.1862 8.8171C15.7325 9.36338 16.1289 10.0411 16.3373 10.785C16.5458 11.5289 16.5592 12.3139 16.3762 13.0645C16.3683 13.096 16.3686 13.129 16.3773 13.1603C16.3859 13.1916 16.4025 13.2202 16.4255 13.2431L19.6106 16.4306C19.6438 16.4638 19.6881 16.4834 19.735 16.4855C19.7819 16.4876 19.8278 16.472 19.8637 16.4419C21.0898 15.3968 22.1522 14.1739 23.0156 12.8137ZM12 16.5C11.3188 16.5 10.6465 16.3454 10.0337 16.0478C9.42094 15.7502 8.88375 15.3173 8.46263 14.7819C8.04151 14.2464 7.74745 13.6223 7.60262 12.9567C7.45779 12.2911 7.46598 11.6012 7.62656 10.9392C7.63452 10.9077 7.63417 10.8747 7.62555 10.8434C7.61692 10.8121 7.60031 10.7836 7.57734 10.7606L4.44422 7.62609C4.41099 7.59283 4.36649 7.57327 4.31952 7.57127C4.27255 7.56927 4.22655 7.58499 4.19062 7.61531C3.04734 8.59078 1.9875 9.77766 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81937 16.3997 5.59547 17.5486C7.59656 18.8438 9.74625 19.5 11.985 19.5C13.1412 19.4969 14.2899 19.3143 15.39 18.9586C15.4206 18.9488 15.4482 18.9313 15.4702 18.9078C15.4921 18.8842 15.5076 18.8554 15.5152 18.8242C15.5227 18.7929 15.5222 18.7602 15.5134 18.7293C15.5047 18.6983 15.4882 18.6701 15.4655 18.6473L13.2403 16.4227C13.2174 16.3997 13.1888 16.3831 13.1575 16.3744C13.1262 16.3658 13.0932 16.3655 13.0617 16.3734C12.7141 16.4577 12.3577 16.5002 12 16.5Z" fill="white"/></svg>
              </span>
            </div>
          </div>
          <button id="submitButton" class="submit" type="submit">Submit</button>
          <div class="error"></div>
        </div>
      </form>
    </div>`;

    document.body.appendChild(modalAccount);

    // Click outside to close
    const bgModal = document.getElementById("bg-modal-account");
    bgModal.addEventListener("click", () => {
      modalAccount.remove();
    });
    document
      .getElementById("close-modal")
      .addEventListener("click", function () {
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
    const errorNode = document.querySelectorAll(
      ".modal-account .form-inner .error"
    )[0];
    submitButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        if (validateForm()) {
          const password = passwordInput?.value;

          switch (type) {
            case "create-new":
              this._generateAccount(password);
              this._onExportPrivateKey(password, true);
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
        loadNoti("success", "Malformed private key or empty!");
        return;
      }
      if (passwordInput.value === "" || confirmPasswordInput.value === "") {
        errorNode.innerText = "* Please enter both passwords";
        return false;
      } else if (passwordInput.value !== confirmPasswordInput.value) {
        errorNode.innerText = "* Passwords do not match";
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
        toggleIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20.2501 21.0001C20.1516 21.0003 20.054 20.9809 19.963 20.9432C19.872 20.9054 19.7894 20.8501 19.7199 20.7803L3.21994 4.28025C3.08522 4.13845 3.01123 3.94964 3.01373 3.75407C3.01624 3.5585 3.09504 3.37164 3.23334 3.23334C3.37164 3.09504 3.5585 3.01624 3.75407 3.01373C3.94964 3.01123 4.13845 3.08522 4.28025 3.21994L20.7803 19.7199C20.8851 19.8248 20.9564 19.9584 20.9854 20.1039C21.0143 20.2493 20.9994 20.4001 20.9427 20.5371C20.8859 20.6741 20.7899 20.7912 20.6666 20.8736C20.5433 20.956 20.3984 21 20.2501 21.0001ZM11.6251 14.8056L9.19744 12.3779C9.18353 12.3641 9.16564 12.355 9.1463 12.3519C9.12696 12.3488 9.10713 12.3518 9.0896 12.3606C9.07206 12.3693 9.05771 12.3833 9.04855 12.4006C9.03939 12.418 9.03589 12.4377 9.03853 12.4571C9.13654 13.087 9.43227 13.6693 9.88298 14.12C10.3337 14.5707 10.916 14.8665 11.5459 14.9645C11.5653 14.9671 11.585 14.9636 11.6024 14.9544C11.6197 14.9453 11.6337 14.9309 11.6424 14.9134C11.6512 14.8959 11.6542 14.876 11.6511 14.8567C11.648 14.8374 11.6389 14.8195 11.6251 14.8056ZM12.3751 9.19462L14.8065 11.6251C14.8204 11.6391 14.8383 11.6483 14.8577 11.6516C14.8772 11.6548 14.8971 11.6518 14.9148 11.643C14.9324 11.6343 14.9469 11.6201 14.956 11.6027C14.9652 11.5853 14.9686 11.5654 14.9659 11.5459C14.8681 10.9152 14.5722 10.332 14.1209 9.88071C13.6696 9.42942 13.0864 9.13348 12.4557 9.03572C12.4362 9.03271 12.4162 9.03594 12.3986 9.04496C12.381 9.05398 12.3668 9.06833 12.3578 9.08595C12.3489 9.10358 12.3457 9.12357 12.3488 9.14309C12.3519 9.16261 12.3611 9.18064 12.3751 9.19462Z" fill="white"/><path d="M23.0156 12.8137C23.1708 12.5702 23.2529 12.2872 23.252 11.9984C23.2512 11.7096 23.1675 11.4271 23.0109 11.1844C21.7706 9.26625 20.1614 7.63688 18.3577 6.47203C16.3594 5.18203 14.1562 4.5 11.985 4.5C10.8404 4.50157 9.7035 4.6882 8.61843 5.05266C8.58807 5.06276 8.56079 5.08046 8.5392 5.10409C8.51761 5.12772 8.50242 5.15647 8.49509 5.18763C8.48776 5.21878 8.48853 5.25129 8.49732 5.28207C8.50611 5.31284 8.52263 5.34085 8.54531 5.36344L10.7597 7.57781C10.7827 7.60086 10.8113 7.61752 10.8427 7.62615C10.8741 7.63478 10.9072 7.63508 10.9387 7.62703C11.6893 7.44412 12.4744 7.45752 13.2183 7.66595C13.9622 7.87438 14.6399 8.27082 15.1862 8.8171C15.7325 9.36338 16.1289 10.0411 16.3373 10.785C16.5458 11.5289 16.5592 12.3139 16.3762 13.0645C16.3683 13.096 16.3686 13.129 16.3773 13.1603C16.3859 13.1916 16.4025 13.2202 16.4255 13.2431L19.6106 16.4306C19.6438 16.4638 19.6881 16.4834 19.735 16.4855C19.7819 16.4876 19.8278 16.472 19.8637 16.4419C21.0898 15.3968 22.1522 14.1739 23.0156 12.8137ZM12 16.5C11.3188 16.5 10.6465 16.3454 10.0337 16.0478C9.42094 15.7502 8.88375 15.3173 8.46263 14.7819C8.04151 14.2464 7.74745 13.6223 7.60262 12.9567C7.45779 12.2911 7.46598 11.6012 7.62656 10.9392C7.63452 10.9077 7.63417 10.8747 7.62555 10.8434C7.61692 10.8121 7.60031 10.7836 7.57734 10.7606L4.44422 7.62609C4.41099 7.59283 4.36649 7.57327 4.31952 7.57127C4.27255 7.56927 4.22655 7.58499 4.19062 7.61531C3.04734 8.59078 1.9875 9.77766 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81937 16.3997 5.59547 17.5486C7.59656 18.8438 9.74625 19.5 11.985 19.5C13.1412 19.4969 14.2899 19.3143 15.39 18.9586C15.4206 18.9488 15.4482 18.9313 15.4702 18.9078C15.4921 18.8842 15.5076 18.8554 15.5152 18.8242C15.5227 18.7929 15.5222 18.7602 15.5134 18.7293C15.5047 18.6983 15.4882 18.6701 15.4655 18.6473L13.2403 16.4227C13.2174 16.3997 13.1888 16.3831 13.1575 16.3744C13.1262 16.3658 13.0932 16.3655 13.0617 16.3734C12.7141 16.4577 12.3577 16.5002 12 16.5Z" fill="white"/></svg>
        `;
      } else {
        input.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
        toggleIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 17.4001C10.932 17.4001 9.88795 17.0834 8.99992 16.49C8.1119 15.8967 7.41976 15.0533 7.01105 14.0666C6.60234 13.0799 6.4954 11.9941 6.70376 10.9466C6.91212 9.89911 7.42642 8.93692 8.18162 8.18172C8.93683 7.42652 9.89901 6.91222 10.9465 6.70386C11.994 6.4955 13.0798 6.60243 14.0665 7.01115C15.0532 7.41986 15.8966 8.11199 16.4899 9.00002C17.0833 9.88804 17.4 10.9321 17.4 12.0001C17.4 13.4323 16.8311 14.8058 15.8184 15.8185C14.8057 16.8312 13.4322 17.4001 12 17.4001ZM12 3.6001C3.6 3.6001 0 12.0001 0 12.0001C0 12.0001 3.6 20.4001 12 20.4001C20.4 20.4001 24 12.0001 24 12.0001C24 12.0001 20.4 3.6001 12 3.6001Z" fill="white"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="white"/></svg><path d="M23.0156 12.8137C23.1708 12.5702 23.2529 12.2872 23.252 11.9984C23.2512 11.7096 23.1675 11.4271 23.0109 11.1844C21.7706 9.26625 20.1614 7.63688 18.3577 6.47203C16.3594 5.18203 14.1562 4.5 11.985 4.5C10.8404 4.50157 9.7035 4.6882 8.61843 5.05266C8.58807 5.06276 8.56079 5.08046 8.5392 5.10409C8.51761 5.12772 8.50242 5.15647 8.49509 5.18763C8.48776 5.21878 8.48853 5.25129 8.49732 5.28207C8.50611 5.31284 8.52263 5.34085 8.54531 5.36344L10.7597 7.57781C10.7827 7.60086 10.8113 7.61752 10.8427 7.62615C10.8741 7.63478 10.9072 7.63508 10.9387 7.62703C11.6893 7.44412 12.4744 7.45752 13.2183 7.66595C13.9622 7.87438 14.6399 8.27082 15.1862 8.8171C15.7325 9.36338 16.1289 10.0411 16.3373 10.785C16.5458 11.5289 16.5592 12.3139 16.3762 13.0645C16.3683 13.096 16.3686 13.129 16.3773 13.1603C16.3859 13.1916 16.4025 13.2202 16.4255 13.2431L19.6106 16.4306C19.6438 16.4638 19.6881 16.4834 19.735 16.4855C19.7819 16.4876 19.8278 16.472 19.8637 16.4419C21.0898 15.3968 22.1522 14.1739 23.0156 12.8137ZM12 16.5C11.3188 16.5 10.6465 16.3454 10.0337 16.0478C9.42094 15.7502 8.88375 15.3173 8.46263 14.7819C8.04151 14.2464 7.74745 13.6223 7.60262 12.9567C7.45779 12.2911 7.46598 11.6012 7.62656 10.9392C7.63452 10.9077 7.63417 10.8747 7.62555 10.8434C7.61692 10.8121 7.60031 10.7836 7.57734 10.7606L4.44422 7.62609C4.41099 7.59283 4.36649 7.57327 4.31952 7.57127C4.27255 7.56927 4.22655 7.58499 4.19062 7.61531C3.04734 8.59078 1.9875 9.77766 1.01859 11.1647C0.84899 11.4081 0.755584 11.6965 0.750243 11.9931C0.744901 12.2897 0.827865 12.5813 0.988591 12.8306C2.22656 14.768 3.81937 16.3997 5.59547 17.5486C7.59656 18.8438 9.74625 19.5 11.985 19.5C13.1412 19.4969 14.2899 19.3143 15.39 18.9586C15.4206 18.9488 15.4482 18.9313 15.4702 18.9078C15.4921 18.8842 15.5076 18.8554 15.5152 18.8242C15.5227 18.7929 15.5222 18.7602 15.5134 18.7293C15.5047 18.6983 15.4882 18.6701 15.4655 18.6473L13.2403 16.4227C13.2174 16.3997 13.1888 16.3831 13.1575 16.3744C13.1262 16.3658 13.0932 16.3655 13.0617 16.3734C12.7141 16.4577 12.3577 16.5002 12 16.5Z" fill="white"/></svg>
        `;
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
        <button class="btn-default block btn-create flex" id="action-create"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white"/>
      </svg> Create new account</button>
        <button class="btn-default block btn-import flex" id="action-import"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16.59 9H15V4C15 3.45 14.55 3 14 3H10C9.45 3 9 3.45 9 4V9H7.41C6.52 9 6.07 10.08 6.7 10.71L11.29 15.3C11.68 15.69 12.31 15.69 12.7 15.3L17.29 10.71C17.92 10.08 17.48 9 16.59 9ZM5 19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19C19 18.45 18.55 18 18 18H6C5.45 18 5 18.45 5 19Z" fill="black"/>
      </svg> Import private key</button>
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
    this._loadAccountDetail();
    // Check if Metamask is available in the browser
    if (!window.ethereum || typeof window.ethereum === "undefined") {
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

// Contract interaction
class ContractInteraction {
  provider;
  WalletData;

  constructor() {}

  loadContract(abiJson, contractAddress) {
    if (!this.WalletData?.Wallet?.privateKey || !this.WalletData?.Balance)
      return;
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
    topics, // For get event log
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

    if (!wallet?.Wallet?.privateKey || !wallet?.Balance) {
      return;
    }
    const transactionCost = getTransactionCost();

    if (Number(transactionCost) > Number(wallet?.Balance)) {
      loadNoti("warning", "Your balance is not enough", 3000);
      return;
    }

    const contract = this.loadContract(abiJson, contractAddress);
    const contractInterface = new ethers.utils.Interface(abiJson);

    const tx = await contract.functions[methodWithParams.replace(/\s/g, "")](
      ...params
    );
    const receipt = await this.checkTransactionStatus(tx.hash);
    wallet._getBalance();

    let filteredLogs = receipt?.logs;
    let eventLogs = {};

    if (topics && topics.length > 0) {
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        filteredLogs = receipt?.logs.filter((log) =>
          log.topics.includes(topic)
        );
        eventLogs[topic] =
          filteredLogs?.map((log) => {
            const parsedLog = contractInterface.parseLog(log);
            return parsedLog;
          }) || [];
      }
    }

    return { receipt, eventLogs };
  }
}

let contractInteraction = new ContractInteraction();
contractInteraction.WalletData = wallet;
contractInteraction.provider = provider;

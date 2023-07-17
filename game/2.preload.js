// DO NOT EDIT
let provider;
const chainIdDefault = "0x" + Number(42070).toString(16);

function importUIDefault() {
  const header = document.createElement("header");
  header.id = "header";
  document.body.insertBefore(header, document.body.firstChild);
}

async function preload() {
  if (!window.ethereum) {
    alert("Please install metamask");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);

  // Check and switch network
  checkAndSwitchNetwork();

  //TODO: preload assets
  await preloadASSETS();
}

async function checkAndSwitchNetwork() {
  if (typeof window.ethereum === "undefined") {
    console.error("Please install MetaMask to use this feature.");
    return;
  }

  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length === 0) {
    console.error("Please log in to MetaMask to use this feature.");
    return;
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId !== chainIdDefault) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdDefault }],
      });
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  } else {
    console.log("Already on NOS network.");
  }
}

async function preloadASSETS() {
  if (Object.keys(GAME_ASSETS).length > 0) {
    for (const key in GAME_ASSETS) {
      const value = GAME_ASSETS[key];
      if (value.indexOf("bfs://") > -1) {
        try {
          // bfs://chainid/address/file_name
          console.log("asset bfs", key, value);
          // split bfs path;
          const bfsPathArray = value.split("/");
          const _ = bfsPathArray[2]; // chain ID
          const address = bfsPathArray[3]; // address
          const fileName = bfsPathArray[4]; // file_name
          let contract = new ethers.Contract(
            BFS_CONTRACTT_ADDRESS,
            BFS_CONTRACTT_ABI_INTERFACE_JSON,
            provider
          );
          let dataBytesArray = new Uint8Array();
          let nextChunk = 0;
          do {
            const chunkData = await contract.load(
              address,
              fileName + ".gz",
              nextChunk
            );
            nextChunk = chunkData[1];
            if (chunkData[0].length > 0) {
              const data = ethers.utils.arrayify(chunkData[0]);
              dataBytesArray = concatTypedArrays(dataBytesArray, data);
            }
          } while (nextChunk != -1);
          if (dataBytesArray.length > 0) {
            const dataString = toString(dataBytesArray);
            const blobFile = URL.createObjectURL(dataURItoBlob(dataString));
            fetch(blobFile).then((res) => {
              // try gunzip file
              res.arrayBuffer().then((e) => {
                window.gunzip(new Uint8Array(e), (e1, n) => {
                  if (e1 == null) {
                    GAME_ASSETS[key] = URL.createObjectURL(
                      new Blob([new Uint8Array(n, 0, n.length)])
                    );
                  } else {
                    GAME_ASSETS[key] = blobFile;
                  }
                  // let img = document.createElement("img");
                  // img.setAttribute("src", GAME_ASSETS[key]);
                  // document.body.append(img);
                });
              });
            });
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

// DO NOT EDIT

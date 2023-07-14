// DO NOT EDIT
let provider;

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

  //TODO: preload assets
  await preloadASSETS();
}

async function preloadASSETS() {
  if (Object.keys(ASSETS).length > 0) {
    for (const key in ASSETS) {
      const value = ASSETS[key];
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
            console.log(dataString);
            const blob = dataURItoBlob(dataString);
            console.log(blob);
            const gzipFile = URL.createObjectURL(blob);
            console.log(gzipFile);
            ASSETS[key] = gzipFile;
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

preload();
importUIDefault();
// DO NOT EDIT

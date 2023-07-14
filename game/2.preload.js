// DO NOT EDIT
let provider;

async function preload() {
    if (!window.ethereum) {
        alert("Please install metamask");
        return;
    }
    // provider = new ethers.providers.Web3Provider(window.ethereum);
    const rpcUrl = "https://l2-node.regtest.trustless.computer/"; // Replace with your RPC URL
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    //TODO: preload assets
    if (Object.keys(ASSETS).length > 0) {
        for (const key in ASSETS) {
            const value = ASSETS[key]
            if (value.indexOf("bfs://") > -1) {
                // bfs://chainid/address/file_name
                console.log("asset bfs", key, value);
                // split bfs path;
                const bfsPathArray = value.split("/");
                const _ = bfsPathArray[2];// chain ID
                const address = bfsPathArray[3];// address
                const fileName = bfsPathArray[4];// file_name
                let contract = new ethers.Contract(BFS_CONTRACTT_ADDRESS, BFS_CONTRACTT_ABI_INTERFACE_JSON, provider);
                let dataBytesArray = new Uint8Array();
                for (let i = 0; i < count.toNumber() + 1; i++) {
                    const chunk = await contract.load(address, fileName, i);
                    const data = ethers.utils.arrayify(chunk[0]);
                    dataBytesArray = concatTypedArrays(dataBytesArray, data);
                }
                const dataString = toString(dataBytesArray);
                console.log(dataString);
            } else {
                console.log("asset", key, value);
            }

        }
    }
}


const toString = (bytes) => {
    var result = '';
    for (var i = 0; i < bytes.length; ++i) {
        const byte = bytes[i];
        const text = byte.toString(16);
        result += (byte < 16 ? '%0' : '%') + text;
    }
    return decodeURIComponent(result);
};

function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

preload();
// DO NOT EDIT

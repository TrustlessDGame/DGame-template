// DO NOT EDIT
let provider;

function preload() {
    if (!window.ethereum) {
        alert("Please install metamask");
        return;
    }
    // provider = new ethers.providers.Web3Provider(window.ethereum);
    const rpcUrl = "https://l2-node.regtest.trustless.computer/"; // Replace with your RPC URL
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
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

const EC = require('elliptic').ec;
const ec = new EC("secp256k1");

const key = ec.genKeyPair();
const pub = key.getPublic("hex");
const pri = key.getPrivate("hex");

console.log("\n Public key: ", pub);
console.log("\n Private key: ", pri);

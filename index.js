const {Transaction, Blockchain} = require('./src/blockchain');
const EC = require('elliptic').ec;
const ec = new EC("secp256k1");

var args = process.argv.slice(2);

/*pass difficulty*/
let sucukCoin = new Blockchain(args[0]);

const myKey = ec.keyFromPrivate("322fcc2eab2f350ae2c78e96cc83fcaac4cc261ab9f204ca2cadba729da4a824");
const myWalletAddress = myKey.getPublic("hex");

const transaction1 = new Transaction(myWalletAddress, "public key of to-wallet", 40);
transaction1.signTransaction(myKey);

sucukCoin.addTransaction(transaction1);

console.log("\n Mining...");
sucukCoin.minePendingTransactions(myWalletAddress);

console.log("\n Balance of "+myWalletAddress.substr(0, 40)+"... is ", sucukCoin.getBalanceOfAddress(myWalletAddress));

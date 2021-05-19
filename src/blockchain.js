const SHA256 = require('crypto-js/sha256');
const present = require('present');
const EC = require('elliptic').ec;

const ec = new EC("secp256k1");

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  calcHash() {
    return SHA256(this.from+this.to+this.amount).toString();
  }

  signTransaction(keyPair) {
    if(keyPair.getPublic("hex")!==this.from) throw new Error("That's not your wallet!");

    const hash = this.calcHash();
    const signature = keyPair.sign(hash, "base64");

    this.signature = signature.toDER("hex");
  }

  isValid() {
    if(this.from===null) return true;
    if(!this.signature || this.signature.length === 0) throw new Error("No signature in this transaction");

    const pub = ec.keyFromPublic(this.from, "hex");
    return pub.verify(this.calcHash(), this.signature);
  }
}

class Block {
  constructor(transactions, prevHash='') {
    this.timestamp = present();
    this.transactions = transactions;
    this.prevHash = prevHash;
    this.nonce = 0;
    this.hash = this.calcHash();
  }

  mineBlock(difficulty) {
    while(this.hash.substring(0, parseInt(difficulty)) !== Array(parseInt(difficulty)+1).join("0")) {
      this.nonce++;
      this.hash = this.calcHash();
      console.log("Hashing: "+this.hash.toString().substr(0, 40)+"...");
    }
  }

  calcHash() {
    return SHA256(
      this.prevHash+
      this.timestamp+
      this.nonce+
      JSON.stringify(this.transactions)
    ).toString();
  }

  hasValidTransactions() {
    for(const transaction in this.transactions) if(!transaction.isValid()) return false;
    return true;
  }
}

class Blockchain {
  constructor(difficulty) {
    this.chain = [this.initChain()];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  initChain() {
    return new Block("Root", "0");
  }

  getLast() {
    return this.chain[this.chain.length-1];
  }

  minePendingTransactions(rewardAddress) {
    let block = new Block(this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block "+block.hash.toString().substr(0, 40)+"... successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, rewardAddress, this.miningReward)
    ];
  }

  addTransaction(transaction) {
    if(!transaction.from || !transaction.to) throw new Error("Transaction must have a from- and to address!");
    if(!transaction.isValid()) throw new Error("Transaction is not valid!");

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for(const block of this.chain) {
      for(const trans of block.transactions) {
        if(trans.to===address) balance += trans.amount;
        if(trans.from===address) balance -= trans.amount;
      }
    }

    return balance;
  }

  isValid() {
    for(let i=1; i<this.chain.length; i++) {
      const cur = this.chain[i];
      const prev = this.chain[i-1];

      if(!cur.hasValidTransactions() || cur.hash!==cur.calcHash() || cur.prevHash!==prev.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;

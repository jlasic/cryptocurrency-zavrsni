const EdDSAUtil = require('../util/EdDSAUtil');
const HashUtil = require('../util/HashUtil');

class Transaction{
    constructor(){
        this.type = 'regular';
        this.txId = null;
        this.inputs = [];
        this.outputs = [];

        /* let input = {
            outputTxId: "transactionId from where UTXO comes from",
            outputIndex: "index of the output in that transaction",
            pubKey: "pubKey",
            //sign outputs with private key
            signature: "sign"
        };
        let output = {
            //destination pub key hash
            address: "address",
            amount: "amount"
        }; */
    }

    verify(){
        return Transaction.verifyTransaction(this);
    }

    /* 
        check if transaction has been tempered with (MUST BE TRUE)
    */
    static verifyTransaction(transaction){
        if (transaction.txId !== Transaction.toHash(transaction))
            return false;
        
        //there is nothing else to check for coinbase tx (no signed inputs)
        if (transaction.type == 'coinbase')
            return true;        

        //check if input/output data chenged
        return transaction.inputs.every(txInput => {
            const hash = HashUtil.hash(
                txInput.outputTxId +
                txInput.outputIndex +
                txInput.pubKey +
                JSON.stringify(transaction.outputs)
            );

            return txInput.signature != null && EdDSAUtil.verifySignature(txInput.pubKey, txInput.signature, hash);
        });
    }

    digest(){
        this.txId = Transaction.toHash(this);
        return this;
    }

    static toHash(transaction){
        return HashUtil.hash(transaction.type + JSON.stringify(transaction.inputs) + JSON.stringify(transaction.outputs));
    }

    static fromJSON(object){
        const transaction = new Transaction();
        for (const key in object) 
            transaction[key] = object[key];
        
        return transaction;
    }
}

module.exports = Transaction;
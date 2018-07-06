const Blockchain = require('./blockchain/blockchain');
const Node = require('./node/node');
const express = require('express');
const Transaction = require('./blockchain/transaction');

/*
    start process with args:
        http_server_port
        p2p_server_port
*/

const app = express();
const blockchain = new Blockchain();
const node = new Node(process.argv[3], blockchain);

//display output data
app.get('/output', function (req, res) {
    res.send(JSON.stringify(blockchain.getOutput(req.query['txId'], req.query['index'])));
});

//check if output is spendable
app.get('/utxo', function (req, res) {
    res.send(JSON.stringify(blockchain.isUTXO(req.query['txId'], req.query['index'])));
});

//display blockcahin
app.get('/blockchain', function (req, res) {
    res.send(JSON.stringify(blockchain.blocks));
});

//connect to peer
app.get('/peer', function(req, res) {
    node.connect(req.query['peer']);
});

//add transaction to mempool
app.get('/transaction', function(req, res) {
    //transaction builder------------
    const transaction = new Transaction();
    transaction.type = 'regular';
    transaction.inputs = [{
        outputTxId: req.query['txId'],
        outputIndex: req.query['index'],
        pubKey: req.query['pubKey'],
        signature: null
    }];
    transaction.outputs = [{
        address: '6815d8884daa3ca956bc15cfd3e838a8cdda1bf63ec91024545294973ef88477',
        amount: req.query['amount']
    }];
    //-------------------------------
    node.wallet.signTransaction(transaction);
    res.send(JSON.stringify('Transaction added ? ' + node.addTransaction(transaction)));
});

//send x amount of coins to address from current wallet
app.get('/send', function(req, res) {
    const transaction = node.wallet.createTransaction(
        req.query['address'],
        parseInt(req.query['amount'])
    );
    res.send(JSON.stringify('Transaction added ? ' + node.addTransaction(transaction)));
});

//get available utxo for this wallet
app.get('/wallet', (req, res) => {
    res.send(JSON.stringify(node.wallet.availableOutputs));
});

app.get('/wallet/balance', (req, res) => {
    res.send(JSON.stringify(node.wallet.getBalance()));
});

app.listen(process.argv[2], function () {
    console.log('Example app listening on port ' + process.argv[2]);
});
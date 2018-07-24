const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile.js');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: 1000000});
});

describe('Lottery Contract', () => {
    it('should deploy a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('should allow one account to enter', async () => {
        let txHash = await lottery.methods.enter().send({from: accounts[0], gas: 1000000, value: web3.utils.toWei("0.0101", "ether")});
        let players = await lottery.methods.getPlayers().call();
        assert.equal(players[0], accounts[0]);
        assert.equal(1, players.length);
    });

    it('should allow a second account to enter', async () => {
        let txHash = await lottery.methods.enter().send({from: accounts[0], gas: 1000000, value: web3.utils.toWei("0.0101", "ether")});
        txHash = await lottery.methods.enter().send({from: accounts[1], gas: 1000000, value: web3.utils.toWei("0.0101", "ether")});
        let players = await lottery.methods.getPlayers().call();
        
        assert.equal(players[0], accounts[0]);
        assert.equal(players[1], accounts[1]);
        assert.equal(2, players.length);
    });

    it('should reject attempts to enter if minimum amount of ether is not sent', async () => {
        try {
            await lottery.methods.enter().send({from: accounts[0], gas: 1000000, value: web3.utils.toWei("0.0001", "ether")}); 
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('should only let manager call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({from: accounts[1], gas: 1000000}); 
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('should send money to the winner and reset players array', async () => {
        await lottery.methods.enter().send({from: accounts[0], value: web3.utils.toWei("2", "ether"), gas: 1000000});
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0], gas: 1000000});
        
        const newBalance = await web3.eth.getBalance(accounts[0]);
        const difference = newBalance - initialBalance;
        const players = await lottery.methods.getPlayers().call();

        assert(difference > web3.utils.toWei("1.9", "ether"));
        assert.equal(0, players.length);
    });
});
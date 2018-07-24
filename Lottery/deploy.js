const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile.js');

const provider = new HDWalletProvider(
    'rug original rural quick layer edge fitness gorilla artefact coral child holiday', 
    'https://rinkeby.infura.io/yt0A7l3carojMqbArYQx'
);
const web3 = new Web3(provider);

const deploy = async () => {
    // Get a list of all accounts
    const accounts = await web3.eth.getAccounts();
    // Use one of the accounts to deploy a contract
    const lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x' + bytecode})
    .send({from: accounts[0], gas: 2000000});

    console.log(interface);
    console.log('Contract deployed to: ', lottery.options.address);
};
deploy();

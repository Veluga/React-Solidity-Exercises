import React, { Component } from "react";
import logo from "./logo.svg";
import web3 from "./web3.js";
import "./App.css";
import lottery from "./lottery.js";

class App extends Component {
  state = {
    manager: "",
    players: "",
    balance: "",
    value: "",
    message: ""
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({
      manager,
      players,
      balance
    });
  }

  onClick = async event => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting for transaction to be processed..." });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    this.setState({ message: "A winner has been picked!" });
  };

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting for transaction to be processed..." });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether"),
      gasPrice: "20000000000"
    });

    this.setState({ message: "You have been entered into the contract!" });
  };

  render() {
    return (
      <div className="App">
        <h2>Lottery Contract</h2>
        <p>
          This contract is manager by: {this.state.manager}. <br />
          There are currently {this.state.players.length} players entered,
          competing to win {web3.utils.fromWei(this.state.balance, "ether")}{" "}
          ether.
        </p>
        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <p>Enter amount of ether to enter: </p>
          <input
            value={this.state.value}
            onChange={event => {
              this.setState({ value: event.target.value });
            }}
          />
          <button>Enter</button>
        </form>
        <hr />
        <h4>Ready to pick a winner?!</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr />
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;

import React, { useState, useEffect } from 'react';
const ethers = require('ethers');
const { ABI, Address } = require('./secret.json');


function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);


  useEffect(() => {
    initializeEthers();
  }, []);

  const initializeEthers = async () => {
    if (window.ethereum) {
      try {
        handleConnectWallet()
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask extension not detected!');
    }
  };

  const subscribeToAccountChanges = (provider) => {
    provider.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
    });
  };

  const handleConnectWallet = async () => {

    if (window.ethereum) {
      console.log('detected');
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        subscribeToAccountChanges(provider);
        const signer = provider.getSigner();
        setSigner(signer);
        // console.log(await signer.getAddress())
        const contract = new ethers.Contract(Address, ABI, provider);
        const ContractWithSigner = contract.connect(signer);
        const balance = await provider.getBalance(await signer.getAddress())

        setBalance(ethers.utils.formatEther(balance))
        setContract(ContractWithSigner);
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    }
    else {
      alert('Meta Mask not detected');
    }
  };

  const handleDisconnectWallet = () => {
    setAccount('');
    setBalance(0)
  };

  const handleDeposit = async () => {
    const weiAmount = ethers.utils.parseEther(amount.toString());
    try {
      await contract.depositETH({ value: weiAmount });
      alert('Deposit successful!');
    } catch (error) {
      alert('Error depositing funds!')
      console.error('Error depositing funds:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!provider) return;
    const weiAmount = ethers.utils.parseUnits(amount, 8);
    try {
      await contract.withdraw(weiAmount);
      alert('Withdrawal successful!');
    } catch (error) {
      alert('Error withdrawing funds!');
      console.error('Error withdrawing funds:', error);
    }
  };

  return (
    <div className="App">
      <h1>Ethereum Backed Stable Coin</h1>
      <p>Connected Account: {account}</p>
      <p>Balance: {balance}</p>
      {!account && (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      )}
      {account && (
        <button onClick={handleDisconnectWallet}>Disconnect Wallet</button>
      )}
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>

    </div>
  );
}

export default App;

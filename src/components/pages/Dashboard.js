import { Alchemy, Network, Wallet, Utils } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import './Dashboard.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_GOERLI,
};


// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

const network = "goerli";
const contractAddress = "0x7EaEd8E4b176c683CA1173506Df334Fa5eDFea6b";
const contractABI = [
    "function mint()",
    "function updateMemberSkills(uint tokenId, uint _skill_1, uint _skill_2) public",
    "function getTokenURI(uint256 tokenId) public view returns (string memory)",
    "function memberSkillsStructMap(address memberAddress) public view returns(tuple(uint256 memberId, uint256 skill_1, uint256 skill_2, uint256 skill_3, uint256 skill_4, uint256 skill_5, uint256 skill_6, uint256 skill_7, uint256 skill_8, uint256 skill_8, uint256 skill_9, uint256 skill_10, unit256 projectsCompleted))",
    "function name() view returns (string memory)",
    "function ownerOf(uint256 tokenId) public view returns (string memory)",
    "function symbol() public view returns(string memory)",
    // "function tokenURI(uint256 tokenId) public view returns (string memory)"
];


// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(network, process.env.REACT_APP_ALCHEMY_API_KEY);
// console.log(alchemyProvider)
//contract
const archiDaoContractInstance = new ethers.Contract(contractAddress, contractABI, alchemyProvider);

function Dashboard() {
  const [blockNumber, setBlockNumber] = useState();
  const [contractName, setContractName] = useState();
  const [symbol, setSymbol] = useState('');
  const [walletAddress, setWalletAddress] = useState('0x...')
  const [walletSigner, setWalletSigner] = useState('');
  const [isNFTOwner, setIsNFTOwner] = useState('')

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }
    getBlockNumber();

    async function getContractName() {
        setContractName(await archiDaoContractInstance.name())
    }
    getContractName()

    async function getContractSymbol() {
        setSymbol(await archiDaoContractInstance.symbol())
    }
    getContractSymbol()

    // async function getTokenURI() {
    //     console.log(await archiDaoContractInstance.getTokenURI(1))
    // }
    // getTokenURI()

  });

  const connectMetamask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum); 
    const accounts = await provider.send("eth_requestAccounts", []); 
    const account = handleAccountsChanged(accounts);
    const signer = provider.getSigner();

    setWalletAddress(account);
    setWalletSigner(signer);

    // async function getMemberSkillsStructMap() {
    //     console.log(await archiDaoContractInstance.memberSkillsStructMap('0x04Ed8A52c9D99eB0925632273Ef30c5dbE0823dC'))
    // }
    // getMemberSkillsStructMap()
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0 ) {
        console.log("Please connect to metamask")

    } else {
        window.ethereum.on("accountsChanged", () => { window.location.reload() });
        return accounts[0];
    }
  }

  const logInWithNFT = async () => {
    if(walletAddress) {
        const isNFTOWner = await alchemy.nft.verifyNftOwnership(walletAddress, contractAddress);
        const string = isNFTOWner.toString();
        setIsNFTOwner(string);
    }
  }

  const mintNFT = async () => {
    const archiDaoContractInstanceSigner = new ethers.Contract(contractAddress, contractABI, walletSigner);

    const mintNFT = await archiDaoContractInstanceSigner.mint(); 
    console.log(mintNFT);
  }


  return (
    <div className="App">
      <h1>Goerli Testnet</h1>
        <div>Block Number: {blockNumber}</div>
        <button onClick={mintNFT}>Mint NFT</button>
        <div>Contract Name: {contractName}</div>
        <div>Contract Symbol: {symbol}</div>
        <button onClick={connectMetamask}>Connect Wallet</button>
        <div>Wallet Address: {walletAddress} </div>
        <button onClick={logInWithNFT}>Log in with NFT</button>
        <div> Does your wallet contain an ArchiDAO NFT? <br /> {isNFTOwner}</div>
        
    </div>
    );
}

export default Dashboard;
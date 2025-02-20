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
    "function addressToNFTNumber(address ownerAddress) public view returns(tuple(uint256 nftNumber))"
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
  const [walletAddress, setWalletAddress] = useState()
  const [walletSigner, setWalletSigner] = useState('');
  const [isNFTOwner, setIsNFTOwner] = useState('');
  const [tokenMetadata, setTokenMetadata] = useState();

  const [hideDiv, setHideDiv] = useState(false)

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

  }, []);

  /// required for the change of text in the button during connection and disconnection 
  const [buttonText, setButtonText] = useState('Connect your wallet');
  
  ///when it disconnects it reloads the page   
  function handleClick() {
    if (buttonText === 'Connect your wallet'){
      setButtonText('Disconnect your wallet');
    }else {
      window.location.reload();
      setButtonText('Connect your wallet');
    }
  }

  const connectMetamask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum); 
    const accounts = await provider.send("eth_requestAccounts", []); 
    const account = handleAccountsChanged(accounts);
    const signer = provider.getSigner();

    handleClick()
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

  const mintNFT = async () => {
    const archiDaoContractInstanceSigner = new ethers.Contract(contractAddress, contractABI, walletSigner);

    const mintNFT = await archiDaoContractInstanceSigner.mint(); 
    console.log(mintNFT);
  }

  useEffect(() => {
    const logInWithNFT = async () => {
      if(walletAddress) {
          const isNFTOwner = await alchemy.nft.verifyNftOwnership(walletAddress, contractAddress);
          setIsNFTOwner(isNFTOwner);
          const addressNFTNumber = await archiDaoContractInstance.addressToNFTNumber(walletAddress);
          let ownerNFTNumber = await addressNFTNumber.toString();

          if(isNFTOwner) {
            // console.log(isNFTOwner);
            setHideDiv(true);
            const getTokenURI = await archiDaoContractInstance.getTokenURI(ownerNFTNumber);

            const tokenURISlice = getTokenURI.slice(29)

            const base64ToStr = atob(tokenURISlice);
            // console.log(base64ToStr);

            {/* image <div>{tokenMetadata.slice(96, 171)}</div> */}

            setTokenMetadata(base64ToStr)
            const jsonStr = atob(tokenMetadata);
const jsonObj = JSON.parse(jsonStr);
console.log(jsonObj);

          } else if(!isNFTOwner) {
            console.log('You are not yet a member of ArchiDAO')
          }
      }
    }
    logInWithNFT()

  }, [walletAddress])

  const Results = () => {
    return (
      <div>
        {/* <div> You are a Member of ArchiDAO</div> */}
        {/* <h3><b>Dashboard</b></h3> */}
        {/* <div>TokenURI : {tokenMetadata}</div> */}
        {/* <div>Member Id: {tokenMetadata ? tokenMetadata.slice(37, 38) : null}</div>
        <div>Description: {tokenMetadata ? tokenMetadata.slice(56, 86) : null} </div>
        <div>Project Completed: {tokenMetadata ? tokenMetadata.slice(196, 197) : null} </div> */}
        {/* <img src={tokenMetadata ? tokenMetadata.slice(96, 171) : null} ></img> */}
        
      </div>
    )
  }

  const spliceTokenURI = () => {
    console.log(tokenURI)
  }




  return (
    <div className="App">
 
 <div className ="about__container">
              { 
                <button onClick={connectMetamask} style={{position:'fixed', right:'8vw', top:'130px', backgroundColor:'white',  color:'black', textAlign:'right', height:'30px', fontFamily:'EG', fontSize:'20px' }} >{buttonText}</button>
              }
              <div className="about__content"  ><p style={{position:'fixed', right:'8vw', top:'180px',   color:'black', textAlign:'right', height:'30px', fontFamily:'EG' }}>Wallet Address: {walletAddress} </p></div>
              <h1 className="about__title" style={{color:'black', textAlign:'left', paddingLeft:'100px', paddingTop:'90px'}}>DASHBOARD</h1>
                <div className="about__content" >
                    <p style={{color:'black', textAlign:'left', paddingLeft:'100px', paddingTop:'10px'}}>ArchiDAO Members Count:</p> </div>
            </div>
          

        {/* <div>Block Number: {blockNumber}</div> */}
        {/* <button onClick={mintNFT}>Mint NFT</button> */}
        <div style={{color:'black', textAlign:'left', paddingLeft:'100px', paddingTop:'90px', fontFamily:'Krona One', fontWeight:'bold', fontSize:'20px', letterSpacing:'8px' }}> {contractName}</div>
         {/*<div>Contract Symbol: {symbol}</div> */}
         {tokenMetadata ? (
       <div className='dash'>
        <div className='dash__left'> 
          <div className='dash__left__top'>
            <div className='titles'>
              <div>MEMBER ID </div>
              <div>PROJECTS COMPLETED</div>
            </div>
            <div className='boxes1'> 
           
              <div>{tokenMetadata ? tokenMetadata.slice(37, 38) : null}</div>
              <div>{tokenMetadata ? tokenMetadata.slice(196, 197) : null}</div>
            </div>

             </div>
             
          <div className='dash__left__bottom'> 
          <div className='title'>NFT IMAGE</div>
          </div>
        </div>
        <div className='dash__right'>
          
          <div className='dash__right__left'> </div>
          <div className='dash__right__right'> </div>
        </div>
       </div> ) : null}
      
        <div>
          { hideDiv ? <Results /> : null}
        </div>
        
    </div>
    );
}

export default Dashboard;
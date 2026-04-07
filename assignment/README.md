# NoFeeSwap DEX with MEV Protection

A complete decentralized exchange (DEX) implementation featuring automated MEV (Maximal Extractable Value) protection through sandwich attack detection and mitigation.

## 🎯 What This Project Does

**NoFeeSwap** is a DEX that allows users to:
- **Initialize Liquidity Pools** with customizable kernel curves (visualized graphically)
- **Add/Remove Liquidity** to/from pools
- **Swap Tokens** with real-time price estimation and slippage protection
- **Automatic MEV Protection** - The bot monitors mempool transactions and executes sandwich attacks to protect users from MEV exploitation

### Key Features
- ✅ **Graphical Kernel Visualization** - Interactive charts showing pool liquidity curves
- ✅ **Complete Liquidity Management** - Mint and burn LP positions
- ✅ **Advanced Swap Interface** - Price impact calculation, slippage tolerance
- ✅ **MEV Sandwich Bot** - Real-time mempool monitoring with priority gas auctions
- ✅ **Web3 Integration** - MetaMask wallet connection and transaction management

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MetaMask Browser Extension** - [Install here](https://metamask.io/)
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NoFreeSwap
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd packages/frontend
npm install
```

#### Contracts Dependencies
```bash
cd ../contracts
npm install
```

#### Bot Dependencies
```bash
cd ../bot
npm install
```

### 3. Start Local Blockchain
```bash
# In a new terminal (keep this running)
anvil --block-time 12
```
This starts a local Ethereum testnet with 12-second block times.

### 4. Deploy Smart Contracts
```bash
# In another terminal
cd packages/contracts
npx hardhat run scripts/deploy.js --network localhost
```
This deploys the NoFeeSwap router contract to your local blockchain.

### 5. Configure MetaMask

#### Add Localhost Network
1. Open MetaMask extension
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter:
   - **Network Name**: `Localhost 8546`
   - **New RPC URL**: `http://127.0.0.1:8546`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

#### Import Test Account
1. In MetaMask: Account icon → "Import Account" → "Private Key"
2. Copy the first private key from Anvil terminal output (usually `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)
3. You should see ~10,000 ETH balance

## 🎮 Running the Application

### Start the Frontend
```bash
cd packages/frontend
npm run dev
```
Access at: `http://localhost:3000`

### Start the MEV Bot
```bash
# In another terminal
cd packages/bot
node index.ts
```

## 🧪 Testing the Application

### 1. Initialize a Pool
- Go to "Init Pool" tab
- Enter `Log Offset: 0`
- Click "Initialize Pool"
- Confirm transaction in MetaMask

### 2. Add Liquidity
- Go to "Liquidity" tab
- Click "Approve Tokens"
- Enter amounts: `Token A: 100`, `Token B: 100`
- Click "Add Liquidity"

### 3. Execute a Swap (Test MEV Protection)
- Go to "Swap" tab
- Click "Approve Token A"
- Enter: `Amount In: 10`, `Slippage: 1.0`
- Click "Swap"
- **Watch the bot terminal** - it should detect the transaction and execute a sandwich attack!

### 4. Remove Liquidity
- Go to "Liquidity" tab
- Enter `Liquidity Amount: 50`
- Click "Burn Liquidity"

## 🏗️ Architecture Overview

### Smart Contracts
- **SimpleRouter.sol**: Handles token swaps, liquidity management, and pool initialization
- Deployed on local Anvil network at runtime

### Frontend (Next.js + React)
- **Init Pool**: Pool creation with kernel curve visualization
- **Liquidity**: Add/remove liquidity positions
- **Swap**: Token exchange with price estimation
- Uses Wagmi for Web3 integration

### MEV Protection Bot
- Monitors pending transactions via WebSocket
- Detects swap transactions targeting the router
- Executes sandwich attacks using Priority Gas Auctions
- Front-run: Higher gas price to execute first
- Back-run: Lower gas price to execute last

## 📁 Project Structure

```
NoFreeSwap/
├── packages/
│   ├── frontend/          # Next.js React application
│   │   ├── app/
│   │   │   ├── page.tsx           # Main app with tabs
│   │   │   ├── InitializePool.tsx # Pool creation UI
│   │   │   ├── ManageLiquidity.tsx # Liquidity management
│   │   │   ├── Swap.tsx           # Token swap interface
│   │   │   ├── constants.ts       # Contract addresses & ABIs
│   │   │   └── providers.tsx      # Web3 providers
│   ├── contracts/         # Hardhat smart contracts
│   │   ├── contracts/
│   │   │   └── operator/
│   │   │       └── SimpleRouter.sol
│   │   └── scripts/
│   │       └── deploy.js
│   └── bot/               # MEV monitoring bot
│       └── index.ts
├── core_repo/             # NoFeeSwap core contracts (Brownie)
├── operator_repo/         # Additional operator contracts
└── assignment/
    └── README.md          # This file
```

## 🔧 Troubleshooting

### Frontend Won't Load
- Ensure all dependencies are installed: `npm install` in each package
- Check port 3000 isn't in use
- Clear browser cache and hard refresh (Ctrl+F5)

### MetaMask Issues
- Ensure connected to "Localhost 8546" network
- Verify account has ETH balance
- Try refreshing the page

### Contract Deployment Fails
- Ensure Anvil is running on port 8546
- Check Hardhat config has correct network settings
- Verify no other processes using port 8545/8546

### Bot Not Detecting Transactions
- Confirm bot is targeting correct contract address
- Check WebSocket connection to `ws://127.0.0.1:8546`
- Ensure swap transactions are going through the router

## 🎉 Success Indicators

Your NoFeeSwap DEX is working when:
- ✅ Frontend loads all three tabs without errors
- ✅ MetaMask connects and shows localhost network
- ✅ Pool initialization succeeds
- ✅ Liquidity operations complete
- ✅ Swap transactions execute
- ✅ Bot terminal shows: `"🎯 Target Swap Detected in Mempool!"`
- ✅ Bot executes sandwich attack transactions

## 📚 Learn More

- **NoFeeSwap Protocol**: Advanced DEX with customizable liquidity curves
- **MEV (Maximal Extractable Value)**: Front-running and sandwich attacks
- **Priority Gas Auctions**: Gas price manipulation for transaction ordering
- **Web3 Development**: React, Wagmi, Hardhat, Ethers.js

---

**Built with**: Next.js, React, TypeScript, Wagmi, Hardhat, Ethers.js, Recharts
# EIP-7702 & EIP-7710 Demo

A comprehensive demo implementing **two modern approaches** for EOA account abstraction:

## 🚀 Implementations

### 1. EIP-7702: Batch Transactions (useSendCalls)

Simple approach using **wagmi/experimental** `useSendCalls`:

- 🚀 **Zero Setup**: No smart account deployment needed
- 🦊 **MetaMask Integration**: Auto-prompts to upgrade EOA to smart account
- ⚡ **Atomic Execution**: All transactions succeed or all fail
- 📦 **ERC-5792 Compliant**: Using `wallet_sendCalls` standard
- ✅ **5 lines of code** to execute batch transactions

👉 **Perfect for**: Simple batch transactions, quick demos, minimal complexity

### 2. EIP-7710: Delegation Toolkit (Full Framework)

Powerful approach using **@metamask/delegation-toolkit**:

- 🎯 **Full Delegation Framework**: Create, sign, and redeem delegations
- 🔐 **Caveats System**: 40+ restriction types (time, amount, targets, etc.)
- 💰 **Sponsored Gas**: Pimlico Paymaster integration
- 🤖 **Advanced Automation**: Perfect for bots, recurring payments, DeFi automation
- 📋 **5-Step Wizard**: Guided workflow from wallet connection to redemption
- 🏗️ **Smart Account Deployment**: Full control over smart accounts

👉 **Perfect for**: DeFi automation, social recovery, recurring payments, bot trading

## 📚 Documentation

- [EIP-7702 Implementation Guide](.docs/wagmi-viem-implementation.md)
- [EIP-7710 Delegation Toolkit Guide](.docs/delegation-toolkit-implementation.md)
- [Comparison V1 vs V2](.docs/comparison-v1-vs-v2.md)

## Main Features

- 🔐 **Authorization Signing**: Sign authorization to delegate EOA to smart contract
- ⚡ **Batch Transactions V2** (NEW): Modern approach with `useSendCalls` - MetaMask automatically handles authorization
- ⚡ **Batch Transactions V1**: Manual authorization flow for advanced use cases
- 🔑 **Session Keys**: Manage session keys with expiration
- 💰 **Paymaster Integration**: Support for sponsored gas fees
- 👥 **Operator Management**: Manage operator permissions for accounts
- 📊 **Monitoring**: Track delegation status and activities

## Project Structure

```
eip-7702/
├── packages/
│   ├── contracts/          # Smart contracts (Hardhat)
│   │   ├── contracts/      # Solidity contracts
│   │   ├── scripts/        # Deployment scripts  
│   │   ├── test/          # Contract tests
│   │   └── typechain-types/ # Generated types
│   ├── frontend/          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/ # React components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── lib/       # Utilities
│   │   │   └── types/     # TypeScript types
│   └── shared/            # Shared utilities
└── README.md
```

## System Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

## Quick Start

### 1. Install dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd eip-7702

# Install dependencies
pnpm install
```

### 2. Setup environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Get free Alchemy API key: https://www.alchemy.com/
# Update .env.local with your keys:
# NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE

# Contract addresses are pre-configured for Sepolia
```

### 3. Start application

```bash
# Start development server
pnpm dev
```

### 4. Test EIP-7702 Batch Transactions

1. Open http://localhost:3000
2. Connect MetaMask wallet
3. Switch to **Sepolia testnet**
4. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
5. Go to **"Batch (EIP-7702)"** tab
6. Click **"Execute Batch"**
7. MetaMask prompts: **"Upgrade to Smart Account?"** → Approve
8. All transactions execute atomically! 🎉
9. Check result on Etherscan

**That's it! No manual authorization needed - MetaMask handles everything!**

### 5. Test EIP-7710 Delegation Toolkit

1. Go to **"Delegation (EIP-7710)"** tab
2. Add **Pimlico API key** to `.env.local` (get free key: https://www.pimlico.io/)
3. **Step 1**: Wallet already connected ✅
4. **Step 2**: Click **"Deploy Delegator"** → Deploy your smart account (gas sponsored!)
5. **Step 3**: Click **"Create Delegate"** → Generate delegate account locally
6. **Step 4**: Click **"Create Delegation"** → Sign delegation with caveats
7. **Step 5**: Click **"Redeem Delegation"** → Execute transaction on behalf of delegator
8. View transaction on Etherscan! 🎉

**Advanced**: Delegation stored in localStorage, gas sponsored by Pimlico Paymaster!

## Smart Contracts

### 🌟 EIP7702StatelessDelegator (Recommended)

**Address**: `0x63c0c19a282a1b52b07dd5a65b58948a07dae32b` (Sepolia)

Contract used in real EIP-7702 transactions on Sepolia:
- **Stateless Design**: No contract storage, lower gas costs
- **Simple & Efficient**: Single execute function with Execution struct
- **Battle-tested**: Used in production transactions
- **ERC-7579 Compatible**: Follows Module standard

```solidity
struct Execution {
    address target;
    uint256 value;
    bytes callData;
}

function execute(Execution calldata _execution) external payable;
```

## Frontend Features

### Tech Stack
- **Next.js 15** with App Router
- **React 19** with Server Components  
- **Viem 2.37.12** for EIP-7702 support
- **Wagmi 2.x** for wallet management
- **Tailwind CSS** + Radix UI for styling

### Main Components

- **Dashboard**: Main interface with 4 tabs (Authorize, Batch, Manage, Info)
- **AuthorizationForm**: 
  - Sign EIP-7702 authorization
  - Send test transaction with authorization
  - Display authorization details
  - Link to Etherscan
- **BatchTransactionForm**: 
  - Create multiple transaction calls
  - Auto sign authorization + encode + send
  - Atomic execution (all or nothing)
- **WalletConnect**: MetaMask connection with network detection
- **AccountInfo**: Display address, balance, delegation status

### Hooks

- **useEIP7702Authorization**: 
  - Sign authorization following MetaMask Toolkit pattern
  - Browser wallet compatible (personal_sign)
  - Parse signature to (r, s, yParity)
- **useEIP7702Transaction**: 
  - Send type 0x04 transactions
  - Include authorizationList
  - Wait for confirmation
- **useEIP7702Contract**: Interact with implementation contract
- **useEIP7702ContractRead**: Read contract state

### Key Features

✅ **Complete EIP-7702 Flow**:
1. Sign authorization → 2. Encode call data → 3. Send type 0x04 tx → 4. Verify on Etherscan

✅ **Error Handling**: Comprehensive error messages and recovery flows

✅ **Network Detection**: Auto-detect wrong network and prompt switch

✅ **Loading States**: Visual feedback for async operations

✅ **Transaction Tracking**: Links to Etherscan for all transactions

## Development Commands

```bash
# Install all dependencies
pnpm install

# Development - run all services
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

### Contract-specific commands

```bash
# Compile contracts
pnpm contracts:build

# Run contract tests
pnpm contracts:test

# Deploy to localhost
pnpm contracts:deploy

# Deploy to sepolia
pnpm contracts:deploy --network sepolia
```

### Frontend-specific commands

```bash
# Start development server
pnpm frontend:dev

# Build for production
pnpm frontend:build

# Type check
pnpm frontend:type-check
```

## Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SEPOLIA_RPC_URL`
   - `NEXT_PUBLIC_PIMLICO_API_KEY` (optional, for EIP-7710)
6. Click **"Deploy"**
7. Done! Your app is live 🎉

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
pnpm add -g vercel

# Login to Vercel
vercel login

# Build and deploy to production
pnpm build
vercel --prod

# Or deploy preview (for testing)
vercel
```

#### Environment Variables Setup on Vercel

Go to your project settings → Environment Variables and add:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

**Note**: Environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser.

### Deploy to Other Platforms

#### Netlify
```bash
pnpm build
# Deploy .next folder
```

#### Self-hosted (VPS/AWS/DigitalOcean)
```bash
# Build application
pnpm build

# Start production server
pnpm start

# Or use PM2 for process management
pm2 start pnpm --name "eip-7702" -- start
```

### Testnet Deployment (Contracts Only)

1. Configure `.env` with RPC URLs and private keys
2. Deploy contracts: `pnpm contracts:deploy --network sepolia`
3. Update contract addresses in frontend
4. Build frontend: `pnpm build`

### Mainnet Deployment (Contracts Only)

1. Audit contracts thoroughly
2. Test on testnet first
3. Configure production environment
4. Deploy with proper gas settings
5. Verify contracts on Etherscan

## Testing

### Unit Tests

```bash
# Test contracts
pnpm contracts:test

# Test with coverage
pnpm contracts:test --coverage

# Test specific file
pnpm contracts:test test/EIP7702Implementation.test.ts
```

### Integration Tests

```bash
# Test full flow with local node
pnpm contracts:dev
pnpm contracts:deploy
# Test frontend with deployed contracts
```

## Security Considerations

### Smart Contract Security

- ✅ ReentrancyGuard for external calls
- ✅ Access control for sensitive functions  
- ✅ Input validation and sanity checks
- ✅ Gas limits to avoid DoS
- ✅ Proper nonce management
- ✅ Emergency pause functionality

### Frontend Security

- ✅ Signature verification
- ✅ Transaction confirmation UIs
- ✅ Rate limiting for API calls
- ✅ Input sanitization
- ✅ Secure key management prompts

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check RPC URL and network configuration
   - Ensure sufficient ETH for deployment
   - Verify compiler version compatibility

2. **Frontend connection issues**
   - Check wallet connection
   - Verify network matches contract deployment
   - Check contract addresses configuration

3. **Transaction failures**
   - Check gas limits
   - Verify authorization signatures
   - Ensure sufficient balances

### Debug Commands

```bash
# Check contract sizes
pnpm contracts:build && ls -la packages/contracts/artifacts

# Verify deployment
npx hardhat verify --network sepolia <contract-address>

# Check frontend build
pnpm frontend:build --debug
```

## Contributing

1. Fork repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for more details.

## Resources

- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Viem Documentation](https://viem.sh)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
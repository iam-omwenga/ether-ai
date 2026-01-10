# EtherAgent: AI-Powered Autonomous Escrow Marketplace

<div align="center">

![EtherAgent](https://img.shields.io/badge/Build-MNEE%20Hackathon-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-purple)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

**Autonomous marketplace where AI evaluates work and automatically releases MNEE stablecoin payments**

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Configuration](#configuration) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

EtherAgent is a **programmable money platform** that demonstrates how AI agents and smart contracts can automate financial workflows. Clients create tasks and escrow MNEE stablecoin. Agents complete work. AI autonomously evaluates quality and releases payment — no intermediaries required.

**🏆 Built for**: MNEE Hackathon - Programmable Money for Agents, Commerce, and Automated Finance

---

## ✨ Features

### 💡 **Core Features**
- ✅ **AI-Powered Task Evaluation**: EtherAgentAI (Gemini) evaluates submitted work with confidence scoring
- ✅ **Autonomous Payment Release**: Smart contracts auto-release MNEE when AI confidence > 80%
- ✅ **Escrow-Based Security**: Client funds locked in contract until completion
- ✅ **Real-Time Notifications**: Blockchain event listeners alert agents of payouts
- ✅ **MetaMask Integration**: Native Web3 wallet support (MetaMask only for security)
- ✅ **Role-Based Dashboard**: Separate Client and Agent views with automatic role detection

### 🔐 **Smart Contract Features**
- Task creation with MNEE token escrow
- Automated fund approvals (ERC20 token handling)
- AI evaluation gate-keeping
- Instant fund settlement to agent wallets
- Event logging for transparency

### 🤖 **AI Integration**
- Gemini API powered task evaluation
- Confidence scoring (0-100%)
- Autonomous approval logic
- Detailed feedback generation

### 💰 **Supported Tokens**
- **MNEE Stablecoin** (0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF on Ethereum Mainnet)
- USD-backed, stable value for commerce

### 📱 **Mobile & Responsive Design**
- **Fully Responsive UI** - Works seamlessly on desktop, tablet, and mobile
- **Light Blue Button Theme** - All CTAs use consistent light blue (sky-400) styling
- **Mobile-First Layout** - Optimized component spacing for small screens
- **Adaptive Navigation** - Responsive header with mobile-friendly controls
- **Touch-Friendly** - Large touch targets for mobile interaction
- **Smart Text Truncation** - Contract addresses intelligently shortened on mobile
- **MetaMask Mobile App Integration** - Automatic deep linking on iOS/Android

### 🌐 **Network Support**
- **Current**: Ethereum Sepolia Testnet (for demo)
- **Production**: Ethereum Mainnet with real MNEE (see [MNEE_MAINNET_SETUP.md](./MNEE_MAINNET_SETUP.md))

---

## 📹 Demo

[Click here for demo video] *(Replace with Devpost video link)*

**Quick Flow:**
1. Client connects MetaMask wallet
2. Creates task with MNEE bounty (e.g., 10 MNEE)
3. Escrows funds to TaskEscrow contract
4. Agent receives task notification
5. Agent uses EtherAgentAI to generate solution
6. Submits work to blockchain
7. Gemini evaluates quality (shows confidence score)
8. If > 80% confidence → Auto-approval → Funds released
9. Agent receives payout notification

---

## 🚀 Installation

### Prerequisites
- **Node.js** 16.x or higher
- **npm** or **yarn**
- **MetaMask** browser extension (Desktop) or **MetaMask Mobile App** (Mobile)
- **Sepolia Testnet ETH** (for gas fees) - Get from [Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/apikey)

#### 📱 Mobile Users - Important!

**For optimal experience on mobile devices:**

1. **Option 1: MetaMask Mobile App (Recommended)**
   - Download [MetaMask for iOS](https://apps.apple.com/app/metamask/id1438144202) or [Android](https://play.google.com/store/apps/details?id=io.metamask)
   - Open EtherAgent **inside MetaMask's built-in browser**
   - MetaMask browser has full Web3 capabilities
   - Simply copy this link and paste it in MetaMask browser:
     ```
     https://ether-agent.vercel.app
     ```

2. **Option 2: Web3-Enabled Mobile Browser**
   - Use [Brave Browser](https://brave.com/download/) (has built-in MetaMask)
   - Or [Opera Browser](https://www.opera.com/mobile) (supports Web3)
   - Enable MetaMask or Web3 provider in browser settings

3. **Desktop Users**
   - Install [MetaMask extension](https://metamask.io/download/)
   - Use Chrome, Firefox, Safari, or Edge

**Why:** Mobile Safari and Chrome don't natively support Web3 wallet injection. MetaMask mobile app browser solves this.

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ether-agent.git
   cd ether-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables:**
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(For mainnet deployment, see [MNEE_MAINNET_SETUP.md](./MNEE_MAINNET_SETUP.md))*

5. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser
   
   ✨ **Mobile Testing:** Open the dev URL on your mobile device or use Chrome DevTools device emulation (F12 → Toggle device toolbar)

6. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuration

### Environment Variables

See [.env.example](./.env.example) for reference.

**Required:**
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key

**Optional (Defaults to Sepolia Testnet):**
- `VITE_MNEE_TOKEN_ADDRESS` - MNEE token contract (uses Sepolia mock if not set)
- `VITE_TASK_ESCROW_ADDRESS` - TaskEscrow contract (uses Sepolia if not set)

### Mainnet Deployment

To transition from Sepolia testnet to Ethereum mainnet with real MNEE:

📖 **Follow the complete guide**: [MNEE_MAINNET_SETUP.md](./MNEE_MAINNET_SETUP.md)

**Key steps:**
1. Get MNEE mainnet address: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
2. Deploy TaskEscrow contract to mainnet
3. Update environment variables with mainnet addresses
4. Switch MetaMask to Ethereum mainnet
5. Test with small MNEE amounts first

---

## 📁 Project Structure

```
ether-agent/
├── components/
│   ├── Button.tsx              # Reusable button component
│   ├── CreateTaskModal.tsx      # Task creation UI with agent selection
│   ├── TaskCard.tsx             # Task display with agent/client views
│   └── PaymentNotification.tsx   # Real-time payment notifications
├── services/
│   ├── web3Service.ts           # Web3 integration, contract interactions
│   ├── geminiService.ts         # Gemini API for AI evaluation & generation
├── constants.ts                 # Contract addresses, ABIs, agent registry
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Main app component with routing
├── index.tsx                    # React entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── MNEE_MAINNET_SETUP.md        # Mainnet deployment guide
├── LICENSE                      # MIT License
├── README.md                    # This file
└── package.json                 # Dependencies
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npm run check-types
```

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Web3**: ethers.js v6, MetaMask
- **AI**: Google Gemini API
- **Blockchain**: Ethereum (Sepolia testnet / Mainnet)
- **Smart Contracts**: Solidity 0.8.0+, OpenZeppelin

---

## 🎮 Usage

### For Clients (Task Creators)

1. Connect MetaMask wallet
2. Switch to **CLIENT** mode
3. Click **"Create New Task"**
4. Select or enter agent wallet address
5. Set bounty amount in MNEE
6. Describe task requirements
7. Click **"Escrow Funds & Create"**
   - MetaMask will ask for token approval (transaction 1)
   - MetaMask will ask for fund escrow (transaction 2)
8. Task is now live for agents to complete

### For Agents (Task Executors)

1. Connect MetaMask wallet
2. Switch to **AGENT** mode
3. Browse available tasks
4. Click **"EtherAgentAI"** button
5. Review AI-generated solution
6. Edit if needed, or accept as-is
7. Click **"Submit to Chain"**
   - Smart contract records submission
   - AI immediately evaluates work
   - If confidence > 80%: Auto-approved ✅
   - If < 80%: Client must review and approve manually
8. Receive payment notification when approved

### How AI Evaluation Works

1. Agent submits work to blockchain
2. Gemini API evaluates submission against task requirements
3. AI returns confidence score (0-100%)
4. If confidence > 80% AND auto-approval enabled:
   - Smart contract automatically releases MNEE
   - Agent receives funds instantly
5. Otherwise:
   - Client receives evaluation summary
   - Client manually approves or requests revisions

---

## 🔗 Smart Contracts

### Configuration
Contract addresses are stored securely in environment variables. See [.env.example](.env.example) for required configuration.

**Development (Sepolia Testnet):**
- TaskEscrow contract (for task escrow + approvals)
- MNEE token (Sepolia mock for testing)

**Production (Ethereum Mainnet):**
- Real MNEE token (USD-backed stablecoin on mainnet)
- Deployed TaskEscrow contract (address in env variables)

**Core Functions:**
- `createTaskWithToken()` - Create task with MNEE escrow
- `completeTask()` - Submit task completion
- `approveTask()` - Release funds (manual or auto via AI)

For mainnet deployment details, see [MNEE_MAINNET_SETUP.md](./MNEE_MAINNET_SETUP.md)

---

## 🎯 How This Demonstrates Programmable Money

**Traditional Commerce:**
```
Client pays → Wait for approval → Manual review → Money released → 2-3 day settlement
```

**EtherAgent (Programmable Money):**
```
Client escrows MNEE → AI evaluates → Smart contract auto-releases → Agent receives in seconds
```

**Key Innovation**: Money moves based on programmatic logic (AI evaluation + smart contract conditions), not human decisions.

---

## 🏆 MNEE Hackathon Requirements

✅ **Uses MNEE Stablecoin**: Escrows real MNEE (Mainnet: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF)

✅ **AI & Agent Payments Track**: Autonomous agents pay based on AI evaluation

✅ **Programmable Money**: Smart contracts + AI automate entire payment workflow

✅ **Production Ready**: Works on testnet, mainnet upgrade path documented in [MNEE_MAINNET_SETUP.md](./MNEE_MAINNET_SETUP.md)

---

## 🧪 Testing

### Test on Sepolia Testnet (Free)

1. **Get Sepolia ETH**: 
   - Visit [Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - Request 0.1 ETH

2. **Get Mock MNEE**:
   - Use the MNEE token address from `.env.example` (Sepolia)
   - Or use a wallet with pre-minted test tokens

3. **Create & Complete Task**:
   - Create task with 10 MNEE
   - Switch wallet to agent
   - Submit work
   - Check AI evaluation

### Test Flow Checklist

- [ ] Client wallet connects
- [ ] Task creation initiates 2 MetaMask prompts (approve + transfer)
- [ ] Agent sees task in dashboard
- [ ] EtherAgentAI generates solution
- [ ] Agent submits work
- [ ] AI evaluation shows confidence score
- [ ] Auto-approval triggers if > 80%
- [ ] Payment notification appears
- [ ] Agent wallet receives MNEE (check on block explorer)

---

## 📋 Troubleshooting

| Issue | Solution |
|-------|----------|
| MetaMask connection fails | Ensure MetaMask extension is installed and enabled |
| "Please connect wallet" on load | Open MetaMask, click "Connect" in app |
| Wrong network error | Switch MetaMask to Ethereum Sepolia (testnet) or Mainnet |
| Token approval fails | Check MNEE balance and ETH for gas fees |
| Task creation fails with revert | Ensure MNEE approval was completed first |
| AI evaluation takes too long | Gemini API may be slow; check browser console for errors |
| Payment not received | Wait for blockchain confirmation (~15 sec on Sepolia), refresh page |

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- **Questions?** Open an issue on GitHub
- **Bug Reports?** Include steps to reproduce + error messages
- **Suggestions?** Check existing issues first, then create a new one

---

## 🔗 Resources

- [MNEE Hackathon](https://mnee.io) - Official hackathon page
- [MNEE Documentation](https://docs.mnee.io) - MNEE stablecoin docs
- [Ethereum Docs](https://ethereum.org/en/developers) - Blockchain fundamentals
- [ethers.js](https://docs.ethers.org) - Web3 library documentation
- [Gemini API](https://ai.google.dev) - AI evaluation service

---

## ✍️ Authors

- **Built for**: MNEE Hackathon 2026
- **Status**: Active development
- **Last Updated**: January 10, 2026

---

<div align="center">

**Made with 💜 using MNEE, Ethereum, and Gemini AI**

[⬆ back to top](#etherAgent-ai-powered-autonomous-escrow-marketplace)

</div>

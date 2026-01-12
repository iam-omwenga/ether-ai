# EtherAgent MNEE Mainnet Configuration Guide

## Overview

EtherAgent is currently configured to run on **Ethereum Sepolia Testnet** with a **mock MNEE ERC20 token** for demonstration purposes. This guide explains how to transition to the **MNEE mainnet stablecoin** on Ethereum mainnet to meet hackathon requirements and enable real programmable money transactions.

---

## Current Setup (Sepolia Testnet - Mock)

The application currently uses:

| Component | Current (Sepolia) | Mainnet (Required) |
|-----------|-------------------|-------------------|
| **Blockchain** | Ethereum Sepolia Testnet | Ethereum Mainnet |
| **Chain ID** | 11155111 | 1 |
| **MNEE Token** | Mock ERC20 (0x2E96901a92AB07a9Cf6D2570399eB1c71775A272) | MNEE Mainnet (USD-backed) |
| **TaskEscrow Contract** | Deployed on Sepolia (0x097cc5405702dd70116367a4b85158881E8253a0) | Must redeploy on Mainnet |
| **Purpose** | Testing & Demo | Production with Real Value |

**Why This Matters:**
- **Sepolia Demo**: Free testnet tokens, no real value, fast iteration
- **Mainnet**: Real MNEE stablecoin, actual USD backing, meets hackathon requirements

---

## Step 1: Obtain MNEE Mainnet Contract Address

First, you need the official MNEE mainnet token contract address. MNEE is a USD-backed stablecoin on Ethereum.

**Action Required:**
1. Visit the MNEE official documentation or contract explorer
2. Locate the **MNEE mainnet contract address**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
3. Verify the contract is deployed on **Ethereum Mainnet (Chain ID: 1)** ✅
4. Confirm it's an ERC20 token ✅

**Note:** The MNEE contract address is confirmed: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`

---

## Step 2: Update Configuration File

Navigate to `constants.ts` and update the following:

### File: `constants.ts`

**Current (Sepolia):**
```typescript
export const MNEE_TOKEN_ADDRESS_SEPOLIA = "0x2E96901a92AB07a9Cf6D2570399eB1c71775A272"; // Mock token on Sepolia
export const TASK_ESCROW_ADDRESS_SEPOLIA = "0x097cc5405702dd70116367a4b85158881E8253a0"; // Sepolia escrow
```

**Update to (Mainnet):**
```typescript
// Mainnet configuration
export const MNEE_TOKEN_ADDRESS_MAINNET = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"; // MNEE USD-backed stablecoin on Ethereum mainnet
export const TASK_ESCROW_ADDRESS_MAINNET = "0x[DEPLOY_NEW_ESCROW_CONTRACT_HERE]"; // Your TaskEscrow deployed on mainnet

// Use mainnet addresses in production
export const MNEE_TOKEN_ADDRESS = MNEE_TOKEN_ADDRESS_MAINNET;
export const TASK_ESCROW_ADDRESS = TASK_ESCROW_ADDRESS_MAINNET;
```

**Explanation:**
- `MNEE_TOKEN_ADDRESS`: Points to the **official MNEE stablecoin** on mainnet (0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF - real USD-backed value)
- `TASK_ESCROW_ADDRESS`: Your smart contract deployed to mainnet (handles task creation, escrow, and payment automation)
- These replace the Sepolia addresses globally throughout the application

---

## Step 3: Deploy TaskEscrow Contract to Mainnet

The `TaskEscrow` smart contract must be redeployed on Ethereum mainnet.

### Using Remix:

1. **Open Remix IDE**: https://remix.ethereum.org
2. **Create new file**: `TaskEscrow.sol`
3. **Copy the contract code** from `constants.ts` (SOLIDITY_CONTRACT_SOURCE section)
4. **Compile**: 
   - Compiler: Solidity 0.8.0+
   - Enable optimization
5. **Deploy**:
   - Switch MetaMask to **Ethereum Mainnet**
   - Select "TaskEscrow" contract
   - Click "Deploy"
   - **Confirm transaction in MetaMask** (will cost real ETH gas)
6. **Copy the deployed contract address**
7. **Update** `TASK_ESCROW_ADDRESS_MAINNET` in `constants.ts`

### Contract Constructor Parameters:
None required - the contract deploys with no initialization parameters.

---

## Step 4: Update Chain Configuration in App

Navigate to `App.tsx` and update the chain ID:

### File: `App.tsx`

**Current:**
```typescript
const SEPOLIA_CHAIN_ID = 11155111; // Sepolia testnet
```

**Update to:**
```typescript
const ETHEREUM_MAINNET_CHAIN_ID = 1; // Ethereum mainnet
// Then replace all references to SEPOLIA_CHAIN_ID with ETHEREUM_MAINNET_CHAIN_ID
```

**Key lines to update:**
```typescript
// Line ~147 (or wherever isWrongNetwork is defined)
const isWrongNetwork = web3State.chainId !== ETHEREUM_MAINNET_CHAIN_ID && web3State.isConnected;

// Line ~266 (system status message)
<p className="font-semibold mb-1">
  System Status: {web3State.isConnected ? "Connected to Ethereum Mainnet" : "Not Connected"}
</p>
```

**Explanation:**
- Chain ID `1` is Ethereum mainnet
- This ensures users are connected to the correct network before creating tasks or submitting work
- MetaMask will prompt users to switch networks if they're on testnet

---

## Step 5: Update Web3Service Network Switching

Navigate to `web3Service.ts` and ensure network switching targets mainnet:

### File: `services/web3Service.ts`

**Verify the switchNetwork method:**
```typescript
async switchNetwork(chainId: number) {
  const metamask = this.getMetaMask();
  if (!metamask) return;
  try {
    await metamask.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // 0x1 = Mainnet (decimal 1)
    });
  } catch (e) {
    // ... error handling
  }
}
```

**Explanation:**
- `0x1` (hex) = chain ID 1 (Ethereum mainnet)
- When users click "Connect Wallet", they'll be prompted to switch to mainnet if on testnet

---

## Step 6: Update Environment Variables

Create or update `.env.local`:

```bash

# Mainnet Configuration
VITE_MNEE_TOKEN_ADDRESS=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
VITE_TASK_ESCROW_ADDRESS=0x[INSERT_YOUR_ESCROW_MAINNET_ADDRESS]
```

---

## Step 7: Testing & Verification

### Before Going Live:

1. **Check Contract Addresses:**
   ```bash
   # Verify MNEE token contract exists on mainnet
   curl https://api.etherscan.io/api?module=contract&action=getabi&address=0x[MNEE_ADDRESS]&apikey=[YOUR_ETHERSCAN_KEY]
   ```

2. **Test with Small Amounts:**
   - Start with 0.1-1 MNEE
   - Ensure task creation → submission → payment flow works
   - Monitor gas costs

3. **Verify Token Approval:**
   - Users must approve EtherAgent to spend their MNEE
   - This happens automatically in the app (two MetaMask confirmations)

4. **Check Escrow Contract:**
   ```bash
   # Verify contract balance holds escrowed MNEE
   curl https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x[MNEE_ADDRESS]&address=0x[ESCROW_ADDRESS]&apikey=[YOUR_ETHERSCAN_KEY]
   ```

---

## Complete Configuration Changes Summary

| File | Change | Why |
|------|--------|-----|
| `constants.ts` | Replace Sepolia addresses with mainnet MNEE + new TaskEscrow | Points to real USD-backed stablecoin |
| `App.tsx` | Change SEPOLIA_CHAIN_ID to `1` | Ensures mainnet connectivity |
| `.env.local` | Add mainnet contract addresses | Production configuration |
| Smart Contract | Redeploy TaskEscrow.sol to mainnet | Required for escrow on mainnet |

---

## How This Enables Hackathon Requirements

### ✅ Uses MNEE USD-Backed Stablecoin
- Application now accepts real MNEE tokens
- Each transaction has actual USD value backing
- Demonstrates programmable money (transactions are automated by smart contracts)

### ✅ Programmable Money for Digital Commerce
- **TaskEscrow contract** automatically handles:
  - Fund escrow (client deposits MNEE when creating task)
  - AI evaluation (autonomous payment approval based on confidence score)
  - Instant settlement (funds transfer to agent wallet on approval)
- No manual payment processing needed

### ✅ AI Automation
- **EtherAgentAI** autonomously:
  - Evaluates task completion quality (Gemini API)
  - Triggers automatic payment if confidence > 80%
  - Records all decisions on blockchain for transparency
- Demonstrates AI + smart contracts for financial automation

---

## Rollback to Testnet

If you need to test changes before mainnet:

```typescript
// In constants.ts - toggle between networks
const USE_MAINNET = true; // Set to false for Sepolia testnet

export const MNEE_TOKEN_ADDRESS = USE_MAINNET 
  ? MNEE_TOKEN_ADDRESS_MAINNET 
  : MNEE_TOKEN_ADDRESS_SEPOLIA;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Wrong network" error | User must switch MetaMask to Ethereum Mainnet |
| Contract not found | Verify contract address on Etherscan |
| Token approval fails | Ensure user has sufficient MNEE balance + ETH for gas |
| High gas costs | Batch transactions or use Layer 2 (future enhancement) |

---

## Next Steps

1. ✅ Get MNEE mainnet contract address
2. ✅ Update `constants.ts` with mainnet addresses
3. ✅ Deploy TaskEscrow to mainnet
4. ✅ Update `App.tsx` chain ID
5. ✅ Test with small amounts
6. ✅ Deploy application to production
7. ✅ Submit to hackathon with mainnet configuration

---

## Resources

- **Ethereum Mainnet**: https://ethereum.org/
- **MNEE Documentation**: [Link to MNEE official docs]
- **Etherscan**: https://etherscan.io (verify contracts)
- **Remix IDE**: https://remix.ethereum.org (deploy contracts)
- **MetaMask**: https://metamask.io/ (wallet management)


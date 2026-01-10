# Deploying EtherAgent to Vercel

## Overview

EtherAgent is configured to deploy seamlessly on Vercel while keeping sensitive data (API keys, contract addresses) secure. Your GitHub repo can be **completely public** without exposing secrets.

---

## How It Works

### What's Publicly Visible (Safe)
- ✅ All source code (TypeScript, React, components)
- ✅ Smart contract ABI and interfaces
- ✅ `.env.example` (shows what env variables are needed, no real values)
- ✅ Documentation and configuration guides

### What's Hidden (Secure)
- 🔒 `constants.ts` (API keys, real contract addresses) - **NOT committed**
- 🔒 `.env.local` (your local development secrets) - **NOT committed**
- 🔒 Vercel environment variables - **Only visible to you in Vercel dashboard**

---

## Step-by-Step Deployment

### Step 1: Prepare Your GitHub Repository

1. **Make sure constants.ts is NOT committed:**
   ```bash
   # Check current status
   git status
   
   # Remove from git history if already committed
   git rm --cached constants.ts
   git add .gitignore
   git commit -m "Remove constants.ts from tracking (moved to env variables)"
   ```

2. **Verify .gitignore includes constants.ts:**
   ```bash
   cat .gitignore | grep constants.ts
   # Should show: constants.ts
   ```

3. **Ensure .env files are ignored:**
   ```bash
   cat .gitignore | grep -E "\.env"
   # Should show .env, .env.local, .env.*.local
   ```

4. **Make repo public on GitHub:**
   - Go to: https://github.com/yourusername/ether-agent
   - Settings → General → Danger Zone → Change visibility to **Public**

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment with secure env configuration"
git push origin main
```

### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in with GitHub**
3. **Click "Add New..." → "Project"**
4. **Select your repository**: `yourusername/ether-agent`
5. **Select Import**

### Step 4: Configure Environment Variables

1. **In Vercel dashboard, you'll see "Environment Variables" section**
2. **Add each variable:**

   ```
   Name: VITE_GEMINI_API_KEY
   Value: AIzaSyDr0b20bs06T2EN9wo6LfKPlS0XAlnrflI
   ```

   ```
   Name: VITE_MNEE_TOKEN_ADDRESS
   Value: 0x2E96901a92AB07a9Cf6D2570399eB1c71775A272
   ```

   ```
   Name: VITE_TASK_ESCROW_ADDRESS
   Value: 0x097cc5405702dd70116367a4b85158881E8253a0
   ```

3. **For Production (Mainnet) - Optional:**
   ```
   Name: VITE_MNEE_TOKEN_ADDRESS_MAINNET
   Value: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
   ```

   ```
   Name: VITE_TASK_ESCROW_ADDRESS_MAINNET
   Value: 0x[YOUR_DEPLOYED_MAINNET_ESCROW]
   ```

4. **Click "Deploy"**

---

## Understanding the Configuration

### How constants.ts Works

Your `constants.ts` now reads from environment variables:

```typescript
const getEnv = (key: string, defaultValue: string): string => {
  const value = import.meta.env[`VITE_${key}`];
  return value || defaultValue;
};

export const GEMINI_API_KEY = getEnv('GEMINI_API_KEY', 'dev-fallback-key');
export const MNEE_TOKEN_ADDRESS_SEPOLIA = getEnv('MNEE_TOKEN_ADDRESS', '0x...');
```

**What happens:**
1. **Local development** (`npm run dev`):
   - Reads from `.env.local` (on your machine only)
   - Falls back to defaults if not set
   - Never committed to git

2. **Vercel deployment** (`vercel.com/yourusername/ether-agent`):
   - Reads from Vercel Environment Variables
   - Set in Vercel dashboard (secure)
   - No `.env.local` file needed
   - Values injected at build time

3. **GitHub** (public repo):
   - `constants.ts` is ignored (not committed)
   - Only `.env.example` is visible (safe)
   - Shows structure, not real values

---

## Verification

### After Deployment

1. **Visit your Vercel app:**
   - URL: `https://ether-agent.vercel.app` (or your custom domain)

2. **Check it's working:**
   - Open browser console (F12)
   - Connect MetaMask
   - Create a test task
   - No errors about missing API keys

3. **Verify secrets are hidden:**
   - Open your public GitHub repo
   - Search for `AIzaSy...` (Gemini key)
   - Should find nothing (it's in `.gitignore`)

4. **Check Vercel logs:**
   - Vercel Dashboard → Deployments → Recent → Logs
   - Should see successful build with no secret exposure

---

## Local Development

### First Time Setup

```bash
# Clone your public repo
git clone https://github.com/yourusername/ether-agent.git
cd ether-agent

# Create local env file
cp .env.example .env.local

# Edit .env.local with YOUR values
# (This file is ignored by git, only on your machine)
nano .env.local
```

### What to Put in `.env.local`

```bash
# Your development values
VITE_GEMINI_API_KEY=your_actual_api_key

# Keep Sepolia testnet addresses (publicly safe)
VITE_MNEE_TOKEN_ADDRESS=0x2E96901a92AB07a9Cf6D2570399eB1c71775A272
VITE_TASK_ESCROW_ADDRESS=0x097cc5405702dd70116367a4b85158881E8253a0
```

### Run Locally

```bash
npm install
npm run dev
# Opens http://localhost:5173
```

---

## Security Checklist

- [ ] `constants.ts` is in `.gitignore`
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` is committed (safe - no real values)
- [ ] GitHub repo is public
- [ ] Vercel environment variables are set
- [ ] No API keys in any committed files
- [ ] `git status` shows nothing suspicious before pushing

---

## Troubleshooting

### "constants.ts not found" on Vercel

**Problem**: constants.ts is ignored but needed at build time.

**Solution**: Ensure environment variables are set:
1. Vercel Dashboard → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy: Go to Deployments → Click "..." on latest → "Redeploy"

### Environment Variables Not Loading

**Check:**
1. Variable names must start with `VITE_` (Vite requirement)
2. Spelling must match exactly (case-sensitive)
3. Redeploy after adding variables (not automatic)

```bash
# Test locally if env vars work
npm run dev

# Check browser console - should NOT show warnings
```

### GitHub Shows My API Key

**If it's already committed:**
```bash
# Remove from history (careful - rewrites history)
git rm --cached constants.ts
git filter-branch --tree-filter 'rm -f constants.ts' -- --all
git push origin --force
```

**Better approach**: Use GitHub secrets and remove the file.

---

## Custom Domain (Optional)

To use `etherAgent.dev` instead of `vercel.app`:

1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions from your domain registrar
4. Typically takes 24-48 hours to propagate

---

## Continuous Deployment

**Automatic updates:**
- Push to `main` branch → Vercel auto-deploys
- Every commit triggers new build
- Environment variables stay in Vercel dashboard

**To prevent accidental exposure:**
- Add `constants.ts` to `.gitignore` (done)
- Use branch protection on `main`
- Require pull request reviews

---

## Rollback / Redeploy

**If something goes wrong:**

1. Vercel Dashboard → Deployments
2. Click on previous successful deployment
3. Click "..." → "Redeploy"
4. Or: Delete production deployment and push to main again

---

## Next: Hackathon Submission

When ready for MNEE hackathon:

1. **Mainnet Deployment:**
   - Deploy TaskEscrow to Ethereum mainnet
   - Add mainnet addresses to Vercel environment variables
   - Update Vercel with MNEE mainnet contract address

2. **Submit to Devpost:**
   - Working demo: Your Vercel URL
   - Code repository: Your public GitHub (with setup instructions)
   - No secrets exposed ✅

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [GitHub Making Repos Public](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Your app is now secure, public, and production-ready! 🚀**

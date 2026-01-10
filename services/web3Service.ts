import { ethers } from 'ethers';
import { ERC20_ABI, ESCROW_ABI, MNEE_TOKEN_ADDRESS_SEPOLIA, TASK_ESCROW_ADDRESS_SEPOLIA } from '../constants';
import { Task, TaskStatus } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  provider: ethers.BrowserProvider | null = null;
  signer: ethers.JsonRpcSigner | null = null;
  escrowContract: ethers.Contract | null = null;
  tokenContract: ethers.Contract | null = null;

  async connect(silent: boolean = false): Promise<{ address: string, chainId: number } | null> {
    // Specifically look for MetaMask ONLY
    const metamask = this.getMetaMask();
    
    if (!metamask) {
      console.warn("MetaMask not found. Please install MetaMask extension.");
      alert("MetaMask wallet not detected. Please install MetaMask extension.");
      return null;
    }

    try {
      // Initialize the provider with MetaMask specifically
      this.provider = new ethers.BrowserProvider(metamask);
      
      if (silent) {
          // Check if already connected without opening any popup
          const accounts = await this.provider.send("eth_accounts", []);
          if (accounts.length === 0) {
              return null;
          }
      } else {
          // Explicitly request accounts from MetaMask ONLY
          // This should only open MetaMask popup, not other wallets
          const accounts = await metamask.request({ method: 'eth_requestAccounts' });
          if (!accounts || accounts.length === 0) {
              return null;
          }
      }

      // Get signer and details
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Setup Contracts
      this.escrowContract = new ethers.Contract(TASK_ESCROW_ADDRESS_SEPOLIA, ESCROW_ABI, this.signer);
      this.tokenContract = new ethers.Contract(MNEE_TOKEN_ADDRESS_SEPOLIA, ERC20_ABI, this.signer);
      
      return { address, chainId };
    } catch (e) {
      if (!silent) console.error("User rejected connection or error", e);
      return null;
    }
  }

  private getMetaMask(): any {
    // Explicitly only use MetaMask - ignore all other wallet providers
    
    // Check if window.ethereum is MetaMask (most common case)
    if (window.ethereum?.isMetaMask) {
      return window.ethereum;
    }
    
    // If multiple wallets are installed, find MetaMask specifically
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      for (const provider of window.ethereum.providers) {
        if (provider.isMetaMask) {
          return provider;
        }
      }
    }
    
    // MetaMask not found
    return null;
  }

  async switchNetwork(chainId: number) {
    const metamask = this.getMetaMask();
    if (!metamask) return;
    try {
      await metamask.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            alert("Please add Sepolia network to your wallet");
        }
    }
  }

  async checkAllowance(owner: string, spender: string): Promise<string> {
    if (!this.tokenContract) return "0";
    try {
      const allowance = await this.tokenContract.allowance(owner, spender);
      return ethers.formatEther(allowance);
    } catch (e) {
      console.error("Failed to check allowance", e);
      return "0";
    }
  }

  async approveToken(spender: string, amount: string): Promise<boolean> {
    try {
      if (!this.tokenContract) throw new Error("Token contract not initialized");
      const tx = await this.tokenContract.approve(spender, ethers.parseEther(amount));
      await tx.wait();
      return true;
    } catch (e) {
      console.error("Approval failed", e);
      throw e;
    }
  }

  async createTask(agent: string, amount: string, description: string): Promise<boolean> {
    // Validate agent address is a proper Ethereum address
    if (!/^0x[0-9a-fA-F]{40}$/.test(agent)) {
      throw new Error(`Invalid agent address: ${agent}. Must be a valid Ethereum address (0x followed by 40 hex characters)`);
    }

    try {
      if (!this.escrowContract) throw new Error("Contract not initialized");
      if (!this.tokenContract) throw new Error("Token contract not initialized");
      
      const parsedAmount = ethers.parseEther(amount);
      
      // First, approve the escrow contract to spend MNEE tokens
      console.log(`Approving escrow contract to spend ${amount} MNEE...`);
      const approveTx = await this.tokenContract.approve(TASK_ESCROW_ADDRESS_SEPOLIA, parsedAmount);
      await approveTx.wait();
      console.log("Approval successful");
      
      // Now create the task
      console.log(`Creating task with ${amount} MNEE for agent ${agent}...`);
      const tx = await this.escrowContract.createTaskWithToken(
        MNEE_TOKEN_ADDRESS_SEPOLIA,
        parsedAmount,
        agent,
        description
      );
      await tx.wait();
      return true;
    } catch (e) {
      console.error("Create task failed:", e);
      throw e;
    }
  }

  async submitTask(taskId: number, result: string): Promise<boolean> {
    try {
        if (!this.escrowContract) throw new Error("Contract not initialized");
        const tx = await this.escrowContract.completeTask(taskId, result);
        await tx.wait();
        return true;
    } catch(e) {
        console.error("Submit task failed", e);
        throw e;
    }
  }

  async approveTask(taskId: number): Promise<{ success: boolean; txHash?: string }> {
      try {
        if (!this.escrowContract) throw new Error("Contract not initialized");
        const tx = await this.escrowContract.approveTask(taskId);
        const receipt = await tx.wait();
        return { 
          success: true, 
          txHash: receipt?.hash || tx.hash 
        };
      } catch (e) {
          console.error("Approve task failed", e);
          throw e;
      }
  }

  async getTasks(userAddress: string, mode: 'CLIENT' | 'AGENT'): Promise<Task[]> {
    try {
      if (!this.escrowContract) return [];
      
      const count = await this.escrowContract.nextTaskId();
      const tasks: Task[] = [];
      const totalTasks = Number(count);

      const limit = Math.max(0, totalTasks - 20);
      
      for (let i = totalTasks - 1; i >= limit; i--) {
        const taskData = await this.escrowContract.tasks(i);
        tasks.push({
          id: i,
          creator: taskData[0], 
          agent: taskData[1],   
          amount: ethers.formatEther(taskData[3]),
          description: taskData[4], 
          status: Number(taskData[5]),
          result: taskData[6], 
          createdAt: Number(taskData[7]) * 1000 
        });
      }
      return tasks;
    } catch (e) {
      console.error("Failed to fetch tasks from blockchain", e);
      return [];
    }
  }

  async getAddress(): Promise<string> {
      return this.signer ? await this.signer.getAddress() : "0xMockUserWalletAddress";
  }

  // Get single task details
  async getTaskDetails(taskId: number): Promise<Task | null> {
    if (this.useMock) {
        const task = mockTasks.find(t => t.id === taskId);
        return task || null;
    }

    try {
      if (!this.escrowContract) return null;
      const taskData = await this.escrowContract.tasks(taskId);
      return {
        id: taskId,
        creator: taskData[0],
        agent: taskData[1],
        amount: ethers.formatEther(taskData[3]),
        description: taskData[4],
        status: Number(taskData[5]),
        result: taskData[6],
        createdAt: Number(taskData[7]) * 1000
      };
    } catch (e) {
      console.error("Failed to fetch task details", e);
      return null;
    }
  }

  // Auto-approve task using AI evaluation (autonomous approval)
  async autoApproveTask(taskId: number): Promise<{ success: boolean; txHash?: string }> {
    try {
      if (!this.escrowContract) throw new Error("Contract not initialized");
      // Use signer to call from system account (or could be called from a smart contract)
      const tx = await this.escrowContract.approveTask(taskId);
      const receipt = await tx.wait();
      console.log(`Task ${taskId} auto-approved by AI. Funds released.`);
      return { 
        success: true, 
        txHash: receipt?.hash || tx.hash 
      };
    } catch (e) {
      console.error("Auto-approve task failed", e);
      throw e;
    }
  }

  // Listen for TaskCompleted event to confirm payment to agent
  onTaskCompleted(callback: (taskId: number, agentAddress: string) => void): void {
    if (!this.escrowContract) return;

    try {
      this.escrowContract.on("TaskCompleted", (taskId: any) => {
        callback(Number(taskId), "");
      });
    } catch (e) {
      console.error("Failed to set up event listener", e);
    }
  }

  // Get agent's wallet balance to confirm they received payment
  async getWalletBalance(address: string): Promise<string> {
    if (!this.provider) return "0";
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (e) {
      console.error("Failed to get balance", e);
      return "0";
    }
  }

  // Remove event listener
  removeTaskCompletedListener(): void {
    if (!this.escrowContract) return;
    try {
      this.escrowContract.removeAllListeners("TaskCompleted");
    } catch (e) {
      console.error("Failed to remove event listener", e);
    }
  }
}

export const web3Service = new Web3Service();
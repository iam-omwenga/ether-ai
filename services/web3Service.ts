import { ethers } from 'ethers';
import { ERC20_ABI, ESCROW_ABI, MNEE_TOKEN_ADDRESS_SEPOLIA, TASK_ESCROW_ADDRESS_SEPOLIA } from '../constants';
import { Task, TaskStatus } from '../types';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Mock storage to simulate blockchain when no contract is deployed
let mockTasks: Task[] = [
  {
    id: 0,
    creator: "0xMockCreator",
    agent: "0x123...abc",
    amount: "50",
    description: "Write a React component for a Navbar",
    status: TaskStatus.OPEN,
    createdAt: Date.now()
  },
  {
    id: 1,
    creator: "0xMockCreator",
    agent: "0x456...def",
    amount: "100",
    description: "Analyze this dataset for trends...",
    status: TaskStatus.SUBMITTED,
    result: "Analysis complete: Trend is upwards.",
    createdAt: Date.now() - 86400000
  }
];

export class Web3Service {
  provider: ethers.BrowserProvider | null = null;
  signer: ethers.JsonRpcSigner | null = null;
  escrowContract: ethers.Contract | null = null;
  tokenContract: ethers.Contract | null = null;
  useMock: boolean = true; 

  async connect(silent: boolean = false): Promise<{ address: string, chainId: number } | null> {
    if (window.ethereum) {
      try {
        // Initialize the provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        if (silent) {
            // Check if already connected without opening the popup
            const accounts = await this.provider.send("eth_accounts", []);
            if (accounts.length === 0) {
                return null;
            }
        } else {
            // Explicitly request accounts - this triggers the MetaMask extension
            await this.provider.send("eth_requestAccounts", []);
        }

        // Get signer and details
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();
        const network = await this.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Setup Contracts
        this.escrowContract = new ethers.Contract(TASK_ESCROW_ADDRESS_SEPOLIA, ESCROW_ABI, this.signer);
        this.tokenContract = new ethers.Contract(MNEE_TOKEN_ADDRESS_SEPOLIA, ERC20_ABI, this.signer);
        
        // Determine if we should use Mock mode based on network and contract existence
        const isPlaceholderAddress = (TASK_ESCROW_ADDRESS_SEPOLIA as string) === "0x0000000000000000000000000000000000000000";

        if (chainId === 11155111) { // Sepolia
            const code = await this.provider.getCode(TASK_ESCROW_ADDRESS_SEPOLIA);
            this.useMock = code === '0x'; // If no code, contract is not deployed
        } else {
            // Wrong network: Use mock if placeholder, otherwise real mode (will prompt switch later)
            this.useMock = isPlaceholderAddress;
        }
        
        return { address, chainId };
      } catch (e) {
        if (!silent) console.error("User rejected connection or error", e);
        return null;
      }
    } else {
      console.warn("No wallet found, using mock mode");
      this.useMock = true;
      return { address: "0xMockUserWalletAddress", chainId: 11155111 };
    }
  }

  async switchNetwork(chainId: number) {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
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
    if (this.useMock || !this.tokenContract) return ethers.MaxUint256.toString();
    try {
      const allowance = await this.tokenContract.allowance(owner, spender);
      return ethers.formatEther(allowance);
    } catch (e) {
      console.error("Failed to check allowance", e);
      return "0";
    }
  }

  async approveToken(spender: string, amount: string): Promise<boolean> {
    if (this.useMock) return true;
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
    if (this.useMock) {
      console.log("Mock Create Task:", { agent, amount, description });
      mockTasks.push({
        id: mockTasks.length,
        creator: await this.getAddress(),
        agent,
        amount,
        description,
        status: TaskStatus.OPEN,
        createdAt: Date.now()
      });
      return true;
    }

    try {
      if (!this.escrowContract) throw new Error("Contract not initialized");
      const parsedAmount = ethers.parseEther(amount);
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
    if (this.useMock) {
        const task = mockTasks.find(t => t.id === taskId);
        if (task) {
            task.status = TaskStatus.SUBMITTED;
            task.result = result;
        }
        return true;
    }
    
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

  async approveTask(taskId: number): Promise<boolean> {
      if (this.useMock) {
          const task = mockTasks.find(t => t.id === taskId);
          if (task) {
              task.status = TaskStatus.COMPLETED;
          }
          return true;
      }

      try {
        if (!this.escrowContract) throw new Error("Contract not initialized");
        const tx = await this.escrowContract.approveTask(taskId);
        await tx.wait();
        return true;
      } catch (e) {
          console.error("Approve task failed", e);
          throw e;
      }
  }

  async getTasks(userAddress: string, mode: 'CLIENT' | 'AGENT'): Promise<Task[]> {
    if (this.useMock) {
        return mockTasks.filter(t => {
            if (mode === 'CLIENT') return true; 
            if (mode === 'AGENT') return true; 
            return true;
        });
    }

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
}

export const web3Service = new Web3Service();
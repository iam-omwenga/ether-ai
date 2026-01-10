export enum TaskStatus {
  OPEN = 0,
  SUBMITTED = 1,
  COMPLETED = 2,
  DISPUTED = 3,
  CANCELLED = 4
}

export interface Task {
  id: number;
  creator: string;
  agent: string;
  amount: string; // Displayed in MNEE/ETH
  description: string;
  status: TaskStatus;
  result?: string;
  createdAt: number;
}

export interface Agent {
  address: string;
  name: string;
  specialty: string;
  avatar: string;
}

export type UserMode = 'CLIENT' | 'AGENT';

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any | null;
  signer: any | null;
}

/// <reference types="vite/client" />

// ============================================
// Environment-based Configuration
// ============================================
// Load from environment variables for security
// Fallback to defaults for development

const getEnv = (key: string, defaultValue: string): string => {
  const value = import.meta.env[`VITE_${key}`];
  if (!value && !defaultValue) {
    console.warn(`⚠️ Environment variable VITE_${key} is not set`);
  }
  return value || defaultValue;
};

// API Keys
export const GEMINI_API_KEY = getEnv(
  'GEMINI_API_KEY',
  'AIzaSyDr0b20bs06T2EN9wo6LfKPlS0XAlnrflI' // Development fallback
);

// Blockchain Configuration - Sepolia Testnet (Default)
export const MNEE_TOKEN_ADDRESS_SEPOLIA = getEnv(
  'MNEE_TOKEN_ADDRESS',
  '0x2E96901a92AB07a9Cf6D2570399eB1c71775A272'
);

export const TASK_ESCROW_ADDRESS_SEPOLIA = getEnv(
  'TASK_ESCROW_ADDRESS',
  '0x097cc5405702dd70116367a4b85158881E8253a0'
);

// Blockchain Configuration - Ethereum Mainnet (When Deployed)
// For mainnet, set these environment variables in Vercel
export const MNEE_TOKEN_ADDRESS_MAINNET = getEnv(
  'MNEE_TOKEN_ADDRESS_MAINNET',
  '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF'
);

export const TASK_ESCROW_ADDRESS_MAINNET = getEnv(
  'TASK_ESCROW_ADDRESS_MAINNET',
  '' // Must be set for mainnet
);

// Registered Agents on the Platform - Demo Agent
export const AGENTS = [
  { 
    address: "0x8c43a936FB3f4ec31284dbb06f04281a4573c2A8", 
    name: "Demo Agent", 
    specialty: "Task Execution",
    description: "Demo agent for testing task completion and AI evaluation",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent",
    verified: true
  }
];

// ABIs
export const ERC20_ABI = [
  "constructor()",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InvalidApprover(address approver)",
  "error ERC20InvalidReceiver(address receiver)",
  "error ERC20InvalidSender(address sender)",
  "error ERC20InvalidSpender(address spender)"
];

export const ESCROW_ABI = [
  "function nextTaskId() view returns (uint256)",
  "function tasks(uint256) view returns (address creator, address agent, address token, uint256 amount, string description, uint8 status, string result, uint256 createdAt)",
  "function createTask(address _agent, string memory _details) payable",
  "function createTaskWithToken(address _token, uint256 _amount, address _agent, string memory _details)",
  "function completeTask(uint256 _taskId, string memory _result)",
  "function approveTask(uint256 _taskId)",
  "event TaskCreated(uint256 indexed taskId, address indexed creator, address indexed agent, uint256 amount)",
  "event TaskSubmitted(uint256 indexed taskId, string result)",
  "event TaskCompleted(uint256 indexed taskId)"
];

// For user reference - Not compiled in browser
export const SOLIDITY_CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TaskEscrow is ReentrancyGuard {
    enum Status { OPEN, SUBMITTED, COMPLETED, DISPUTED, CANCELLED }

    struct Task {
        address creator;
        address agent;
        address token; // address(0) for ETH
        uint256 amount;
        string description;
        Status status;
        string result;
        uint256 createdAt;
    }

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed creator, address indexed agent, uint256 amount);
    event TaskSubmitted(uint256 indexed taskId, string result);
    event TaskCompleted(uint256 indexed taskId);

    function createTask(address _agent, string memory _details) external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        tasks[nextTaskId] = Task(msg.sender, _agent, address(0), msg.value, _details, Status.OPEN, "", block.timestamp);
        emit TaskCreated(nextTaskId, msg.sender, _agent, msg.value);
        nextTaskId++;
    }

    function createTaskWithToken(address _token, uint256 _amount, address _agent, string memory _details) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        tasks[nextTaskId] = Task(msg.sender, _agent, _token, _amount, _details, Status.OPEN, "", block.timestamp);
        emit TaskCreated(nextTaskId, msg.sender, _agent, _amount);
        nextTaskId++;
    }

    function completeTask(uint256 _taskId, string memory _result) external {
        Task storage task = tasks[_taskId];
        require(msg.sender == task.agent, "Only agent can complete");
        require(task.status == Status.OPEN, "Task not open");
        
        task.result = _result;
        task.status = Status.SUBMITTED;
        emit TaskSubmitted(_taskId, _result);
    }

    function approveTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        require(msg.sender == task.creator, "Only creator can approve");
        require(task.status == Status.SUBMITTED, "Task not submitted");

        task.status = Status.COMPLETED;
        
        if (task.token == address(0)) {
            payable(task.agent).transfer(task.amount);
        } else {
            require(IERC20(task.token).transfer(task.agent, task.amount), "Transfer failed");
        }
        
        emit TaskCompleted(_taskId);
    }
}
`;
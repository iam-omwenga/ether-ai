/// <reference types="vite/client" />

// ============================================
// Hardcoded Configuration & Platform Optimization
// ============================================
// Direct configuration with platform-specific optimizations

// Detect platform for optimizations
const detectPlatform = () => {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
  const isTablet = /ipad|android(?!.*mobi)/.test(ua);
  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

const platform = detectPlatform();

// API Keys
export const GEMINI_API_KEY = 'AIzaSyDpobTPHK2E5ov5sM9aY77Ap7-qFe00nyY';

// Blockchain Configuration
export const MNEE_TOKEN_ADDRESS = '0x2E96901a92AB07a9Cf6D2570399eB1c71775A272';
export const TASK_ESCROW_ADDRESS = '0x097cc5405702dd70116367a4b85158881E8253a0';

// Legacy exports for compatibility
export const MNEE_TOKEN_ADDRESS_SEPOLIA = '0x2E96901a92AB07a9Cf6D2570399eB1c71775A272';
export const TASK_ESCROW_ADDRESS_SEPOLIA = '0x097cc5405702dd70116367a4b85158881E8253a0';
export const MNEE_TOKEN_ADDRESS_MAINNET = '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF';
export const TASK_ESCROW_ADDRESS_MAINNET = '';

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

// ============================================
// Platform-Specific Optimization Settings
// ============================================
export const PLATFORM_CONFIG = {
  isMobile: platform.isMobile,
  isTablet: platform.isTablet,
  isDesktop: platform.isDesktop,
};

// Performance optimizations based on platform
export const PERFORMANCE_CONFIG = {
  // Debounce delays (ms) - shorter on desktop, longer on mobile
  debounceDelay: platform.isMobile ? 500 : 300,
  // Throttle limits (ms) - more aggressive on mobile
  throttleLimit: platform.isMobile ? 1000 : 500,
  // Request idle callback timeout - longer on mobile for battery savings
  idleCallbackTimeout: platform.isMobile ? 3000 : 1000,
  // Image optimization - lower quality on mobile
  imageQuality: platform.isMobile ? 0.7 : 0.95,
  // Animation frame rate - reduced on mobile for performance
  animationEnabled: !platform.isMobile, // Disable animations on mobile
  // API retry count - more retries on mobile for network reliability
  maxRetries: platform.isMobile ? 5 : 3,
  // Cache TTL (Time To Live in ms)
  cacheTTL: platform.isMobile ? 300000 : 600000, // 5min mobile, 10min desktop
};

// UI Layout configuration based on platform
export const UI_CONFIG = {
  // Modal/Dialog settings
  modal: {
    animationDuration: platform.isMobile ? 200 : 300,
    backdropBlur: platform.isMobile ? '2px' : '4px',
    fontSize: platform.isMobile ? '14px' : '16px',
  },
  // Button settings
  button: {
    padding: platform.isMobile ? '10px 16px' : '12px 20px',
    fontSize: platform.isMobile ? '14px' : '16px',
    minTouchTarget: platform.isMobile ? 44 : 32, // 44px minimum touch target on mobile
  },
  // Card/Container settings
  container: {
    maxWidth: platform.isMobile ? '100%' : platform.isTablet ? '90%' : '1200px',
    padding: platform.isMobile ? '12px' : '20px',
    borderRadius: platform.isMobile ? '8px' : '12px',
    gap: platform.isMobile ? '8px' : '16px',
  },
  // Text input settings
  input: {
    fontSize: platform.isMobile ? '16px' : '14px', // 16px on mobile to prevent zoom
    minHeight: platform.isMobile ? 44 : 36,
    padding: platform.isMobile ? '12px' : '8px 12px',
  },
  // List/Grid settings
  list: {
    itemHeight: platform.isMobile ? 56 : 48,
    columns: platform.isMobile ? 1 : platform.isTablet ? 2 : 3,
  },
};

// Network optimization
export const NETWORK_CONFIG = {
  // Timeout for API requests (ms)
  requestTimeout: platform.isMobile ? 15000 : 10000,
  // Retry delay (ms)
  retryDelay: platform.isMobile ? 2000 : 1000,
  // Connection pooling - more aggressive on mobile
  maxConcurrentRequests: platform.isMobile ? 2 : 6,
};

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
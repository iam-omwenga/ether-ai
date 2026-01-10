export const MNEE_TOKEN_ADDRESS_SEPOLIA = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"; // Deployed Token Address
export const TASK_ESCROW_ADDRESS_SEPOLIA = "0xB93ECEBdB8c4c26cDBf4BB570e0d05102646133b"; // Deployed Contract Address

// Mock Data for Demo Mode
export const MOCK_AGENTS = [
  { address: "0x123...abc", name: "Gemini Coder", specialty: "Code Generation", avatar: "https://picsum.photos/200/200" },
  { address: "0x456...def", name: "Creative Writer Bot", specialty: "Copywriting", avatar: "https://picsum.photos/201/201" },
  { address: "0x789...ghi", name: "Data Analyst AI", specialty: "Data Processing", avatar: "https://picsum.photos/202/202" },
];

// ABIs
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
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
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Task, UserMode, Web3State } from './types';
import { web3Service } from './services/web3Service';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import PaymentNotification from './components/PaymentNotification';
import Button from './components/Button';
import { isMobileDevice } from './utils/mobileDetection';

interface PaymentInfo {
  taskId: number;
  amount: string;
  agentAddress: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'received';
  txHash?: string;
}

const SEPOLIA_CHAIN_ID = 11155111;

const App: React.FC = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null
  });

  const [mode, setMode] = useState<UserMode>('CLIENT');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [paymentNotification, setPaymentNotification] = useState<PaymentInfo | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'agent' | 'both' | null>(null);

  // Detect user role based on tasks
  useEffect(() => {
    if (tasks.length === 0) {
      setUserRole(null);
      return;
    }

    const isCreator = tasks.some(t => t.creator.toLowerCase() === web3State.address?.toLowerCase());
    const isAgent = tasks.some(t => t.agent.toLowerCase() === web3State.address?.toLowerCase());

    if (isCreator && isAgent) setUserRole('both');
    else if (isCreator) setUserRole('client');
    else if (isAgent) setUserRole('agent');
    else setUserRole(null);
  }, [tasks, web3State.address]);

  useEffect(() => {
    // We do NOT auto-connect here to ensure the button is always visible on load.
    // The user must click "Connect Wallet" explicitly.
    
    // Listen for network/account changes
    if (window.ethereum) {
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', () => window.location.reload());
    }

    // Listen for task completion events (payment confirmation)
    web3Service.onTaskCompleted(async (taskId: number) => {
      const task = await web3Service.getTaskDetails(taskId);
      if (task) {
        setPaymentNotification({
          taskId: taskId,
          amount: task.amount,
          agentAddress: task.agent,
          timestamp: Date.now(),
          status: 'received',
          txHash: ''
        });

        // Refresh tasks after payment
        setTimeout(() => {
          fetchTasks();
        }, 2000);
      }
    });

    return () => {
      web3Service.removeTaskCompletedListener();
    };
  }, []);

  useEffect(() => {
    if (web3State.isConnected && web3State.address) {
      fetchTasks();
    }
  }, [web3State.isConnected, web3State.address, web3State.chainId, mode]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
        // Check if MetaMask is installed
        if (!window.ethereum?.isMetaMask && !isMetaMaskInstalled()) {
          // For mobile, offer MetaMask app
          if (isMobileDevice()) {
            const installApp = confirm(
              "MetaMask not detected. Would you like to open the MetaMask app or install it?"
            );
            if (installApp) {
              window.open('https://metamask.app.link/', '_blank');
            }
          } else {
            window.open('https://metamask.io/download/', '_blank');
          }
          setIsConnecting(false);
          return;
        }

        // Pass false to ensure we force the MetaMask popup (not silent)
        const data = await web3Service.connect(false);
        if (data) {
          setWeb3State({
              ...web3State,
              isConnected: true,
              address: data.address,
              chainId: data.chainId
          });
        }
    } catch (e) {
        console.error("Connection failed", e);
    } finally {
        setIsConnecting(false);
    }
  }, [web3State]);

  const isMetaMaskInstalled = useCallback((): boolean => {
    if (window.ethereum?.isMetaMask) return true;
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      return window.ethereum.providers.some((provider: any) => provider.isMetaMask);
    }
    return false;
  }, []);

  const handleSwitchNetwork = useCallback(async () => {
    await web3Service.switchNetwork(SEPOLIA_CHAIN_ID);
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!web3State.address) return;
    setLoadingTasks(true);
    try {
      const result = await web3Service.getTasks(web3State.address, mode);
      setTasks(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  }, [web3State.address, mode]);

  const isWrongNetwork = useMemo(
    () => web3State.chainId !== SEPOLIA_CHAIN_ID && web3State.isConnected,
    [web3State.chainId, web3State.isConnected]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Payment Notification */}
      <PaymentNotification 
        payment={paymentNotification} 
        onClose={() => setPaymentNotification(null)} 
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eth-500 to-purple-600 flex items-center justify-center text-white font-bold">
              EA
            </div>
            <span className="font-bold text-xl tracking-tight">EtherAgent</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
             <div className="bg-slate-800 p-1 rounded-lg flex text-xs sm:text-sm font-medium">
               <button 
                 onClick={() => setMode('CLIENT')}
                 className={`px-2 sm:px-4 py-1.5 rounded-md transition-all ${mode === 'CLIENT' ? 'bg-sky-400 text-slate-900 shadow font-bold' : 'text-slate-400 hover:text-white'}`}
               >
                 Client
               </button>
               <button 
                 onClick={() => setMode('AGENT')}
                 className={`px-2 sm:px-4 py-1.5 rounded-md transition-all ${mode === 'AGENT' ? 'bg-sky-400 text-slate-900 shadow font-bold' : 'text-slate-400 hover:text-white'}`}
               >
                 Agent
               </button>
             </div>

             {web3State.isConnected ? (
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  {userRole && (
                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                      userRole === 'client' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      userRole === 'agent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        userRole === 'client' ? 'bg-blue-400' :
                        userRole === 'agent' ? 'bg-purple-400' :
                        'bg-cyan-400'
                      }`} />
                      <span className="hidden sm:inline">
                        {userRole === 'client' ? 'Client' : userRole === 'agent' ? 'Agent' : 'Client & Agent'}
                      </span>
                      <span className="sm:hidden">
                        {userRole === 'client' ? 'C' : userRole === 'agent' ? 'A' : 'C&A'}
                      </span>
                    </div>
                  )}
                  <div className="bg-slate-800/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="font-mono text-slate-300">
                    {web3State.address?.slice(0, 6)}...{web3State.address?.slice(-4)}
                    </span>
                  </div>
                </div>
             ) : (
                <Button 
                  onClick={connectWallet}
                  isLoading={isConnecting}
                  className="!py-1.5 !text-xs sm:!text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </Button>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Network Warning */}
        {isWrongNetwork && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p className="font-bold text-red-200">Wrong Network</p>
                        <p className="text-sm text-red-300">Please switch to Sepolia to interact with the contract.</p>
                    </div>
                </div>
                <Button variant="danger" onClick={handleSwitchNetwork}>Switch to Sepolia</Button>
            </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <div className="order-2 md:order-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {mode === 'CLIENT' ? 'Manage Tasks' : 'Agent Dashboard'}
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              {mode === 'CLIENT' 
                ? 'Create tasks, escrow funds, and approve work.' 
                : 'Browse assigned tasks and use EtherAgentAI to complete them.'}
            </p>
          </div>
          
          {mode === 'CLIENT' && (
            <Button onClick={() => setShowCreateModal(true)} disabled={isWrongNetwork || !web3State.isConnected} className="order-1 md:order-2 w-full md:w-auto">
              <span className="hidden sm:inline">+ Create New Task</span>
              <span className="sm:hidden">+ New Task</span>
            </Button>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-8 flex flex-col sm:flex-row items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs sm:text-sm text-blue-200 w-full">
            <p className="font-semibold mb-1">System Status: {web3State.isConnected ? "Connected to Sepolia" : "Not Connected"}</p>
            <p className="opacity-80 break-all">
                Current Contract: <code className="bg-blue-900/40 px-1 rounded text-xs">{(web3Service.escrowContract?.target as string) || "None"}</code>
            </p>
          </div>
        </div>

        {/* Task Grid */}
        {loadingTasks ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eth-500"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                mode={mode} 
                onRefresh={fetchTasks} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-500 mb-4">{web3State.isConnected ? "No tasks found." : "Please connect your wallet to view tasks."}</p>
            {mode === 'CLIENT' && web3State.isConnected && (
               <Button variant="secondary" onClick={() => setShowCreateModal(true)} disabled={isWrongNetwork}>Create your first task</Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-slate-500 text-sm">
        <p>&copy; 2026 EtherAgent Escrow. Built with etherAgent.</p>
        <p className="mt-2 text-xs opacity-50">Contract Address: {(web3Service.escrowContract?.target as string) || "Not Deployed (Mock)"}</p>
      </footer>

      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default App;
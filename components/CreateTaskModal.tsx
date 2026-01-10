import React, { useState, useEffect } from 'react';
import { MOCK_AGENTS, TASK_ESCROW_ADDRESS_SEPOLIA } from '../constants';
import Button from './Button';
import { web3Service } from '../services/web3Service';

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onSuccess }) => {
  const [agent, setAgent] = useState(MOCK_AGENTS[0].address);
  const [amount, setAmount] = useState('10');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);

  useEffect(() => {
    checkAllowance();
  }, [amount]);

  const checkAllowance = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setCheckingAllowance(true);
    try {
      const userAddress = await web3Service.getAddress();
      const allowance = await web3Service.checkAllowance(userAddress, TASK_ESCROW_ADDRESS_SEPOLIA);
      if (parseFloat(allowance) < parseFloat(amount)) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAllowance(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await web3Service.approveToken(TASK_ESCROW_ADDRESS_SEPOLIA, amount);
      setNeedsApproval(false); // Assume success updates state immediately for UX
    } catch (e) {
      console.error(e);
      alert("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsApproval) {
      await handleApprove();
      return;
    }

    setLoading(true);
    try {
      await web3Service.createTask(agent, amount, description);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create task. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-850 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Select AI Agent</label>
            <div className="grid grid-cols-1 gap-2">
              {MOCK_AGENTS.map((a) => (
                <div 
                  key={a.address}
                  onClick={() => setAgent(a.address)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    agent === a.address 
                    ? 'border-eth-500 bg-eth-500/10' 
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={a.avatar} alt="avatar" className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <div className="text-sm font-medium text-white">{a.name}</div>
                    <div className="text-xs text-slate-400">{a.specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1">Bounty Amount (MNEE)</label>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               onBlur={checkAllowance}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-eth-500 focus:border-transparent outline-none"
               required
               min="0.1"
               step="0.1"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1">Task Description</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-eth-500 focus:border-transparent outline-none h-32"
               placeholder="Describe what the agent needs to do..."
               required
             />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            
            {needsApproval ? (
               <Button type="button" onClick={handleApprove} isLoading={loading} className="flex-1 bg-yellow-600 hover:bg-yellow-500">
                 Approve MNEE Token
               </Button>
            ) : (
               <Button type="submit" isLoading={loading} disabled={checkingAllowance} className="flex-1">
                 {checkingAllowance ? 'Checking...' : 'Escrow Funds & Create'}
               </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
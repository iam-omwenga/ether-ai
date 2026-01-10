import React, { useState } from 'react';
import { TASK_ESCROW_ADDRESS_SEPOLIA, AGENTS } from '../constants';
import Button from './Button';
import { web3Service } from '../services/web3Service';

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onSuccess }) => {
  const [agent, setAgent] = useState('');
  const [customAgent, setCustomAgent] = useState('');
  const [useCustomAgent, setUseCustomAgent] = useState(false);
  const [amount, setAmount] = useState('10');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAgent = useCustomAgent ? customAgent : agent;

    if (!selectedAgent || !selectedAgent.startsWith('0x')) {
      alert("Please select or enter a valid agent wallet address.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await web3Service.createTask(selectedAgent, amount, description);
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
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
            ⚠️ <strong>Select Agent:</strong> The agent you select must use the same wallet address to submit their work. Share this task ID and wallet address with them.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assign to Agent</label>
            
            {!useCustomAgent ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {AGENTS.map((a) => (
                    <div 
                      key={a.address}
                      onClick={() => setAgent(a.address)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        agent === a.address 
                        ? 'border-eth-500 bg-eth-500/10' 
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white">{a.name}</div>
                          {a.verified && (
                            <div className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">✓ Verified</div>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{a.specialty}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{a.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setUseCustomAgent(true)}
                  className="text-sm text-eth-400 hover:text-eth-300 mt-2"
                >
                  Use custom agent address instead
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={customAgent}
                  onChange={(e) => setCustomAgent(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-eth-500 focus:border-transparent outline-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-slate-400">Enter the agent's wallet address (they must use this exact wallet to submit)</p>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomAgent(false);
                    setCustomAgent('');
                  }}
                  className="text-sm text-eth-400 hover:text-eth-300"
                >
                  Back to registered agents
                </button>
              </div>
            )}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1">Bounty Amount (MNEE)</label>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-eth-500 focus:border-transparent outline-none"
               required
               min="0.1"
               step="0.1"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-300 mb-1">Task Description</label>
             <p className="text-xs text-slate-500 mb-2">💡 Tip: Describe the task in words only. Do not include files, links, or attachments—agents will generate solutions based on your description.</p>
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
            <Button type="submit" isLoading={loading} className="flex-1">
              Escrow Funds & Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
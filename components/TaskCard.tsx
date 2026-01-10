import React, { useState } from 'react';
import { Task, TaskStatus, UserMode } from '../types';
import Button from './Button';
import { generateAgentResponse } from '../services/geminiService';
import { web3Service } from '../services/web3Service';

interface TaskCardProps {
  task: Task;
  mode: UserMode;
  onRefresh: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, mode, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [resultInput, setResultInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAIWork = async () => {
    setLoading(true);
    try {
        const aiResult = await generateAgentResponse(task.description);
        setResultInput(aiResult);
    } catch (e) {
        console.error(e);
        alert("AI Agent failed to respond");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async () => {
      if (!resultInput) return;
      setLoading(true);
      try {
          await web3Service.submitTask(task.id, resultInput);
          onRefresh();
      } catch(e) {
          alert("Failed to submit task to blockchain");
      } finally {
          setLoading(false);
      }
  };

  const handleApprove = async () => {
      setLoading(true);
      try {
          await web3Service.approveTask(task.id);
          onRefresh();
      } catch(e) {
          alert("Failed to approve task");
      } finally {
          setLoading(false);
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    [TaskStatus.OPEN]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    [TaskStatus.SUBMITTED]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    [TaskStatus.COMPLETED]: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    [TaskStatus.DISPUTED]: "bg-red-500/10 text-red-400 border-red-500/20",
    [TaskStatus.CANCELLED]: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const statusText = ["Open", "Submitted", "Completed", "Disputed", "Cancelled"];

  return (
    <div className="bg-slate-850 border border-slate-700 rounded-xl p-6 shadow-xl hover:border-eth-500/30 transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${statusColors[task.status]}`}>
              {statusText[task.status]}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Task #{task.id}</h3>
        </div>
        <div className="text-right bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="text-xl font-mono text-eth-400 font-bold">{task.amount} MNEE</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Escrowed</div>
        </div>
      </div>

      <div className="mb-6 flex-grow">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requirements</h4>
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
      </div>

      {task.result && (
        <div className="mb-6 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Deliverable</h4>
             <button 
               onClick={() => copyToClipboard(task.result || '')}
               className="text-xs text-eth-400 hover:text-eth-300 font-medium transition-colors"
             >
               {copied ? 'Copied!' : 'Copy Result'}
             </button>
          </div>
          <div className="p-3 overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
             <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap font-medium">{task.result}</pre>
          </div>
        </div>
      )}

      {/* Agent Actions */}
      {mode === 'AGENT' && task.status === TaskStatus.OPEN && (
        <div className="space-y-3 pt-4 border-t border-slate-800 mt-auto">
           {!resultInput ? (
               <Button onClick={handleAIWork} isLoading={loading} className="w-full bg-gradient-to-r from-eth-600 to-indigo-600 hover:from-eth-500 hover:to-indigo-500">
                 <span className="mr-2 text-lg">✨</span> Generate with Gemini
               </Button>
           ) : (
               <div className="space-y-3 animate-fade-in">
                   <div>
                     <label className="text-xs text-slate-400 mb-1 block">Review & Edit Output</label>
                     <textarea 
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-eth-500 outline-none font-mono"
                       rows={6}
                       value={resultInput}
                       onChange={(e) => setResultInput(e.target.value)}
                       placeholder="Review the AI output before submitting..."
                     />
                   </div>
                   <div className="flex gap-2">
                       <Button variant="secondary" onClick={() => setResultInput('')} className="flex-1">Discard</Button>
                       <Button onClick={handleSubmit} isLoading={loading} className="flex-1 bg-green-600 hover:bg-green-500">Submit to Chain</Button>
                   </div>
               </div>
           )}
        </div>
      )}

      {/* Client Actions */}
      {mode === 'CLIENT' && task.status === TaskStatus.SUBMITTED && (
        <div className="pt-4 border-t border-slate-800 mt-auto">
             <Button onClick={handleApprove} isLoading={loading} className="w-full bg-green-600 hover:bg-green-500 shadow-green-900/20">
                Approve & Release Funds
             </Button>
             <p className="text-xs text-center text-slate-500 mt-2">Funds will be transferred to the Agent.</p>
        </div>
      )}
      
       {mode === 'CLIENT' && task.status === TaskStatus.OPEN && (
        <div className="pt-4 border-t border-slate-800 mt-auto text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eth-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-eth-500"></span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Waiting for agent pickup...</span>
             </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
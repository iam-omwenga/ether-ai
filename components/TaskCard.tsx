import React, { useState, useCallback } from 'react';
import { Task, TaskStatus, UserMode } from '../types';
import Button from './Button';
import { generateAgentResponse, evaluateTaskCompletion, TaskEvaluation } from '../services/geminiService';
import { web3Service } from '../services/web3Service';

interface TaskCardProps {
  task: Task;
  mode: UserMode;
  onRefresh: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, mode, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [resultInput, setResultInput] = useState('');
  const [evaluation, setEvaluation] = useState<TaskEvaluation | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAIWork = useCallback(async () => {
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
  }, [task.description]);

  const handleSubmit = useCallback(async () => {
      if (!resultInput) return;
      setLoading(true);
      try {
          // Get current wallet address
          const currentAddress = await web3Service.getAddress();
          
          // Check if current wallet matches task agent
          if (currentAddress.toLowerCase() !== task.agent.toLowerCase()) {
              alert(`❌ Wallet Mismatch\n\nYou are connected as:\n${currentAddress}\n\nThis task is assigned to:\n${task.agent}\n\n⚠️ You must switch to the correct wallet to submit this task.`);
              setLoading(false);
              return;
          }
          
          // Submit task to blockchain
          await web3Service.submitTask(task.id, resultInput);
          
          // Start AI evaluation
          setEvaluating(true);
          const eval_result = await evaluateTaskCompletion(task.description, resultInput);
          setEvaluation(eval_result);
          
          // If AI is confident, auto-approve the task
          if (eval_result.autoApprove && eval_result.confidence > 80) {
              console.log(`Auto-approving task ${task.id} with ${eval_result.confidence}% confidence`);
              await web3Service.autoApproveTask(task.id);
              alert(`✅ Task submitted and auto-approved!\n\nAI Confidence: ${eval_result.confidence}%\nFeedback: ${eval_result.feedback}\n\n💰 Payment released to your wallet!`);
          } else {
              alert(`⏳ Task submitted for review.\n\nAI Confidence: ${eval_result.confidence}%\nFeedback: ${eval_result.feedback}\n\nClient will review and approve.`);
          }
          
          onRefresh();
      } catch(e) {
          console.error(e);
          alert("Failed to submit task to blockchain. See console for details.");
      } finally {
          setLoading(false);
          setEvaluating(false);
      }
  }, [task.id, task.agent, task.description, resultInput, onRefresh]);

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
                 <span className="mr-2 text-lg">✨</span> EtherAgentAI
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

                   {/* AI Evaluation Result (For Agent) */}
                   {evaluation && (
                     <div className={`rounded-lg p-3 border ${
                       evaluation.autoApprove 
                         ? 'bg-green-500/10 border-green-500/30' 
                         : 'bg-amber-500/10 border-amber-500/30'
                     }`}>
                       <div className="flex items-start justify-between mb-2">
                         <div>
                           <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                             <span className="text-lg">{evaluation.autoApprove ? '✅' : '⏳'}</span>
                             AI Assessment
                           </h4>
                           <p className="text-xs text-slate-400 mt-1">{evaluation.feedback}</p>
                         </div>
                         <div className="text-right">
                           <div className="text-lg font-bold text-eth-400">{evaluation.confidence}%</div>
                           <div className="text-xs text-slate-400">Confidence</div>
                         </div>
                       </div>
                       {evaluation.autoApprove && (
                         <div className="text-xs text-green-300 font-semibold mt-2">
                           💚 Result: Approved! Opening MetaMask to claim funds...
                         </div>
                       )}
                       {!evaluation.autoApprove && (
                         <div className="text-xs text-amber-300 font-semibold mt-2">
                           ⏳ Result: Pending client review (below 80% confidence)
                         </div>
                       )}
                     </div>
                   )}

                   <div className="flex gap-2">
                       <Button variant="secondary" onClick={() => {
                         setResultInput('');
                         setEvaluation(null);
                       }} className="flex-1">Discard</Button>
                       <Button onClick={handleSubmit} isLoading={loading || evaluating} className="flex-1 bg-green-600 hover:bg-green-500">
                         {evaluating ? 'Evaluating...' : 'Submit to Chain'}
                       </Button>
                   </div>
               </div>
           )}
        </div>
      )}

      {/* Manual Submission (Placeholder) */}
      {mode === 'AGENT' && task.status === TaskStatus.OPEN && (
        <div className="pt-4 border-t border-slate-800 mt-6">
          <p className="text-xs text-slate-500 font-medium mb-3">Or submit manually:</p>
          <div className="space-y-2">
            <textarea 
              onClick={() => alert('Please use EtherAgentAI to generate and submit your work.')}
              onChange={() => alert('Please use EtherAgentAI to generate and submit your work.')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-400 focus:border-slate-600 outline-none cursor-not-allowed opacity-75"
              rows={4}
              placeholder="Manual submission disabled - use EtherAgentAI above"
              disabled
            />
            <div 
              onClick={() => alert('Please use EtherAgentAI to generate and submit your work.')}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-700 rounded-lg cursor-not-allowed opacity-60 hover:opacity-75 transition-opacity bg-slate-900/50"
            >
              <span className="text-lg">📎</span>
              <span className="text-sm text-slate-500">Attach files (disabled)</span>
            </div>
          </div>
        </div>
      )}

      {/* Client Actions & AI Evaluation Display */}
      {mode === 'CLIENT' && task.status === TaskStatus.SUBMITTED && (
        <div className="pt-4 border-t border-slate-800 mt-auto space-y-4">
             {evaluation && (
               <div className={`rounded-lg p-3 border ${
                 evaluation.autoApprove 
                   ? 'bg-green-500/10 border-green-500/30' 
                   : 'bg-amber-500/10 border-amber-500/30'
               }`}>
                 <div className="flex items-start justify-between mb-2">
                   <div>
                     <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                       <span className="text-lg">{evaluation.autoApprove ? '✅' : '⏳'}</span>
                       AI Evaluation
                     </h4>
                     <p className="text-xs text-slate-400 mt-1">{evaluation.feedback}</p>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-bold text-eth-400">{evaluation.confidence}%</div>
                     <div className="text-xs text-slate-400">Confidence</div>
                   </div>
                 </div>
                 {evaluation.autoApprove && (
                   <div className="text-xs text-green-300 font-semibold">
                     💚 Auto-approved: Funds released to agent
                   </div>
                 )}
               </div>
             )}
             
             {!evaluation?.autoApprove && (
               <Button onClick={handleApprove} isLoading={loading} className="w-full bg-green-600 hover:bg-green-500 shadow-green-900/20">
                  Approve & Release Funds
               </Button>
             )}
             <p className="text-xs text-center text-slate-500">{evaluation?.autoApprove ? 'Funds transferred automatically.' : 'Review AI assessment above.'}</p>
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

export default React.memo(TaskCard);
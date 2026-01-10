import React, { useState, useEffect, useCallback } from 'react';

interface PaymentInfo {
  taskId: number;
  amount: string;
  agentAddress: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'received';
  txHash?: string;
}

interface PaymentNotificationProps {
  payment: PaymentInfo | null;
  onClose: () => void;
}

const PaymentNotification: React.FC<PaymentNotificationProps> = ({ payment, onClose }) => {
  const [isVisible, setIsVisible] = useState(!!payment);
  const [agentBalance, setAgentBalance] = useState<string | null>(null);

  useEffect(() => {
    if (payment) {
      setIsVisible(true);
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [payment, onClose]);

  if (!isVisible || !payment) return null;

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'confirmed':
        return 'bg-blue-900/20 border-blue-700';
      case 'received':
        return 'bg-green-900/20 border-green-700';
      default:
        return 'bg-slate-900/20 border-slate-700';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'Payment Processing...';
      case 'confirmed':
        return 'Payment Confirmed ✓';
      case 'received':
        return 'Payment Received ✓✓';
      default:
        return 'Unknown';
    }
  }, []);

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className={`border rounded-lg p-4 backdrop-blur-md ${getStatusColor(payment.status)}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Payment Received</h3>
              <p className="text-sm text-slate-400">{getStatusText(payment.status)}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Payment Details */}
        <div className="space-y-2 text-sm">
          {/* Amount */}
          <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
            <span className="text-slate-400">Amount Received:</span>
            <span className="font-mono font-semibold text-green-400">{payment.amount} ETH</span>
          </div>

          {/* Task ID */}
          <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
            <span className="text-slate-400">Task ID:</span>
            <span className="font-mono text-slate-200">#{payment.taskId}</span>
          </div>

          {/* Agent Address */}
          <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
            <span className="text-slate-400">To Address:</span>
            <span className="font-mono text-slate-200 cursor-pointer hover:text-blue-400" 
              title={payment.agentAddress}>
              {formatAddress(payment.agentAddress)}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
            <span className="text-slate-400">Time:</span>
            <span className="text-slate-200">
              {new Date(payment.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {/* Transaction Hash */}
          {payment.txHash && (
            <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
              <span className="text-slate-400">TX Hash:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${payment.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-400 hover:text-blue-300 text-xs"
              >
                {formatAddress(payment.txHash)}
              </a>
            </div>
          )}

          {/* Status Badge */}
          <div className="mt-3 p-2 rounded bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                payment.status === 'received' ? 'bg-green-500' :
                payment.status === 'confirmed' ? 'bg-blue-500' :
                'bg-yellow-500'
              } animate-pulse`}></div>
              <span className="text-xs text-slate-300">
                {payment.status === 'received' && 'Funds are now in your wallet'}
                {payment.status === 'confirmed' && 'Transaction confirmed on blockchain'}
                {payment.status === 'pending' && 'Transaction is being processed'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (payment.txHash) {
              window.open(`https://sepolia.etherscan.io/tx/${payment.txHash}`, '_blank');
            }
          }}
          className="mt-3 w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-medium rounded transition-colors text-slate-100"
        >
          View on Etherscan
        </button>
      </div>
    </div>
  );
};

export default React.memo(PaymentNotification);

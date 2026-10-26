
import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onDismiss }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-xl animate-fadeIn">
    <div className="bg-[#FDECEC] border border-[#F5B5B5] text-[#8B1E1E] rounded-2xl shadow-lg px-6 py-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-grow">{message}</p>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 bg-[#8B1E1E] text-white text-xs font-bold rounded-full px-3 py-1.5 hover:bg-[#6f1717] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="p-1 hover:bg-[#F5B5B5]/50 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ErrorBanner;

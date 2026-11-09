"use client";

import { useState } from "react";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X
} from "lucide-react";

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface VisualFeedbackProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
};

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
};

export function VisualFeedback({ toasts, onRemoveToast }: VisualFeedbackProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={`max-w-sm p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${toastColors[toast.type]}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{toast.title}</h4>
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm font-medium underline mt-2 hover:no-underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => onRemoveToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message: string, options?: Partial<Toast>) => {
    addToast({ type: 'success', title, message, ...options });
  };

  const error = (title: string, message: string, options?: Partial<Toast>) => {
    addToast({ type: 'error', title, message, ...options });
  };

  const info = (title: string, message: string, options?: Partial<Toast>) => {
    addToast({ type: 'info', title, message, ...options });
  };

  const warning = (title: string, message: string, options?: Partial<Toast>) => {
    addToast({ type: 'warning', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
}

// Loading animation component
interface LoadingAnimationProps {
  message?: string;
  type?: 'spinner' | 'pulse' | 'dots';
}

export function LoadingAnimation({ message = "Loading...", type = 'spinner' }: LoadingAnimationProps) {
  if (type === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{message}</p>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{message}</p>
    </div>
  );
}

// Progress indicator component
interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
}

export function ProgressIndicator({ progress, message, showPercentage = true }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message || "Processing..."}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Button with loading state
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({ 
  loading, 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  variant = 'default',
  size = 'md'
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
}

// Hover effect wrapper
interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverEffect({ children, className = "" }: HoverEffectProps) {
  return (
    <div className={`transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}>
      {children}
    </div>
  );
}

// Success animation
export function SuccessAnimation({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 delay-200">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-400">
        {message}
      </p>
    </div>
  );
}












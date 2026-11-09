import React from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  rawCode?: string;
  onRetry?: () => void;
  onCopyCode?: () => void;
}

export function ErrorState({ error, rawCode, onRetry, onCopyCode }: ErrorStateProps) {
  const copyToClipboard = () => {
    if (rawCode) {
      navigator.clipboard.writeText(rawCode);
      onCopyCode?.();
    }
  };

  return (
    <Card className="w-full min-h-[400px] bg-white dark:bg-gray-900 p-8 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-lg">
        <div className="relative">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Unable to Render Diagram
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
        
        {rawCode && (
          <div className="w-full space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Raw response from ChatGPT:
            </p>
            <div className="relative">
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded border max-h-32 overflow-auto text-left">
                {rawCode}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="absolute top-1 right-1 h-6 w-6 p-0"
                title="Copy code"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}

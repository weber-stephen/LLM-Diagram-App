import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Generating your diagram..." }: LoadingStateProps) {
  return (
    <Card className="w-full min-h-[400px] bg-white dark:bg-gray-900 p-8 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {message}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
            ChatGPT is analyzing your request and creating a diagram. This usually takes 5-15 seconds.
          </p>
        </div>
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  RefreshCw, 
  Lightbulb, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  Settings
} from "lucide-react";

interface ErrorRecoverySuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  category: 'retry' | 'modify' | 'alternative' | 'help';
}

interface EnhancedErrorStateProps {
  error: string;
  rawCode?: string;
  onRetry: () => void;
  onModifyPrompt?: (suggestion: string) => void;
}

const getErrorRecoverySuggestions = (error: string): ErrorRecoverySuggestion[] => {
  const suggestions: ErrorRecoverySuggestion[] = [];

  // API-related errors
  if (error.toLowerCase().includes('api') || error.toLowerCase().includes('key')) {
    suggestions.push({
      id: 'check-api-key',
      title: 'Check API Key',
      description: 'Verify your OpenAI API key is valid and has sufficient credits',
      action: 'Check API Key',
      icon: <Settings className="w-4 h-4" />,
      category: 'help'
    });
  }

  // Validation errors
  if (error.toLowerCase().includes('validation') || error.toLowerCase().includes('invalid')) {
    suggestions.push({
      id: 'simplify-prompt',
      title: 'Simplify Your Prompt',
      description: 'Try breaking down your request into smaller, more specific parts',
      action: 'Simplify',
      icon: <Zap className="w-4 h-4" />,
      category: 'modify'
    });

    suggestions.push({
      id: 'use-template',
      title: 'Use a Template',
      description: 'Start with a pre-built template and customize it',
      action: 'Browse Templates',
      icon: <FileText className="w-4 h-4" />,
      category: 'alternative'
    });
  }

  // Network/timeout errors
  if (error.toLowerCase().includes('timeout') || error.toLowerCase().includes('network')) {
    suggestions.push({
      id: 'retry-request',
      title: 'Retry Request',
      description: 'Network issues are usually temporary. Try again in a moment',
      action: 'Retry Now',
      icon: <RefreshCw className="w-4 h-4" />,
      category: 'retry'
    });
  }

  // Content/format errors
  if (error.toLowerCase().includes('format') || error.toLowerCase().includes('content')) {
    suggestions.push({
      id: 'rephrase-prompt',
      title: 'Rephrase Your Request',
      description: 'Try using different words or being more specific about the diagram type',
      action: 'Rephrase',
      icon: <Lightbulb className="w-4 h-4" />,
      category: 'modify'
    });
  }

  // Always include general suggestions
  suggestions.push(
    {
      id: 'try-different-type',
      title: 'Try Different Diagram Type',
      description: 'Switch to a different diagram type that might work better for your use case',
      action: 'Change Type',
      icon: <FileText className="w-4 h-4" />,
      category: 'alternative'
    },
    {
      id: 'contact-support',
      title: 'Get Help',
      description: 'If the problem persists, check our documentation or contact support',
      action: 'Get Help',
      icon: <ExternalLink className="w-4 h-4" />,
      category: 'help'
    }
  );

  return suggestions;
};

const getErrorCategory = (error: string): { type: string; color: string; icon: React.ReactNode } => {
  if (error.toLowerCase().includes('api') || error.toLowerCase().includes('key')) {
    return {
      type: 'API Error',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <Settings className="w-4 h-4" />
    };
  }
  
  if (error.toLowerCase().includes('validation') || error.toLowerCase().includes('invalid')) {
    return {
      type: 'Validation Error',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <AlertTriangle className="w-4 h-4" />
    };
  }
  
  if (error.toLowerCase().includes('timeout') || error.toLowerCase().includes('network')) {
    return {
      type: 'Network Error',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <RefreshCw className="w-4 h-4" />
    };
  }
  
  return {
    type: 'Generation Error',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertTriangle className="w-4 h-4" />
  };
};

export function EnhancedErrorState({ 
  error, 
  rawCode, 
  onRetry, 
  onModifyPrompt
}: EnhancedErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const errorCategory = getErrorCategory(error);
  const suggestions = getErrorRecoverySuggestions(error);
  
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, ErrorRecoverySuggestion[]>);

  const handleSuggestionClick = (suggestion: ErrorRecoverySuggestion) => {
    switch (suggestion.category) {
      case 'retry':
        onRetry();
        break;
      case 'modify':
        if (onModifyPrompt) {
          onModifyPrompt(suggestion.title);
        }
        break;
      case 'alternative':
        // This would trigger template library or type change
        break;
      case 'help':
        // This would open help documentation
        break;
    }
  };

  const copyErrorToClipboard = () => {
    const errorReport = `Error: ${error}\nRaw Code: ${rawCode || 'None'}`;
    navigator.clipboard.writeText(errorReport);
  };

  return (
    <Card className="p-6 border-red-200 bg-red-50/50 dark:bg-red-900/10">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Generation Failed
            </h3>
            <Badge className={`${errorCategory.color} border flex items-center gap-1`}>
              {errorCategory.icon}
              <span className="text-xs">{errorCategory.type}</span>
            </Badge>
          </div>
          
          <p className="text-red-800 dark:text-red-200 mb-4">
            {error}
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={onRetry}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
            
            {rawCode && (
              <Button
                onClick={copyErrorToClipboard}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Error Report
              </Button>
            )}
          </div>
          
          {/* Error Details */}
          {showDetails && (
            <Card className="p-4 mb-4 bg-white dark:bg-gray-900 border-red-200">
              <h4 className="font-medium text-sm mb-2">Technical Details</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">Error Type:</span> {errorCategory.type}
                </div>
                {rawCode && (
                  <div>
                    <span className="font-medium">Raw Response:</span>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                      {rawCode.substring(0, 200)}...
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Recovery Suggestions */}
          {showSuggestions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Recovery Suggestions
                </h4>
                <Button
                  onClick={() => setShowSuggestions(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                >
                  Hide
                </Button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(groupedSuggestions).map(([category, categorySuggestions]) => (
                  <div key={category}>
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      {category === 'retry' && 'Quick Fixes'}
                      {category === 'modify' && 'Modify Your Request'}
                      {category === 'alternative' && 'Alternative Approaches'}
                      {category === 'help' && 'Get Help'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categorySuggestions.map(suggestion => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="h-auto p-3 text-left justify-start border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5 text-gray-600">
                              {suggestion.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {suggestion.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {suggestion.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}












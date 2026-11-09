"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Lightbulb, 
  Zap, 
  Target,
  Copy,
  Wand2,
  TrendingUp,
  Users,
  Database,
  Cloud,
  Shield
} from "lucide-react";

interface SmartSuggestion {
  id: string;
  text: string;
  category: string;
  icon: React.ReactNode;
  description: string;
}

interface EnhancedPromptInputProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  selectedType?: string;
}

const smartSuggestions: SmartSuggestion[] = [
  {
    id: 'aws-architecture',
    text: 'AWS cloud architecture with load balancer, EC2 instances, RDS database, and S3 storage',
    category: 'Cloud',
    icon: <Cloud className="w-4 h-4" />,
    description: 'Complete AWS infrastructure setup'
  },
  {
    id: 'user-flow',
    text: 'User registration and login flow with email verification and password reset',
    category: 'Authentication',
    icon: <Users className="w-4 h-4" />,
    description: 'Complete user authentication process'
  },
  {
    id: 'microservices',
    text: 'Microservices architecture with API Gateway, service discovery, and message queues',
    category: 'Architecture',
    icon: <Database className="w-4 h-4" />,
    description: 'Distributed system design'
  },
  {
    id: 'security-flow',
    text: 'Security architecture with authentication, authorization, and data encryption',
    category: 'Security',
    icon: <Shield className="w-4 h-4" />,
    description: 'Comprehensive security design'
  },
  {
    id: 'api-integration',
    text: 'API integration flow with third-party services, error handling, and retry logic',
    category: 'Integration',
    icon: <Zap className="w-4 h-4" />,
    description: 'External service integration'
  },
  {
    id: 'data-pipeline',
    text: 'Data processing pipeline with ETL, data validation, and analytics dashboard',
    category: 'Data',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Data processing workflow'
  }
];

const promptEnhancements = [
  {
    keyword: 'flowchart',
    suggestions: ['decision points', 'error handling', 'validation steps', 'user actions']
  },
  {
    keyword: 'sequence',
    suggestions: ['time-based interactions', 'service communication', 'error scenarios', 'response handling']
  },
  {
    keyword: 'architecture',
    suggestions: ['scalability', 'security layers', 'data flow', 'deployment zones']
  }
];

export function EnhancedPromptInput({ 
  onSubmit, 
  loading, 
  selectedType
}: EnhancedPromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEnhancements, setShowEnhancements] = useState(false);
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic placeholder examples based on diagram type
  const getExampleText = useCallback(() => {
    switch (selectedType) {
      case 'flowchart':
        return "Draw a flowchart for user login process with authentication, validation, and error handling. Include decision points for invalid credentials, account lockout, and successful login redirect.";
      case 'sequence':
        return "Create a sequence diagram for online order processing showing interactions between Customer, Website, Payment Service, Inventory System, and Email Service from order placement to confirmation.";
      case 'architecture':
        return "Design a cloud architecture with a load balancer, web servers in multiple availability zones, RDS database with read replicas, ElastiCache for caching, and S3 for static assets.";
      default:
        return "Describe the system, process, or architecture you want to visualize...";
    }
  }, [selectedType]);

  const getPlaceholder = () => {
    return `e.g. ${getExampleText()}`;
  };

  // Initialize with example text in debug mode
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE) {
      setPrompt(getExampleText());
    }
  }, [getExampleText]);

  // Show enhancement suggestions based on current prompt
  useEffect(() => {
    if (prompt.length > 10) {
      const currentType = selectedType?.toLowerCase() || '';
      const enhancement = promptEnhancements.find(e => 
        currentType.includes(e.keyword) || prompt.toLowerCase().includes(e.keyword)
      );
      
      if (enhancement) {
        setEnhancementSuggestions(enhancement.suggestions);
        setShowEnhancements(true);
      } else {
        setShowEnhancements(false);
      }
    } else {
      setShowEnhancements(false);
    }
  }, [prompt, selectedType]);

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    setPrompt(suggestion.text);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleEnhancementClick = (enhancement: string) => {
    const newPrompt = prompt + `, including ${enhancement}`;
    setPrompt(newPrompt);
    textareaRef.current?.focus();
  };

  const enhancePrompt = () => {
    if (!prompt.trim()) return;
    
    const enhancements = [
      'with proper error handling',
      'including security considerations',
      'with scalability in mind',
      'showing data flow',
      'with monitoring and logging'
    ];
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(prompt + `, ${randomEnhancement}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt" className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-blue-600" />
          Describe your diagram
        </Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs h-7"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Suggestions
          </Button>
          {prompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs h-7"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          )}
        </div>
      </div>

      {/* Smart Suggestions */}
      {showSuggestions && (
        <Card className="p-4 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-medium">Smart Suggestions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {smartSuggestions.map(suggestion => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-auto p-3 text-left justify-start border-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5 text-blue-600">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Main Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (prompt.trim()) onSubmit(prompt);
        }}
        className="flex flex-col gap-3"
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            id="prompt"
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (prompt.trim()) onSubmit(prompt);
              }
            }}
            required
            minLength={3}
            rows={4}
            className="resize-y pr-20"
            data-tour="prompt-input"
          />
          
          {/* Prompt Enhancement Button */}
          {prompt.length > 20 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={enhancePrompt}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              title="Enhance prompt"
            >
              <Zap className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Enhancement Suggestions */}
        {showEnhancements && enhancementSuggestions.length > 0 && (
          <Card className="p-3 border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-medium">Enhance your prompt</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {enhancementSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnhancementClick(suggestion)}
                  className="text-xs h-6 border-green-200 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                >
                  + {suggestion}
                </Button>
              ))}
            </div>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            data-tour="generate-button"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            {loading ? "Generating..." : "Generate Diagram"}
          </Button>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Press Cmd/Ctrl + Enter to submit</span>
            <Badge variant="outline" className="text-xs">
              {prompt.length} characters
            </Badge>
          </div>
        </div>
      </form>
    </div>
  );
}









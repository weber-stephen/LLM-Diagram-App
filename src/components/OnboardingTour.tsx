"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action to perform
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LLM Diagram! 🎉',
    description: 'Transform your ideas into professional diagrams in seconds. Let\'s take a quick tour to get you started.',
    target: 'body',
    position: 'top'
  },
  {
    id: 'api-key',
    title: 'Step 1: Add Your API Key',
    description: 'Enter your OpenAI API key to generate diagrams. It is stored for this tab and sent directly to OpenAI. Scripts on this site can access it.',
    target: '[data-tour="api-key"]',
    position: 'bottom'
  },
  {
    id: 'diagram-type',
    title: 'Step 2: Choose Diagram Type',
    description: 'Select the type of diagram you want to create. Each type is optimized for different use cases.',
    target: '[data-tour="diagram-type"]',
    position: 'bottom'
  },
  {
    id: 'prompt-input',
    title: 'Step 3: Describe Your Diagram',
    description: 'Use natural language to describe what you want to visualize. Be as detailed as possible for better results.',
    target: '[data-tour="prompt-input"]',
    position: 'bottom'
  },
  {
    id: 'generate',
    title: 'Step 4: Generate Your Diagram',
    description: 'Click generate and wait for the model to return a diagram. Response time varies.',
    target: '[data-tour="generate-button"]',
    position: 'top'
  },
  {
    id: 'post-generation',
    title: 'Step 5: Next Steps',
    description: 'After generation, you can edit with AI, download your diagram, or start over. The banner will guide you.',
    target: '[data-tour="post-generation"]',
    position: 'top'
  }
];

interface OnboardingTourProps {
  isFirstVisit: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ isFirstVisit, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  const highlightCurrentStep = useCallback(() => {
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setOverlayStyle({
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        zIndex: 1000,
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none',
        transition: 'all 0.3s ease'
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isFirstVisit) {
      setIsVisible(true);
      setTimeout(() => {
        highlightCurrentStep();
      }, 100);
    }
  }, [isFirstVisit, currentStep, highlightCurrentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem('llm-diagram-tour-completed', 'true');
    onComplete();
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const targetElement = document.querySelector(currentStepData.target);
  const rect = targetElement?.getBoundingClientRect();

  const getTooltipPosition = () => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const margin = 20;

    let top = rect.bottom + margin;
    let left = rect.left;
    const transform = 'translateX(0)';

    // Adjust position based on viewport
    if (currentStepData.position === 'top') {
      top = rect.top - tooltipHeight - margin;
    } else if (currentStepData.position === 'right') {
      top = rect.top;
      left = rect.right + margin;
    } else if (currentStepData.position === 'left') {
      top = rect.top;
      left = rect.left - tooltipWidth - margin;
    }

    // Keep tooltip in viewport
    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + tooltipHeight > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - margin;
    }
    if (top < margin) {
      top = margin;
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999]"
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Highlight overlay */}
      <div style={overlayStyle} />
      
      {/* Tooltip */}
      <div
        className="fixed z-[1001] w-80"
        style={getTooltipPosition()}
      >
        <Card className="p-4 shadow-xl border-2 border-blue-200 bg-white dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {currentStepData.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {currentStepData.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Back
                    </Button>
                  )}
                  
                  <Button
                    onClick={nextStep}
                    size="sm"
                    className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
                
                <Button
                  onClick={skipTour}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-gray-400 hover:text-gray-600"
                >
                  Skip Tour
                </Button>
              </div>
            </div>
            
            <Button
              onClick={skipTour}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}


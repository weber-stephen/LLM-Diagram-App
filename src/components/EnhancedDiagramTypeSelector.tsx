"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Workflow, GitBranch, Building2, CheckCircle } from "lucide-react";

interface DiagramOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  gradient: string;
  description: string;
  features: string[];
  dotColor: string;
}

const options: DiagramOption[] = [
  {
    value: "flowchart",
    label: "Flowchart",
    icon: Workflow,
    colorClass: "blue",
    gradient: "from-blue-500 to-cyan-500",
    description: "Perfect for process flows and decision trees",
    features: ["Decision points", "Process steps", "Error handling"],
    dotColor: "bg-blue-500"
  },
  {
    value: "sequence",
    label: "Sequence",
    icon: GitBranch,
    colorClass: "green",
    gradient: "from-green-500 to-emerald-500",
    description: "Visualize system interactions over time",
    features: ["API calls", "Service communication", "Timelines"],
    dotColor: "bg-green-500"
  },
  {
    value: "architecture",
    label: "Architecture",
    icon: Building2,
    colorClass: "purple",
    gradient: "from-purple-500 to-pink-500",
    description: "Design system architecture diagrams",
    features: ["Cloud infrastructure", "Microservices", "Data flow"],
    dotColor: "bg-purple-500"
  }
];

interface EnhancedDiagramTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EnhancedDiagramTypeSelector({ 
  value, 
  onChange 
}: EnhancedDiagramTypeSelectorProps) {
  return (
    <div className="w-full space-y-4" data-tour="diagram-type">
      <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Choose Your Diagram Type
      </Label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map(option => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <Card
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                relative p-6 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-2 border-blue-500 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }
              `}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Select ${option.label} diagram type`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              
              {/* Icon with gradient background */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4
                bg-gradient-to-br ${option.gradient} shadow-md
              `}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {option.label}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed min-h-[40px]">
                {option.description}
              </p>
              
              {/* Features */}
              <ul className="space-y-1.5">
                {option.features.map((feature, idx) => (
                  <li 
                    key={idx}
                    className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${option.dotColor}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Not sure? Start with a <strong>Flowchart</strong> for general processes or <strong>Architecture</strong> for system designs
      </p>
    </div>
  );
}


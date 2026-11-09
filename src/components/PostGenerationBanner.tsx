"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Download, 
  CheckCircle, 
  X, 
  Sparkles,
  FileText
} from "lucide-react";

interface PostGenerationBannerProps {
  diagramType: string;
  onStartEditing: () => void;
  onDownload: () => void;
  onDismiss: () => void;
  onMarkAsComplete: () => void;
}

export function PostGenerationBanner({
  diagramType,
  onStartEditing,
  onDownload,
  onDismiss,
  onMarkAsComplete
}: PostGenerationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  const handleMarkComplete = () => {
    setIsDismissed(true);
    onMarkAsComplete();
  };

  if (isDismissed) return null;

  const getDiagramTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flowchart':
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
          label: 'Flowchart'
        };
      case 'sequence':
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
          label: 'Sequence Diagram'
        };
      case 'architecture':
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
          label: 'Architecture Diagram'
        };
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800',
          label: 'Diagram'
        };
    }
  };

  const typeInfo = getDiagramTypeInfo(diagramType);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <Card className="p-4 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Diagram Generated Successfully!
              </h3>
              <Badge className={`text-xs ${typeInfo.color}`}>
                {typeInfo.icon}
                <span className="ml-1">{typeInfo.label}</span>
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your {typeInfo.label.toLowerCase()} is ready! Would you like to make any changes or download it?
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onStartEditing}
                size="default"
                className="text-sm px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit with AI
              </Button>
              
              <Button
                onClick={onDownload}
                variant="outline"
                size="default"
                className="text-sm px-4 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={handleMarkComplete}
                variant="ghost"
                size="default"
                className="text-sm px-4 text-green-700 hover:text-green-800 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-900/20"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Looks Good
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

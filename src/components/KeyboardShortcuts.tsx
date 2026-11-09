"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  X, 
  Command, 
  Option, 
  Plus,
  Minus,
  RotateCcw,
  Edit3,
  Download,
  Search
} from "lucide-react";

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: 'general' | 'diagram' | 'editing' | 'navigation';
  action?: () => void;
}

interface KeyboardShortcutsProps {
  onClose: () => void;
  onAction?: (action: string) => void;
}

const shortcuts: KeyboardShortcut[] = [
  // General shortcuts
  {
    id: 'submit-prompt',
    keys: ['Cmd', 'Enter'],
    description: 'Submit prompt and generate diagram',
    category: 'general'
  },
  {
    id: 'focus-prompt',
    keys: ['Cmd', 'K'],
    description: 'Focus on prompt input',
    category: 'general'
  },
  {
    id: 'show-shortcuts',
    keys: ['Cmd', '/'],
    description: 'Show keyboard shortcuts',
    category: 'general'
  },
  {
    id: 'escape',
    keys: ['Escape'],
    description: 'Close modals and cancel actions',
    category: 'general'
  },
  
  // Diagram shortcuts
  {
    id: 'zoom-in',
    keys: ['+'],
    description: 'Zoom in on diagram',
    category: 'diagram'
  },
  {
    id: 'zoom-out',
    keys: ['-'],
    description: 'Zoom out on diagram',
    category: 'diagram'
  },
  {
    id: 'reset-zoom',
    keys: ['0'],
    description: 'Reset zoom to 100%',
    category: 'diagram'
  },
  {
    id: 'pan-mode',
    keys: ['Space'],
    description: 'Toggle pan mode (hold)',
    category: 'diagram'
  },
  
  // Editing shortcuts
  {
    id: 'toggle-edit',
    keys: ['Cmd', 'E'],
    description: 'Toggle edit mode',
    category: 'editing'
  },
  {
    id: 'reset-diagram',
    keys: ['Cmd', 'R'],
    description: 'Reset diagram to initial state',
    category: 'editing'
  },
  
  // Navigation shortcuts
  {
    id: 'download',
    keys: ['Cmd', 'D'],
    description: 'Download current diagram',
    category: 'navigation'
  },
  {
    id: 'show-templates',
    keys: ['Cmd', 'T'],
    description: 'Show template library',
    category: 'navigation'
  },
  {
    id: 'show-suggestions',
    keys: ['Cmd', 'I'],
    description: 'Show smart suggestions',
    category: 'navigation'
  }
];

const getKeyIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case 'cmd':
      return <Command className="w-3 h-3" />;
    case 'option':
      return <Option className="w-3 h-3" />;
    case 'shift':
      return <span className="text-xs font-mono">Shift</span>;
    case 'enter':
      return <span className="text-xs font-mono">Enter</span>;
    case 'escape':
      return <span className="text-xs font-mono">Esc</span>;
    case '+':
      return <Plus className="w-3 h-3" />;
    case '-':
      return <Minus className="w-3 h-3" />;
    case '0':
      return <RotateCcw className="w-3 h-3" />;
    case 'space':
      return <div className="w-6 h-3 border border-gray-400 rounded text-xs flex items-center justify-center">Space</div>;
    default:
      return <span className="text-xs font-mono">{key}</span>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'general': return <Keyboard className="w-4 h-4" />;
    case 'diagram': return <Search className="w-4 h-4" />;
    case 'editing': return <Edit3 className="w-4 h-4" />;
    case 'navigation': return <Download className="w-4 h-4" />;
    default: return <Keyboard className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'general': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'diagram': return 'bg-green-100 text-green-800 border-green-200';
    case 'editing': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'navigation': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(shortcuts.map(s => s.category)))];
  
  const filteredShortcuts = selectedCategory === 'all' 
    ? shortcuts 
    : shortcuts.filter(s => s.category === selectedCategory);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close shortcuts modal with Escape
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600" />
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Speed up your workflow with these keyboard shortcuts
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs h-7"
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4">
            {filteredShortcuts.map(shortcut => (
              <div key={shortcut.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Badge className={`${getCategoryColor(shortcut.category)} border flex items-center gap-1`}>
                    {getCategoryIcon(shortcut.category)}
                    <span className="text-xs">{shortcut.category}</span>
                  </Badge>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {shortcut.description}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {index > 0 && <span className="text-gray-400 text-xs">+</span>}
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                        {getKeyIcon(key)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8">
              <Keyboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No shortcuts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
            </div>
            <Button onClick={onClose} size="sm">
              Got it
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Global shortcuts
      if (cmdKey && e.key === '/') {
        e.preventDefault();
        // Trigger shortcuts modal
        const event = new CustomEvent('show-shortcuts');
        window.dispatchEvent(event);
      }

      if (cmdKey && e.key === 'k') {
        e.preventDefault();
        // Focus prompt input
        const promptInput = document.querySelector('#prompt') as HTMLTextAreaElement;
        if (promptInput) {
          promptInput.focus();
        }
      }

      if (cmdKey && e.key === 't') {
        e.preventDefault();
        // Show template library
        const event = new CustomEvent('show-templates');
        window.dispatchEvent(event);
      }

      if (cmdKey && e.key === 'i') {
        e.preventDefault();
        // Show suggestions
        const event = new CustomEvent('show-suggestions');
        window.dispatchEvent(event);
      }

      if (cmdKey && e.key === 'e') {
        e.preventDefault();
        // Toggle edit mode
        const event = new CustomEvent('toggle-edit');
        window.dispatchEvent(event);
      }

      if (cmdKey && e.key === 'd') {
        e.preventDefault();
        // Download diagram
        const event = new CustomEvent('download-diagram');
        window.dispatchEvent(event);
      }

      if (cmdKey && e.key === 'r') {
        e.preventDefault();
        // Reset diagram
        const event = new CustomEvent('reset-diagram');
        window.dispatchEvent(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}












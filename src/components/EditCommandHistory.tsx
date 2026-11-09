import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { EditCommand } from "@/lib/diagramStore";

interface EditCommandHistoryProps {
  commands: EditCommand[];
  onCommandClick?: (command: EditCommand) => void;
}

export function EditCommandHistory({ commands, onCommandClick }: EditCommandHistoryProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (command: EditCommand) => {
    if (command.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (command.applied) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (command: EditCommand) => {
    if (command.error) {
      return "Failed";
    }
    if (command.applied) {
      return "Applied";
    }
    return "Pending";
  };

  const getStatusColor = (command: EditCommand) => {
    if (command.error) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    if (command.applied) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  if (commands.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500 text-sm">
          No edit commands yet. Start by making changes to your diagram.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium">Edit History</h3>
        <Badge variant="secondary" className="ml-auto">
          {commands.length}
        </Badge>
      </div>
      
      <div className="h-64 overflow-y-auto space-y-2">
        {commands.map((command) => {
          const CommandElement = onCommandClick ? 'button' : 'div';
          const commandProps = onCommandClick ? {
            onClick: () => onCommandClick(command),
            className: "w-full text-left p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          } : {
            className: "w-full text-left p-3 rounded-lg border"
          };

          return (
            <CommandElement
              key={command.id}
              {...commandProps}
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(command)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {command.command}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTime(command.timestamp)}</span>
                    <Badge className={`text-xs ${getStatusColor(command)}`}>
                      {getStatusText(command)}
                    </Badge>
                  </div>
                  {command.error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {command.error}
                    </p>
                  )}
                </div>
              </div>
            </CommandElement>
          );
        })}
      </div>
    </Card>
  );
} 
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, Undo2, Eye, Trash2 } from "lucide-react";
import { EditCommand, DiagramSnapshot } from "@/lib/diagramStore";

interface EnhancedEditCommandHistoryProps {
  commands: EditCommand[];
  snapshots: DiagramSnapshot[];
  currentSnapshotIndex: number;
  onCommandClick?: (command: EditCommand) => void;
  onRevertToSnapshot?: (snapshotId: string) => void;
  onClearHistory?: () => void;
}

export function EnhancedEditCommandHistory({ 
  commands, 
  snapshots, 
  currentSnapshotIndex,
  onCommandClick, 
  onRevertToSnapshot,
  onClearHistory 
}: EnhancedEditCommandHistoryProps) {
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (command: EditCommand) => {
    if (command.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (command.applied) {
      return <CheckCircle className="w-4 h-4 text-primary" />;
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
      return "bg-accent text-accent-foreground";
    }
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const handleRevert = (snapshotId: string) => {
    if (onRevertToSnapshot) {
      onRevertToSnapshot(snapshotId);
      setShowRevertConfirm(null);
    }
  };

  const isCurrentSnapshot = (index: number) => {
    return index === currentSnapshotIndex;
  };

  if (commands.length === 0 && snapshots.length === 0) {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit History</h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            No edit history yet
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start by creating a diagram and making changes to see your edit history here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit History</h3>
            <Badge variant="secondary" className="text-xs">
              {commands.length} commands
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSnapshots(!showSnapshots)}
              className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Eye className="w-3 h-3 mr-1" />
              {showSnapshots ? 'Hide' : 'Show'} Snapshots
            </Button>
            
            {onClearHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Snapshots Section */}
      {showSnapshots && snapshots.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">
              Diagram Snapshots ({snapshots.length})
            </h4>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  isCurrentSnapshot(index) 
                    ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                      {snapshot.description}
                    </p>
                    {isCurrentSnapshot(index) && (
                      <Badge className="text-xs bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(snapshot.timestamp)}</span>
                    <span>•</span>
                    <span className="capitalize">{snapshot.diagramType}</span>
                  </div>
                </div>
                
                {!isCurrentSnapshot(index) && onRevertToSnapshot && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRevertConfirm(snapshot.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7 px-2 border-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    Revert
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commands Section */}
      {commands.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h4 className="text-xs font-semibold text-foreground">
              Edit Commands ({commands.length})
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {commands.map((command) => {
              const CommandElement = onCommandClick ? 'button' : 'div';
              const commandProps = onCommandClick ? {
                onClick: () => onCommandClick(command),
                className: "group w-full text-left p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              } : {
                className: "w-full text-left p-3 rounded-lg border bg-gray-50 dark:bg-gray-800"
              };

              return (
                <CommandElement
                  key={command.id}
                  {...commandProps}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(command)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 leading-relaxed">
                        {command.command}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatTime(command.timestamp)}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(command)}`}>
                          {getStatusText(command)}
                        </Badge>
                      </div>
                      {command.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                          <strong>Error:</strong> {command.error}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandElement>
              );
            })}
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {showRevertConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <Undo2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Revert
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to revert to this snapshot? This will discard all changes made after this point and restore the diagram to its previous state.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowRevertConfirm(null)}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRevert(showRevertConfirm)}
                className="text-sm font-semibold shadow-sm"
              >
                <Undo2 className="w-4 h-4 mr-2" />
                Revert to Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

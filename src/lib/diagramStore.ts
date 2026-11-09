import { create } from "zustand";

export interface EditCommand {
  id: string;
  command: string;
  timestamp: Date;
  applied: boolean;
  error?: string;
}

export interface DiagramSnapshot {
  id: string;
  timestamp: Date;
  diagramCode: string;
  diagramType: string;
  editCommand?: string;
  description: string;
  model?: string;
  responseModel?: string;
  promptVersion?: string;
}

export interface DiagramState {
  selectedType: string;
  currentDiagram: string;
  editHistory: EditCommand[];
  isEditing: boolean;
  diagramSnapshots: DiagramSnapshot[];
  currentSnapshotIndex: number;
  showPostGenerationBanner: boolean;
}

interface DiagramStore extends DiagramState {
  setSelectedType: (type: string) => void;
  setCurrentDiagram: (diagram: string) => void;
  addEditCommand: (command: string, id?: string) => void;
  updateEditCommand: (id: string, updates: Partial<EditCommand>) => void;
  clearEditHistory: () => void;
  setIsEditing: (editing: boolean) => void;
  resetDiagram: () => void;
  hydrate: () => void;
  // Epic 6: Snapshot management
  createSnapshot: (editCommand?: string, metadata?: { model?: string; responseModel?: string; promptVersion?: string; diagramType?: string; diagramCode?: string }) => void;
  revertToSnapshot: (snapshotId: string) => void;
  getSnapshotHistory: () => DiagramSnapshot[];
  clearSnapshots: () => void;
  // Banner management
  showBanner: () => void;
  hideBanner: () => void;
}

const LOCAL_KEY = "diagram_selected_type";
const DIAGRAM_KEY = "diagram_current_state";
const HISTORY_KEY = "diagram_edit_history";
const SNAPSHOTS_KEY = "diagram_snapshots";
const SNAPSHOT_INDEX_KEY = "diagram_snapshot_index";

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  selectedType: "flowchart", // Default value, will be hydrated on client
  currentDiagram: "",
  editHistory: [],
  isEditing: false,
  diagramSnapshots: [],
  currentSnapshotIndex: -1,
  showPostGenerationBanner: false,

  setSelectedType: (type) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_KEY, type);
    }
    set({ selectedType: type });
  },

  setCurrentDiagram: (diagram) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DIAGRAM_KEY, diagram);
    }
    set({ currentDiagram: diagram });
  },

  addEditCommand: (command, id) => {
    const newCommand: EditCommand = {
      id: id || Date.now().toString(),
      command,
      timestamp: new Date(),
      applied: false,
    };
    
    const updatedHistory = [...get().editHistory, newCommand];
    
    if (typeof window !== "undefined") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
    
    set({ editHistory: updatedHistory });
  },

  updateEditCommand: (id, updates) => {
    const updatedHistory = get().editHistory.map(cmd =>
      cmd.id === id ? { ...cmd, ...updates } : cmd
    );
    
    if (typeof window !== "undefined") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
    
    set({ editHistory: updatedHistory });
  },

  clearEditHistory: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
    set({ editHistory: [] });
  },

  setIsEditing: (editing) => {
    set({ isEditing: editing });
  },

  resetDiagram: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DIAGRAM_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(SNAPSHOTS_KEY);
      localStorage.removeItem(SNAPSHOT_INDEX_KEY);
    }
    set({ 
      currentDiagram: "", 
      editHistory: [], 
      isEditing: false,
      diagramSnapshots: [],
      currentSnapshotIndex: -1
    });
  },

  // Epic 6: Snapshot management methods
  createSnapshot: (editCommand, metadata) => {
    const state = get();
    if (!metadata?.diagramCode && !state.currentDiagram) return;

    const snapshot: DiagramSnapshot = {
      id: Date.now().toString(),
      timestamp: new Date(),
      diagramCode: metadata?.diagramCode || state.currentDiagram,
      diagramType: metadata?.diagramType || state.selectedType,
      editCommand,
      description: editCommand ? `Edit: ${editCommand}` : "Initial diagram",
      model: metadata?.model,
      responseModel: metadata?.responseModel,
      promptVersion: metadata?.promptVersion,
    };

    const updatedSnapshots = [...state.diagramSnapshots, snapshot];
    const newIndex = updatedSnapshots.length - 1;

    if (typeof window !== "undefined") {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updatedSnapshots));
      localStorage.setItem(SNAPSHOT_INDEX_KEY, newIndex.toString());
    }

    set({ 
      diagramSnapshots: updatedSnapshots,
      currentSnapshotIndex: newIndex
    });
  },

  revertToSnapshot: (snapshotId: string) => {
    const state = get();
    const snapshot = state.diagramSnapshots.find(s => s.id === snapshotId);
    
    if (!snapshot) {
      console.error("Snapshot not found:", snapshotId);
      return;
    }

    const snapshotIndex = state.diagramSnapshots.findIndex(s => s.id === snapshotId);
    
    set({ 
      currentDiagram: snapshot.diagramCode,
      selectedType: snapshot.diagramType,
      currentSnapshotIndex: snapshotIndex
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(DIAGRAM_KEY, snapshot.diagramCode);
      localStorage.setItem(LOCAL_KEY, snapshot.diagramType);
      localStorage.setItem(SNAPSHOT_INDEX_KEY, snapshotIndex.toString());
    }
  },

  getSnapshotHistory: () => {
    return get().diagramSnapshots;
  },

  clearSnapshots: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SNAPSHOTS_KEY);
      localStorage.removeItem(SNAPSHOT_INDEX_KEY);
    }
    set({ 
      diagramSnapshots: [],
      currentSnapshotIndex: -1
    });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem(LOCAL_KEY);
      const storedDiagram = localStorage.getItem(DIAGRAM_KEY);
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      const storedSnapshots = localStorage.getItem(SNAPSHOTS_KEY);
      const storedSnapshotIndex = localStorage.getItem(SNAPSHOT_INDEX_KEY);
      
      const updates: Partial<DiagramState> = {};
      
      if (storedType) {
        updates.selectedType = storedType;
      }
      
      if (storedDiagram) {
        updates.currentDiagram = storedDiagram;
      }
      
      if (storedHistory) {
        try {
          const history = JSON.parse(storedHistory);
          updates.editHistory = history;
        } catch (error) {
          console.error("Failed to parse stored edit history:", error);
        }
      }

      if (storedSnapshots) {
        try {
          const snapshots = JSON.parse(storedSnapshots);
          updates.diagramSnapshots = snapshots;
        } catch (error) {
          console.error("Failed to parse stored snapshots:", error);
        }
      }

      if (storedSnapshotIndex) {
        updates.currentSnapshotIndex = parseInt(storedSnapshotIndex, 10);
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  },

  // Banner management
  showBanner: () => {
    set({ showPostGenerationBanner: true });
  },

  hideBanner: () => {
    set({ showPostGenerationBanner: false });
  },
}));

// Hydrate store on client side
if (typeof window !== "undefined") {
  useDiagramStore.getState().hydrate();
}

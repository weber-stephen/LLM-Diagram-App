import { create } from "zustand";
import type { DiagramSnapshot, EditCommand } from "@/lib/diagramStore";
import type { Proposal } from "@/components/AgentWorkspace";

export type ConversationEntry = { role: "user" | "assistant"; kind?: "message" | "question" | "proposal"; content: string };
export type LibraryDiagram = {
  id: string; title: string; type: string; createdAt: number; updatedAt: number;
  code: string; snapshots: DiagramSnapshot[]; snapshotIndex: number; editHistory: EditCommand[];
  entries: ConversationEntry[]; proposal: Proposal | null;
};
type LibraryState = {
  diagrams: LibraryDiagram[]; activeId: string | null; hydrated: boolean; saveError: string | null;
  hydrate: () => void; createDiagram: () => void; selectDiagram: (id: string) => void;
  updateDiagram: (id: string, patch: Partial<LibraryDiagram>) => void;
  approve: (id: string, proposal: Proposal) => void; revert: (id: string, snapshotId: string) => void;
  deleteDiagram: (id: string) => void;
};
const KEY = "diagram_library_v1";
const ACTIVE_KEY = "diagram_library_active_v1";
const blank = (): LibraryDiagram => ({ id: crypto.randomUUID(), title: "Untitled diagram", type: "flowchart", createdAt: Date.now(), updatedAt: Date.now(), code: "", snapshots: [], snapshotIndex: -1, editHistory: [], entries: [], proposal: null });
const persist = (diagrams: LibraryDiagram[], activeId: string | null) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(diagrams));
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    return null;
  } catch { return "Could not save diagrams in this browser. Free up storage, then try again."; }
};
export const useDiagramLibrary = create<LibraryState>((set, get) => ({
  diagrams: [], activeId: null, hydrated: false, saveError: null,
  hydrate: () => {
    if (get().hydrated) return;
    let diagrams: LibraryDiagram[] = [];
    try { const stored = JSON.parse(localStorage.getItem(KEY) || "null"); if (Array.isArray(stored)) diagrams = stored; } catch { /* legacy import below */ }
    if (!diagrams.length) {
      const code = localStorage.getItem("diagram_current_state") || "";
      let snapshots: DiagramSnapshot[] = [];
      let editHistory: EditCommand[] = [];
      try { snapshots = JSON.parse(localStorage.getItem("diagram_snapshots") || "[]"); } catch { /* ignore */ }
      try { editHistory = JSON.parse(localStorage.getItem("diagram_edit_history") || "[]"); } catch { /* ignore */ }
      const imported = blank();
      if (code || snapshots.length) {
        imported.title = "Previous diagram";
        imported.type = localStorage.getItem("diagram_selected_type") || "flowchart";
        imported.code = code || snapshots.at(-1)?.diagramCode || "";
        imported.snapshots = snapshots;
        imported.editHistory = editHistory;
        imported.snapshotIndex = Number(localStorage.getItem("diagram_snapshot_index") ?? snapshots.length - 1);
        try {
          const session = JSON.parse(sessionStorage.getItem("diagram_agent_session_v1") || "{}");
          if (Array.isArray(session.entries)) imported.entries = session.entries;
          if (session.proposal) imported.proposal = session.proposal;
        } catch { /* ignore */ }
      }
      diagrams = [imported];
      const saveError = persist(diagrams, imported.id);
      if (!saveError && (code || snapshots.length)) {
        ["diagram_current_state", "diagram_snapshots", "diagram_edit_history", "diagram_snapshot_index"].forEach(key => localStorage.removeItem(key));
        sessionStorage.removeItem("diagram_agent_session_v1");
      }
      set({ diagrams, activeId: imported.id, hydrated: true, saveError });
      return;
    }
    const savedId = localStorage.getItem(ACTIVE_KEY);
    set({ diagrams, activeId: diagrams.some(d => d.id === savedId) ? savedId : diagrams[0].id, hydrated: true });
  },
  createDiagram: () => { const next = blank(); const diagrams = [next, ...get().diagrams]; set({ diagrams, activeId: next.id, saveError: persist(diagrams, next.id) }); },
  selectDiagram: id => { if (get().diagrams.some(d => d.id === id)) { localStorage.setItem(ACTIVE_KEY, id); set({ activeId: id }); } },
  updateDiagram: (id, patch) => { const diagrams = get().diagrams.map(d => d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d); set({ diagrams, saveError: persist(diagrams, get().activeId) }); },
  approve: (id, proposal) => {
    const diagrams = get().diagrams.map(d => {
      if (d.id !== id) return d;
      const snapshot: DiagramSnapshot = { id: crypto.randomUUID(), timestamp: new Date(), diagramCode: proposal.diagram, diagramType: d.type, description: d.snapshots.length ? "Approved revision" : "Initial diagram", model: proposal.model, responseModel: proposal.responseModel, promptVersion: proposal.promptVersion };
      const snapshots = [...d.snapshots, snapshot];
      return { ...d, code: proposal.diagram, snapshots, snapshotIndex: snapshots.length - 1, proposal: null, updatedAt: Date.now() };
    });
    set({ diagrams, saveError: persist(diagrams, get().activeId) });
  },
  revert: (id, snapshotId) => {
    const diagrams = get().diagrams.map(d => { const index = d.snapshots.findIndex(s => s.id === snapshotId); return d.id === id && index >= 0 ? { ...d, code: d.snapshots[index].diagramCode, type: d.snapshots[index].diagramType, snapshotIndex: index, updatedAt: Date.now() } : d; });
    set({ diagrams, saveError: persist(diagrams, get().activeId) });
  },
  deleteDiagram: id => {
    let diagrams = get().diagrams.filter(d => d.id !== id);
    if (!diagrams.length) diagrams = [blank()];
    const activeId = get().activeId === id ? diagrams[0].id : get().activeId;
    set({ diagrams, activeId, saveError: persist(diagrams, activeId) });
  }
}));

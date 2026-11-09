import { useDiagramLibrary } from "@/lib/diagramLibrary";
import { clearTelemetryChoice } from "@/lib/telemetry";

const LOCAL_KEYS = [
  "diagram_library_v1", "diagram_library_active_v1", "diagram_current_state",
  "diagram_selected_type", "diagram_edit_history", "diagram_snapshots",
  "diagram_snapshot_index", "diagram_model", "diagram_theme",
  "llm-diagram-tour-completed", "openai_api_key",
];
const SESSION_KEYS = ["openai_api_key", "diagram_telemetry_consent", "diagram_agent_session_v1"];

/** Remove this app's browser data while leaving unrelated origin storage alone. */
export function clearLocalData() {
  clearTelemetryChoice();
  for (const key of LOCAL_KEYS) localStorage.removeItem(key);
  for (const key of SESSION_KEYS) sessionStorage.removeItem(key);
  useDiagramLibrary.setState({ diagrams: [], activeId: null, hydrated: false, saveError: null });
}

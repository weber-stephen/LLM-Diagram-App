"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { runAgentTurn, canApproveProposal } from "@/lib/agent-graph";
import { DiagramRequestError } from "@/lib/openai";
import { captureEvent, setTelemetryConsent } from "@/lib/telemetry";
import { validateDiagramCode } from "@/lib/validation";
import type { AgentMessage } from "@/lib/agent-request";
import type { DiagramFormat } from "@/lib/diagram-prompts";
import type { DiagramModel } from "@/lib/model-config";
import type { ConversationEntry } from "@/lib/diagramLibrary";

export type Proposal = { diagram: string; format: DiagramFormat; baseDiagram: string; model: string; responseModel?: string; promptVersion: string; request: string };

export function AgentWorkspace({ apiKey, model, format, currentDiagram, initialEntries, initialProposal, onStateChange, onFirstRequest, onPendingChange, onApprove, onProposalReady, renderCanvas }: { apiKey: string; model: DiagramModel; format: DiagramFormat; currentDiagram: string; initialEntries: ConversationEntry[]; initialProposal: Proposal | null; onStateChange: (entries: ConversationEntry[], proposal: Proposal | null) => void; onFirstRequest: (request: string) => void; onPendingChange: (pending: boolean) => void; onApprove: (proposal: Proposal) => void; onProposalReady: () => void; renderCanvas: (proposal: Proposal | null, actions: { approve: () => void; reject: () => void }) => ReactNode }) {
  const [entries, setEntries] = useState<ConversationEntry[]>(initialEntries);
  const [proposal, setProposal] = useState<Proposal | null>(initialProposal);
  const [draft, setDraft] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<DiagramRequestError | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);
  const [consent, setConsent] = useState(false);
  const [mobileView, setMobileView] = useState<"diagram" | "conversation">("diagram");
  const telemetryConfigured = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST);

  useEffect(() => {
    try {
      const optedIn = sessionStorage.getItem("diagram_telemetry_consent") === "yes";
      setConsent(optedIn);
      if (optedIn) setTelemetryConsent(true);
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    onStateChange(entries.slice(-20), proposal);
  }, [entries, proposal, onStateChange]);
  useEffect(() => { onPendingChange(pending); }, [pending, onPendingChange]);

  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [retryAt]);

  const submit = async (text = draft) => {
    if (pending || !text.trim() || Date.now() < retryAt) return;
    const request = text.trim();
    setPending(true);
    setError(null);
    const started = performance.now();
    try {
      const history: AgentMessage[] = entries.slice(-10).map(entry => ({ role: entry.role, content: entry.content }));
      const result = await runAgentTurn({ request, history, format, currentDiagram, apiKey, model });
      const next: ConversationEntry[] = [...entries, { role: "user" as const, content: request }, { role: "assistant" as const, kind: result.kind, content: result.message || "I have a diagram proposal for you." }].slice(-20);
      if (entries.length === 0) onFirstRequest(request);
      setEntries(next);
      setDraft("");
      if (result.kind === "proposal") { setProposal({ diagram: result.diagram, format, baseDiagram: currentDiagram, model, responseModel: result.responseModel, promptVersion: result.promptVersion, request }); onProposalReady(); setMobileView("diagram"); }
      captureEvent("agent_turn", { outcome: result.kind, model, response_model: result.responseModel, format, prompt_version: result.promptVersion, duration_ms: Math.round(performance.now() - started), input_tokens: result.usage?.inputTokens, output_tokens: result.usage?.outputTokens });
    } catch (cause) {
      const requestError = cause instanceof DiagramRequestError ? cause : new DiagramRequestError("invalid", "Something went wrong. Retry the request.");
      setError(requestError);
      setRetryAt(requestError.retryAfterMs ? Date.now() + requestError.retryAfterMs : 0);
      captureEvent("agent_turn", { outcome: "error", error_code: requestError.code, model, format, prompt_version: "agent-v1", duration_ms: Math.round(performance.now() - started) });
    } finally { setPending(false); }
  };

  const approve = async () => {
    if (!proposal || !canApproveProposal(proposal, currentDiagram, format)) { setError(new DiagramRequestError("invalid", "The approved diagram changed since this proposal. Ask for a fresh proposal.")); setMobileView("conversation"); return; }
    const validation = await validateDiagramCode(proposal.diagram, proposal.format);
    if (!validation.isValid || !validation.extractedCode) { setError(new DiagramRequestError("invalid", "This saved proposal is no longer valid. Ask for a fresh proposal.")); setMobileView("conversation"); return; }
    onApprove({ ...proposal, diagram: validation.extractedCode });
    setProposal(null);
    setError(null);
    captureEvent("proposal_decision", { outcome: "approved", model: proposal.model, response_model: proposal.responseModel, format: proposal.format, prompt_version: proposal.promptVersion });
  };

  const reject = () => {
    if (proposal) captureEvent("proposal_decision", { outcome: "rejected", model: proposal.model, response_model: proposal.responseModel, format: proposal.format, prompt_version: proposal.promptVersion });
    setProposal(null);
  };

  const waitSeconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return <div className="workbench">
    <div className="mobile-switcher" role="tablist" aria-label="Workspace view" onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "diagram" : event.key === "End" ? "conversation" : mobileView === "diagram" ? "conversation" : "diagram"; setMobileView(next); document.getElementById(`tab-${next}`)?.focus(); } }}><button id="tab-diagram" type="button" role="tab" aria-controls="panel-diagram" aria-selected={mobileView === "diagram"} tabIndex={mobileView === "diagram" ? 0 : -1} onClick={() => setMobileView("diagram")}>Diagram {proposal ? "· Proposed" : ""}</button><button id="tab-conversation" type="button" role="tab" aria-controls="panel-conversation" aria-selected={mobileView === "conversation"} tabIndex={mobileView === "conversation" ? 0 : -1} onClick={() => setMobileView("conversation")}>Conversation</button></div>
    <section id="panel-conversation" role="tabpanel" aria-labelledby="tab-conversation" className={`conversation-pane ${mobileView === "conversation" ? "mobile-active" : ""}`} aria-label="Diagram conversation">
      <div className="pane-heading"><span className="eyebrow">ASSISTANT</span><h2>Conversation</h2><p>Describe a flow, ask a question, or request a change.</p></div>
      <div className="conversation-log" role="log" aria-live="polite">
        {entries.length === 0 && <div className="empty-conversation"><span className="eyebrow">START HERE</span><p>Try “Show a user signing in through an API gateway.”</p><span>Every proposed change needs your approval.</span></div>}
        {entries.map((entry, index) => <div key={index} className={`message ${entry.role === "user" ? "message-user" : ""}`}><strong>{entry.role === "user" ? "You" : entry.kind === "question" ? "Assistant asks" : "Assistant"}</strong><p className="whitespace-pre-wrap">{entry.content}</p></div>)}
        {pending && <p className="thinking" role="status">Thinking through your diagram…</p>}
      </div>
      <div className="composer"><form onSubmit={event => { event.preventDefault(); void submit(); }}><label htmlFor="agent-draft">Your message</label><textarea id="agent-draft" value={draft} onChange={event => setDraft(event.target.value)} maxLength={4000} placeholder="Describe a diagram or ask a question" /><div className="composer-actions"><span>{draft.length}/4000</span><Button type="submit" disabled={pending || !draft.trim() || waitSeconds > 0}>{pending ? "Thinking…" : "Send message"}</Button>{error && <Button type="button" variant="outline" disabled={pending || waitSeconds > 0} onClick={() => void submit(draft)}>Retry</Button>}</div></form>
      {error && <p role="alert" className="inline-error">{error.message}{waitSeconds > 0 ? ` Retry in ${waitSeconds}s.` : ""} Your message and diagram are preserved.</p>}
      <details className="conversation-options"><summary>Conversation options</summary><div>{telemetryConfigured && <label><input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); setTelemetryConsent(event.target.checked); }} /> Share outcome and timing events with PostHog for this tab</label>}<button type="button" onClick={() => setConfirmClear(true)}>Clear conversation</button></div></details></div>
    </section>
    <section id="panel-diagram" role="tabpanel" aria-labelledby="tab-diagram" className={`canvas-pane ${mobileView === "diagram" ? "mobile-active" : ""}`} aria-label="Diagram canvas">{renderCanvas(proposal, { approve: () => void approve(), reject })}</section>
    {confirmClear && <ConfirmDialog title="Clear conversation?" description="This removes the conversation and any pending proposal for this diagram." confirmLabel="Clear conversation" onCancel={() => setConfirmClear(false)} onConfirm={() => { setEntries([]); setProposal(null); setConfirmClear(false); }} />}
  </div>;
}

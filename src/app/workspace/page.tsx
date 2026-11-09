"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { readSessionKey } from "@/lib/session-key";
import { AgentWorkspace, type Proposal } from "@/components/AgentWorkspace";
import { DiagramRenderer } from "@/components/DiagramRenderer";
import { DiagramXMLPreview } from "@/components/DiagramXMLPreview";
import { DiagramViewControls } from "@/components/DiagramViewControls";
import { EnhancedEditCommandHistory } from "@/components/EnhancedEditCommandHistory";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DEFAULT_MODEL, MODELS, isDiagramModel, type DiagramModel } from "@/lib/model-config";
import { useDiagramLibrary, type ConversationEntry } from "@/lib/diagramLibrary";
import { getRenderer } from "@/lib/renderers";
import { downloadAsSVG, downloadAsXML, downloadAsMermaid, generateFilename } from "@/lib/download-utils";
import { ThemeToggle } from "@/components/ThemeProvider";
import { clearLocalData } from "@/lib/clear-local-data";

export default function WorkspacePage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyChecked, setKeyChecked] = useState(false);
  const [model, setModel] = useState<DiagramModel>(DEFAULT_MODEL);
  const [showApproved, setShowApproved] = useState(false);
  const [pending, setPending] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const { diagrams, activeId, hydrated, saveError, hydrate, createDiagram, selectDiagram, updateDiagram, approve, revert, deleteDiagram } = useDiagramLibrary();
  const active = diagrams.find(d => d.id === activeId);
  useEffect(() => {
    const key = readSessionKey();
    setApiKey(key);
    if (!key) router.replace("/start");
    setKeyChecked(true);
    hydrate();
    setLibraryOpen(window.innerWidth >= 1200);
    const savedModel = localStorage.getItem("diagram_model");
    if (savedModel && isDiagramModel(savedModel)) setModel(savedModel);
  }, [router, hydrate]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1200px)");
    const sync = () => setLibraryOpen(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!libraryOpen || window.innerWidth >= 1200) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.querySelector<HTMLElement>(".library-select[aria-current=page]")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLibraryOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); requestAnimationFrame(() => { if (previous?.isConnected) previous.focus(); else document.querySelector<HTMLElement>(".header-controls > button")?.focus(); }); };
  }, [libraryOpen]);
  const onStateChange = useCallback((entries: ConversationEntry[], proposal: Proposal | null) => {
    if (activeId) updateDiagram(activeId, { entries, proposal });
  }, [activeId, updateDiagram]);
  if (!keyChecked || !apiKey || !hydrated || !active) return <div className="app-shell" aria-busy="true" />;
  const format = getRenderer(active.type) === "diagramxml" ? "diagramxml" : "mermaid";
  const snapshot = active.snapshots[active.snapshotIndex];
  const displayFormat = getRenderer(snapshot?.diagramType || active.type) === "diagramxml" ? "diagramxml" : "mermaid";
  const switchTo = (id: string) => { if (pending) return; selectDiagram(id); setShowApproved(false); if (window.innerWidth < 1200) setLibraryOpen(false); };
  const newDiagram = () => { if (pending) return; createDiagram(); setShowApproved(false); if (window.innerWidth < 1200) setLibraryOpen(false); };
  const download = () => {
    if (!active.code) return;
    const filename = generateFilename(snapshot?.diagramType || active.type);
    if (displayFormat === "diagramxml") downloadAsXML(active.code, { filename, format: "xml" });
    else {
      const svg = document.querySelector(".approved-diagram svg") as SVGElement | null;
      if (svg) downloadAsSVG(svg, { filename, format: "svg" });
      else downloadAsMermaid(active.code, { filename, format: "mermaid" });
    }
  };
  const renderCanvas = (proposal: Proposal | null, actions: { approve: () => void; reject: () => void }) => {
    const proposalVisible = Boolean(proposal && !showApproved);
    const code = proposalVisible ? proposal!.diagram : active.code;
    const codeFormat = proposalVisible ? proposal!.format : displayFormat;
    return <>
      <div className="canvas-toolbar"><div><span className="eyebrow">WORKSPACE / {active.type.toUpperCase()}</span><h2>{active.title} <span className={`status-pill ${proposalVisible ? "status-proposed" : ""}`}>{proposalVisible ? "Proposed" : active.code ? "Approved" : "Empty"}</span></h2></div><div className="toolbar-actions">{proposal && active.code && <Button variant="outline" size="sm" onClick={() => setShowApproved(value => !value)}>{showApproved ? "View proposal" : "View approved"}</Button>}{active.code && <Button variant="outline" size="sm" onClick={download}>Download approved</Button>}</div></div>
      {proposal && <div className="review-bar"><div><strong>{proposalVisible ? "Review the proposal" : "Current approved diagram"}</strong><p>{proposalVisible ? "The approved diagram stays in place until you apply this version." : "Switch back to the proposal to compare before deciding."}</p></div><div className="review-actions"><Button onClick={actions.approve}>Approve and apply</Button><Button variant="outline" onClick={actions.reject}>Reject</Button></div></div>}
      <div className="canvas-stage">{code ? <div className={proposalVisible ? "proposed-diagram" : "approved-diagram"}>{codeFormat === "mermaid" ? <DiagramViewControls className="diagram-frame"><DiagramRenderer code={code} /></DiagramViewControls> : <DiagramXMLPreview code={code} />}</div> : <div className="canvas-empty"><span className="eyebrow">READY WHEN YOU ARE</span><h3>Your diagram will appear here.</h3><p>Describe a process or system in the conversation to create a reviewable diagram.</p></div>}</div>
      {proposalVisible && <details className="source-panel"><summary>View proposal source</summary><pre>{proposal!.diagram}</pre></details>}
      {!proposalVisible && active.code && <div className="canvas-bottom">{snapshot?.model && <p>Prompt {snapshot.promptVersion} · requested {snapshot.model}{snapshot.responseModel ? ` · response ${snapshot.responseModel}` : ""}</p>}{active.snapshots.length > 0 && <details><summary>Version history ({active.snapshots.length})</summary><EnhancedEditCommandHistory commands={active.editHistory} snapshots={active.snapshots} currentSnapshotIndex={active.snapshotIndex} onRevertToSnapshot={id => revert(active.id, id)} /></details>}</div>}
    </>;
  };
  return <div className="app-shell workspace-shell">
    <header className="app-header"><Link href="/" className="brand" aria-label="LLM Diagram home"><span className="brand-mark" aria-hidden="true">◇</span><span><strong>LLM Diagram</strong><span>Diagram workbench</span></span></Link><div className="header-controls">
      {!libraryOpen && <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)} aria-controls="diagram-library" aria-expanded={false}>Diagrams</Button>}
      <div className="header-dropdown"><span id="type-label">Type</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" aria-labelledby="type-label type-value"><span id="type-value">{{ flowchart: "Flowchart", sequence: "Sequence", architecture: "Architecture" }[active.type] || active.type}</span><ChevronDown aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuRadioGroup value={active.type} onValueChange={value => updateDiagram(active.id, { type: value })}><DropdownMenuRadioItem value="flowchart">Flowchart</DropdownMenuRadioItem><DropdownMenuRadioItem value="sequence">Sequence</DropdownMenuRadioItem><DropdownMenuRadioItem value="architecture">Architecture</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu></div>
      <div className="header-dropdown"><span id="model-label">Model</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" aria-labelledby="model-label model-value"><span id="model-value">{MODELS[model].label}</span><ChevronDown aria-hidden="true" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuRadioGroup value={model} onValueChange={value => { if (isDiagramModel(value)) { setModel(value); localStorage.setItem("diagram_model", value); } }}>{Object.entries(MODELS).map(([id, option]) => <DropdownMenuRadioItem key={id} value={id}>{option.label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu></div>
      <details className="settings-menu"><summary>Settings</summary><div><p>Model access and charges depend on your account.</p><ThemeToggle /><button type="button" onClick={() => { sessionStorage.removeItem("openai_api_key"); localStorage.removeItem("openai_api_key"); setApiKey(null); router.replace("/"); }}>Remove key</button><button type="button" onClick={() => setConfirmClearAll(true)} disabled={pending}>Clear all local data</button></div></details></div></header>
    {saveError && <p className="library-error" role="alert">{saveError}</p>}
    <main className={`workspace-layout ${libraryOpen ? "library-visible" : ""}`}>
      {libraryOpen && <button className="library-scrim" type="button" aria-label="Close diagrams" onClick={() => setLibraryOpen(false)} />}
      {libraryOpen && <aside id="diagram-library" className="diagram-library" aria-label="Diagram library"><div className="library-top"><strong>Diagrams</strong><Button variant="ghost" size="sm" onClick={() => setLibraryOpen(false)} aria-controls="diagram-library" aria-expanded={true}>Hide</Button></div><div className="library-create"><Button size="sm" onClick={newDiagram} disabled={pending}>New diagram</Button></div><div className="library-list">{[...diagrams].sort((a,b) => b.updatedAt - a.updatedAt).map(diagram => <div key={diagram.id} className={`library-item ${diagram.id === active.id ? "is-active" : ""}`}><button type="button" className="library-select" onClick={() => switchTo(diagram.id)} disabled={pending} aria-current={diagram.id === active.id ? "page" : undefined}><strong>{diagram.title}</strong><span>{diagram.type} · {new Date(diagram.updatedAt).toLocaleDateString()}</span></button><button type="button" className="library-delete" onClick={() => setDeleteId(diagram.id)} disabled={pending} aria-label={`Delete ${diagram.title}`}>×</button></div>)}</div><label className="library-rename">Name<input value={active.title} maxLength={80} onChange={event => updateDiagram(active.id, { title: event.target.value })} onBlur={() => { if (!active.title.trim()) updateDiagram(active.id, { title: "Untitled diagram" }); }} /></label></aside>}
      <AgentWorkspace key={active.id} apiKey={apiKey} model={model} format={format} currentDiagram={active.code} initialEntries={active.entries} initialProposal={active.proposal} onStateChange={onStateChange} onFirstRequest={request => { if (active.title === "Untitled diagram") updateDiagram(active.id, { title: request.slice(0, 48) }); }} onPendingChange={setPending} onApprove={proposal => { approve(active.id, proposal); setShowApproved(false); }} onProposalReady={() => setShowApproved(false)} renderCanvas={renderCanvas} />
    </main>
    {deleteId && <ConfirmDialog title="Delete this diagram?" description="The diagram, conversation, and all its versions will be removed from this browser." confirmLabel="Delete diagram" onCancel={() => setDeleteId(null)} onConfirm={() => { deleteDiagram(deleteId); setDeleteId(null); }} />}
    {confirmClearAll && <ConfirmDialog title="Clear all local data?" description="This removes this app's diagrams, conversations, pending proposals, versions, and settings from this browser, plus the key and telemetry choice in this tab. This cannot be undone." confirmLabel="Clear all local data" onCancel={() => setConfirmClearAll(false)} onConfirm={() => { clearLocalData(); setApiKey(null); router.replace("/"); }} />}
    <footer className="app-footer">Diagrams, conversations, and pending proposals persist in this browser. Your key and telemetry choice last for this tab. Requests go directly to OpenAI.</footer>
  </div>;
}

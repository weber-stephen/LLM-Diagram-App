"use client";

import { ArrowRight, Check, GitBranch, Github, Layers3, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeProvider";

export function LandingPage({ onStart, hasKey }: { onStart: () => void; hasKey: boolean }) {
  return <div className="landing-page">
    <header className="landing-header">
      <div className="brand"><span className="brand-mark" aria-hidden="true">◇</span><div><strong>LLM Diagram</strong><span>Think clearly. Draw clearly.</span></div></div>
      <nav aria-label="Landing navigation"><a href="#how-it-works">How it works</a><ThemeToggle /><Button onClick={onStart} size="sm">{hasKey ? "Resume workspace" : "Start diagramming"} <ArrowRight aria-hidden="true" /></Button></nav>
    </header>
    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-intro"><span className="eyebrow">A DIAGRAM ASSISTANT FOR TECHNICAL THINKING</span><h1 id="landing-title">Turn a conversation into a diagram you can trust.</h1><p>Describe a system or workflow in plain language. Explore ideas with an assistant, review each proposed diagram, and apply only the version you approve.</p><div className="landing-actions"><Button onClick={onStart} size="lg">{hasKey ? "Resume workspace" : "Start diagramming"} <ArrowRight aria-hidden="true" /></Button><a href="#how-it-works">See how it works <span aria-hidden="true">↘</span></a></div><div className="landing-caption"><span className="caption-rule" aria-hidden="true" />Your own OpenAI key · No account with this app</div></div>
        <div className="landing-preview" aria-label="Example of a proposed architecture diagram"><div className="preview-topline"><span><i aria-hidden="true" /> DIAGRAM / ARCHITECTURE</span><span>PROPOSAL 01</span></div><div className="preview-canvas"><div className="preview-column"><div className="preview-node">Client</div><div className="preview-connector" /><div className="preview-node preview-node-main">API gateway</div><div className="preview-connector" /><div className="preview-branches"><div className="preview-node">Service A</div><div className="preview-node">Service B</div></div><div className="preview-branch-lines" /><div className="preview-node preview-node-data">Data store</div></div></div><div className="preview-review"><div><span className="preview-review-dot" /> Ready for review</div><span><Check size={14} aria-hidden="true" /> Apply when approved</span></div></div>
      </section>
      <section className="landing-process" id="how-it-works" aria-labelledby="process-title"><div className="process-heading"><span className="eyebrow">THE WORKFLOW</span><h2 id="process-title">From rough idea to useful artifact.</h2><p>A focused workspace keeps the conversation beside the diagram while you iterate.</p></div><div className="process-steps"><article><span className="process-number">01</span><MessageSquareText aria-hidden="true" /><h3>Describe it</h3><p>Explain a process, system, or interaction. The assistant can ask a clarifying question before drawing.</p></article><article><span className="process-number">02</span><GitBranch aria-hidden="true" /><h3>Review it</h3><p>See a proposed diagram on the canvas. Compare it with the approved version and inspect its source.</p></article><article><span className="process-number">03</span><Layers3 aria-hidden="true" /><h3>Keep refining</h3><p>Approve, reject, revise, restore earlier versions, and download an editable file.</p></article></div></section>
      <section className="landing-close"><div><span className="eyebrow">READY TO MAP IT OUT?</span><h2>Start with the idea you have.</h2><p>Flowcharts, sequence diagrams, and architecture diagrams all begin with a conversation.</p></div><Button onClick={onStart} size="lg">{hasKey ? "Resume workspace" : "Get started"} <ArrowRight aria-hidden="true" /></Button></section>
    </main>
    <footer className="landing-footer"><strong>LLM Diagram</strong><span>Your key stays in this tab. Diagrams, conversations, and pending proposals persist in this browser. Requests go directly to OpenAI.</span><a className="repo-link" href="https://github.com/weber-stephen/LLM-Diagram-App" target="_blank" rel="noopener noreferrer"><Github aria-hidden="true" />View on GitHub</a></footer>
  </div>;
}

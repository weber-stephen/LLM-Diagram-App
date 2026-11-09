"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnhancedApiKeyInput } from "@/components/EnhancedApiKeyInput";
import { readSessionKey } from "@/lib/session-key";
import { ThemeToggle } from "@/components/ThemeProvider";
import { Github } from "lucide-react";

export default function StartPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (readSessionKey()) router.replace("/workspace");
    else setReady(true);
  }, [router]);
  if (!ready) return <div className="app-shell" aria-busy="true" />;
  return <div className="setup-page">
    <header className="setup-header"><Link href="/" className="brand"><span className="brand-mark" aria-hidden="true">◇</span><span><strong>LLM Diagram</strong><small>Diagram workbench</small></span></Link><div className="setup-header-actions"><ThemeToggle /><Link href="/">Back to overview</Link></div></header>
    <main className="setup-main"><div className="setup-intro"><span className="eyebrow">STEP 01 / CONNECT</span><h1>Connect your key to begin.</h1><p>Once connected, you can describe a system, review proposals on the canvas, and approve the diagram you want to keep.</p><ol><li><span>01</span>Describe a diagram in your own words</li><li><span>02</span>Review the proposed result</li><li><span>03</span>Approve, refine, and download</li></ol></div><section className="setup-form" aria-label="Connect OpenAI key"><h2>Your OpenAI key</h2><p>The key is stored for this tab and is accessible to scripts on this site. Diagram requests go directly from your browser to OpenAI. You may incur API charges on your account.</p><EnhancedApiKeyInput onValidKey={() => router.replace("/workspace")} /></section></main>
    <footer className="app-footer">Diagrams, conversations, and pending proposals persist in this browser. The key and telemetry choice last for this tab. <a className="repo-link" href="https://github.com/weber-stephen/LLM-Diagram-App" target="_blank" rel="noopener noreferrer"><Github aria-hidden="true" />View on GitHub</a></footer>
  </div>;
}

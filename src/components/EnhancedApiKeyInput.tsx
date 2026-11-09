"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function EnhancedApiKeyInput({ onValidKey }: { onValidKey: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const validateKey = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error("The key could not be validated. Check it and try again.");
      sessionStorage.setItem("openai_api_key", key);
      localStorage.removeItem("openai_api_key");
      onValidKey(key);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not validate the key. Try again."); }
    finally { setLoading(false); }
  };
  return <form className="key-form" onSubmit={event => { event.preventDefault(); void validateKey(); }}>
    <label htmlFor="api-key">OpenAI API key</label><div className="key-field"><input id="api-key" type={showKey ? "text" : "password"} value={key} onChange={event => setKey(event.target.value)} placeholder="sk-…" required minLength={20} autoComplete="off" aria-describedby="key-help" /><button type="button" onClick={() => setShowKey(value => !value)} aria-label={showKey ? "Hide API key" : "Show API key"}>{showKey ? "Hide" : "Show"}</button></div>
    <p id="key-help">Stored for this tab; scripts on this site can access it. Requests go directly from your browser to OpenAI and may incur charges. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get a key ↗</a></p>
    {error && <p role="alert" className="inline-error">{error}</p>}
    <Button type="submit" disabled={loading || !key.trim()}>{loading ? "Validating…" : "Connect key"}</Button>
  </form>;
}

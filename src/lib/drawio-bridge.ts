export const DRAWIO_ORIGIN = "https://embed.diagrams.net";

function eventType(data: unknown): "init" | "load" | null {
  try {
    const message: unknown = typeof data === "string" ? JSON.parse(data) : data;
    if (!message || typeof message !== "object" || Array.isArray(message)) return null;
    const event = (message as Record<string, unknown>).event;
    return event === "init" || event === "load" ? event : null;
  } catch { return null; }
}

export function attachDrawioBridge(host: Pick<Window, "addEventListener" | "removeEventListener">, frame: Pick<HTMLIFrameElement, "contentWindow">, xml: string, onLoad: () => void) {
  const onMessage = (message: MessageEvent) => {
    if (message.origin !== DRAWIO_ORIGIN || message.source !== frame.contentWindow) return;
    const event = eventType(message.data);
    if (event === "init") frame.contentWindow?.postMessage(JSON.stringify({ action: "load", xml, fit: 1 }), DRAWIO_ORIGIN);
    if (event === "load") onLoad();
  };
  host.addEventListener("message", onMessage as EventListener);
  return () => host.removeEventListener("message", onMessage as EventListener);
}

export function invokeDrawioAction(frame: Pick<HTMLIFrameElement, "contentWindow">, actionName: "zoomIn" | "zoomOut" | "smartFit") {
  frame.contentWindow?.postMessage(JSON.stringify({ action: "invokeAction", actionName }), DRAWIO_ORIGIN);
}

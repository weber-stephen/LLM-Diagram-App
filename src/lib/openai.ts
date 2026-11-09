export class DiagramRequestError extends Error {
  constructor(public readonly code: "auth" | "access" | "rate_limit" | "quota" | "service" | "network" | "timeout" | "invalid" | "input", message: string, public readonly retryAfterMs?: number) {
    super(message);
    this.name = "DiagramRequestError";
  }
}

export const MAX_REQUEST_LENGTH = 4000;

export function checkRequest(request: string): string {
  const trimmed = request.trim();
  if (!trimmed || trimmed.length > MAX_REQUEST_LENGTH) throw new DiagramRequestError("input", `Write a message in 1–${MAX_REQUEST_LENGTH} characters.`);
  return trimmed;
}

export function errorForStatus(status: number, apiCode?: string, retryAfterMs?: number): DiagramRequestError {
  if (status === 401) return new DiagramRequestError("auth", "OpenAI rejected the API key. Check your key and try again.");
  if (status === 403 || status === 404) return new DiagramRequestError("access", "This model is unavailable for your OpenAI account. Select another model and retry.");
  if (status === 429 && apiCode === "insufficient_quota") return new DiagramRequestError("quota", "This OpenAI account has no available quota. Check billing or use another key.");
  if (status === 429) return new DiagramRequestError("rate_limit", "OpenAI is limiting requests. Wait before retrying.", retryAfterMs);
  return new DiagramRequestError("service", "OpenAI could not complete the request. Retry in a moment.");
}

export function retryAfterMilliseconds(value: string | null, now = Date.now()): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(delay) && delay > 0 ? Math.min(delay, 300000) : undefined;
}

import posthog from "posthog-js";

const EVENT_NAMES = ["agent_turn", "proposal_decision"] as const;
type EventName = typeof EVENT_NAMES[number];
type Properties = { outcome?: string; error_code?: string; model?: string; response_model?: string; format?: string; prompt_version?: string; duration_ms?: number; input_tokens?: number; output_tokens?: number };
const SAFE_KEYS = new Set<keyof Properties>(["outcome", "error_code", "model", "response_model", "format", "prompt_version", "duration_ms", "input_tokens", "output_tokens"]);
let enabled = false;

export function safeEvent(name: string, properties: Record<string, unknown>) {
  if (!EVENT_NAMES.includes(name as EventName)) return null;
  const safe: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!SAFE_KEYS.has(key as keyof Properties)) continue;
    if (typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    if (typeof value === "string" && /^[a-zA-Z0-9_.-]{1,80}$/.test(value)) safe[key] = value;
  }
  return { name, properties: safe };
}

export function setTelemetryConsent(consent: boolean): boolean {
  if (typeof window === "undefined") return false;
  sessionStorage.setItem("diagram_telemetry_consent", consent ? "yes" : "no");
  if (!consent) { enabled = false; posthog.opt_out_capturing(); return false; }
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return false;
  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_heatmaps: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_persistence: true,
      advanced_disable_flags: true,
      ...(process.env.NEXT_PUBLIC_POSTHOG_TEST_MODE === "1" ? { internal_or_test_user_hostname: /^$/, opt_out_useragent_filter: true, disable_compression: true } : {}),
      before_send: event => {
        const result = safeEvent(event.event, event.properties || {});
        if (!result) return null;
        const properties = event.properties || {};
        return { ...event, properties: { ...result.properties, token: properties.token, distinct_id: properties.distinct_id } };
      },
    });
  }
  posthog.opt_in_capturing({ captureEventName: false });
  enabled = true;
  return true;
}

export function captureEvent(name: EventName, properties: Properties) {
  if (!enabled) return;
  const event = safeEvent(name, properties);
  if (event) posthog.capture(event.name, event.properties);
}

export function clearTelemetryChoice() {
  enabled = false;
  if (posthog.__loaded) {
    posthog.opt_out_capturing();
    posthog.clear_opt_in_out_capturing();
  }
  sessionStorage.removeItem("diagram_telemetry_consent");
}

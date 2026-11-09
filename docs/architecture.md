# Current architecture

LLM Diagram is a client-side Next.js sample. It has no application API route, database, user accounts, or server-side OpenAI key. The browser sends requests directly to OpenAI with a key supplied by the visitor. See the [README](../README.md) for setup and the review flow.

## Request and approval flow

1. The key is validated against OpenAI and held in `sessionStorage` for the tab. A legacy `localStorage` key is migrated and removed on load.
2. `src/lib/agent-request.ts` sends recent conversation and the current diagram to Chat Completions and parses a structured reply.
3. `src/lib/agent-graph.ts` routes messages, questions, and proposals. Mermaid or draw.io XML proposals pass validation before review.
4. The user approves or rejects a proposal. Approval checks that the base diagram and format still match, then saves the diagram through Zustand and `localStorage`.
5. Mermaid renders in the page. draw.io XML uses the third-party diagrams.net embed through a small iframe adapter with exact origin and source checks; its iframe is a separate origin.

Conversation entries, pending proposals, approved diagrams, and snapshots persist in browser `localStorage`. The key and telemetry choice use tab `sessionStorage`. Optional PostHog telemetry requires environment configuration and tab-level opt-in; `src/lib/telemetry.ts` allowlists event names and custom properties while retaining the transport token and anonymous distinct ID required for ingestion.

## Boundaries

The diagram validator checks syntax and known active-content patterns, but does not establish the accuracy of a diagram or provide a general sandbox. Browser scripts on this origin can access browser storage. The diagrams.net embed and OpenAI are external services; users should review their data practices before sending sensitive content. There is no hosted-key protection or multi-user collaboration.

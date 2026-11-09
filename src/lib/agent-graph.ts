import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { DiagramRequestError } from "./openai";
import { postprocessDiagramXMLRegex } from "./postprocess-icons";
import { validateDiagramCode } from "./validation";
import { requestAgentReply, type AgentMessage, type AgentReply } from "./agent-request";
import type { DiagramFormat } from "./diagram-prompts";
import type { DiagramModel } from "./model-config";

export type AgentTurnInput = { request: string; history: AgentMessage[]; format: DiagramFormat; currentDiagram: string; apiKey: string; model: DiagramModel; fetchImpl?: typeof fetch; timeoutMs?: number };
export type AgentTurnResult = AgentReply & { promptVersion: string };

const State = Annotation.Root({
  input: Annotation<AgentTurnInput>(),
  reply: Annotation<AgentReply>(),
  result: Annotation<AgentTurnResult>(),
});

const graph = new StateGraph(State)
  .addNode("respond", async state => ({ reply: await requestAgentReply(state.input) }))
  .addNode("validate", async state => {
    const { reply, input } = state;
    if (!reply.diagram.trim()) throw new DiagramRequestError("invalid", "OpenAI proposed an empty diagram. Ask it to try again with more detail.");
    const first = await validateDiagramCode(reply.diagram, input.format);
    if (!first.isValid || !first.extractedCode) throw new DiagramRequestError("invalid", first.error || "The proposed diagram is invalid. Ask for a simpler version.");
    const processed = input.format === "diagramxml" ? postprocessDiagramXMLRegex(first.extractedCode) : first.extractedCode;
    const final = await validateDiagramCode(processed, input.format);
    if (!final.isValid || !final.extractedCode) throw new DiagramRequestError("invalid", final.error || "The proposed diagram could not be displayed.");
    return { reply: { ...reply, diagram: final.extractedCode } };
  })
  .addNode("deliver", state => ({ result: { ...state.reply, promptVersion: "agent-v1" } }))
  .addEdge(START, "respond")
  .addConditionalEdges("respond", state => state.reply.kind === "proposal" ? "validate" : "deliver")
  .addEdge("validate", "deliver")
  .addEdge("deliver", END)
  .compile();

export async function runAgentTurn(input: AgentTurnInput): Promise<AgentTurnResult> {
  const result = await graph.invoke({ input });
  return result.result;
}

export function canApproveProposal(proposal: { diagram: string; format: DiagramFormat; baseDiagram: string }, currentDiagram: string, format: DiagramFormat): boolean {
  return proposal.baseDiagram === currentDiagram && proposal.format === format && !!proposal.diagram.trim();
}

export const MODELS = {
  "gpt-6-luna": { label: "GPT-6 Luna", description: "Recommended · lower cost" },
  "gpt-6.1-sol": { label: "GPT-6.1 Sol", description: "Higher quality option" },
} as const;

export type DiagramModel = keyof typeof MODELS;
export const DEFAULT_MODEL: DiagramModel = "gpt-6-luna";

export function isDiagramModel(value: string): value is DiagramModel {
  return Object.prototype.hasOwnProperty.call(MODELS, value);
}

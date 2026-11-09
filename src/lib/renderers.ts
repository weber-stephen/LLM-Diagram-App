export const getRenderer = (type: string) =>
  type === "architecture" ? "diagramxml" : "mermaid"; 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function extractMermaidCode(raw: string): string {
  // Remove triple backticks and optional 'mermaid' after them
  return raw
    .replace(/^```mermaid\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .replace(/```/g, "")
    .trim();
}
export function extractXMLCode(raw: string): string {
  // Remove triple backticks and optional 'xml' after them
  return raw
    .replace(/^```xml\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .replace(/```/g, "")
    .trim();
}
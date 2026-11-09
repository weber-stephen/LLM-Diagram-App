/**
 * Validation functions for diagram code
 */

import mermaid from "mermaid";
import { extractMermaidCode, extractXMLCode } from './utils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  extractedCode?: string;
}

export async function validateMermaidCode(rawCode: string): Promise<ValidationResult> {
  if (!rawCode || rawCode.trim().length === 0) {
    return {
      isValid: false,
      error: "No code provided"
    };
  }

  // Extract code from backticks if present
  const extractedCode = extractMermaidCode(rawCode);

  if (!extractedCode) {
    return {
      isValid: false,
      error: "No valid Mermaid code found in response"
    };
  }

  if (extractedCode.length > 50_000 || /%%\{|\bclick\s+|<[^>]+>|javascript:/i.test(extractedCode)) {
    return { isValid: false, error: "The Mermaid diagram contains unsupported or oversized content." };
  }
  try {
    await mermaid.parse(extractedCode);
  } catch {
    return { isValid: false, error: "The model returned invalid Mermaid syntax." };
  }

  // Check for basic Mermaid syntax
  const hasValidSyntax = extractedCode.includes('graph') || 
                        extractedCode.includes('flowchart') ||
                        extractedCode.includes('sequenceDiagram') ||
                        extractedCode.includes('classDiagram') ||
                        extractedCode.includes('stateDiagram') ||
                        extractedCode.includes('gantt') ||
                        extractedCode.includes('pie') ||
                        extractedCode.includes('journey') ||
                        extractedCode.includes('architecture-beta') ||
                        extractedCode.includes('architecture') ||
                        extractedCode.includes('gitgraph') ||
                        extractedCode.includes('mindmap') ||
                        extractedCode.includes('timeline') ||
                        extractedCode.includes('sankey-beta') ||
                        extractedCode.includes('quadrantChart') ||
                        extractedCode.includes('requirement') ||
                        extractedCode.includes('erDiagram') ||
                        extractedCode.includes('block-beta') ||
                        extractedCode.includes('block') ||
                        extractedCode.includes('flowchart-v2');

  if (!hasValidSyntax) {
    return {
      isValid: false,
      error: "Response doesn't contain valid Mermaid diagram syntax",
      extractedCode
    };
  }

  return {
    isValid: true,
    extractedCode
  };
}

export function validateDiagramXMLCode(rawCode: string): ValidationResult {
  if (!rawCode || rawCode.trim().length === 0) {
    return {
      isValid: false,
      error: "No code provided"
    };
  }

  // Extract code from backticks if present
  const extractedCode = extractXMLCode(rawCode);

  if (!extractedCode) {
    return {
      isValid: false,
      error: "No valid XML code found in response"
    };
  }

  if (extractedCode.length > 150_000 || /<!DOCTYPE|<!ENTITY|<script\b|<iframe\b|<foreignObject\b|javascript:|https?:\/\/|data:|\bon[a-z]+\s*=/i.test(extractedCode)) {
    return { isValid: false, error: "The XML contains unsupported or oversized content." };
  }
  if (typeof DOMParser === 'undefined') return { isValid: false, error: "XML parser unavailable." };
  const doc = new DOMParser().parseFromString(extractedCode, 'application/xml');
  if (doc.querySelector('parsererror')) return { isValid: false, error: "The model returned malformed XML." };
  const cells = Array.from(doc.querySelectorAll('mxCell'));
  const ids = cells.map(cell => cell.getAttribute('id'));
  const idSet = new Set(ids);
  if (doc.documentElement.tagName !== 'mxfile' || !doc.querySelector('mxfile > diagram > mxGraphModel > root') || !idSet.has('0') || !idSet.has('1') || ids.some(id => !id) || idSet.size !== ids.length || !cells.some(cell => cell.getAttribute('vertex') === '1')) {
    return { isValid: false, error: "The XML is missing valid draw.io diagram structure." };
  }
  for (const cell of cells) {
    const label = cell.getAttribute('value') || '';
    if (/<[^>]+>|javascript:|data:/i.test(label)) return { isValid: false, error: "A diagram label contains unsupported markup." };
    const parent = cell.getAttribute('parent');
    if (parent && !idSet.has(parent)) return { isValid: false, error: "The XML references a missing parent." };
    if (cell.getAttribute('vertex') === '1' && !cell.querySelector('mxGeometry')) return { isValid: false, error: "A diagram node has no geometry." };
    if (cell.getAttribute('edge') === '1' && ['source', 'target'].some(name => !idSet.has(cell.getAttribute(name)))) return { isValid: false, error: "A diagram edge references a missing node." };
  }

  // Check for basic XML structure
  const hasXmlDeclaration = extractedCode.includes('<?xml');
  const hasMxfile = extractedCode.includes('<mxfile');
  const hasMxGraphModel = extractedCode.includes('<mxGraphModel');

  if (!hasXmlDeclaration && !hasMxfile) {
    return {
      isValid: false,
      error: "Response doesn't contain valid DiagramXML structure",
      extractedCode
    };
  }

  if (!hasMxGraphModel) {
    return {
      isValid: false,
      error: "Response doesn't contain valid mxGraphModel structure",
      extractedCode
    };
  }

  return {
    isValid: true,
    extractedCode
  };
}

export async function validateDiagramCode(rawCode: string, type: 'mermaid' | 'diagramxml'): Promise<ValidationResult> {
  if (type === 'mermaid') {
    return validateMermaidCode(rawCode);
  } else {
    return validateDiagramXMLCode(rawCode);
  }
}

/**
 * Utility functions for downloading diagrams in various formats
 */

export interface DownloadOptions {
  filename?: string;
  format: 'svg' | 'png' | 'xml' | 'mermaid';
}

/**
 * Download diagram as SVG
 */
export function downloadAsSVG(svgElement: SVGElement, options: DownloadOptions) {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  const link = document.createElement('a');
  link.href = svgUrl;
  link.download = `${options.filename || 'diagram'}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(svgUrl);
}

/**
 * Download diagram as PNG (converts SVG to PNG)
 */
export function downloadAsPNG(svgElement: SVGElement, options: DownloadOptions) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svgData = new XMLSerializer().serializeToString(svgElement);
  
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${options.filename || 'diagram'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  };
  
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.src = url;
}

/**
 * Download diagram as XML (for DiagramXML format)
 */
export function downloadAsXML(xmlContent: string, options: DownloadOptions) {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.filename || 'diagram'}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download diagram as Mermaid code
 */
export function downloadAsMermaid(mermaidCode: string, options: DownloadOptions) {
  const blob = new Blob([mermaidCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.filename || 'diagram'}.mmd`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get the appropriate download function based on diagram type and format
 */
export function getDownloadFunction(
  diagramType: string, 
  format: 'svg' | 'png' | 'xml' | 'mermaid'
) {
  return {
    svg: downloadAsSVG,
    png: downloadAsPNG,
    xml: downloadAsXML,
    mermaid: downloadAsMermaid
  }[format];
}

/**
 * Generate filename based on diagram type and timestamp
 */
export function generateFilename(diagramType: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const typeMap: Record<string, string> = {
    flowchart: 'flowchart',
    sequence: 'sequence-diagram',
    architecture: 'architecture-diagram'
  };
  
  return `${typeMap[diagramType] || 'diagram'}-${timestamp}`;
}

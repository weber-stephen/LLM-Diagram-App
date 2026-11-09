import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "@/components/ThemeProvider";

interface DiagramRendererProps {
  code: string;
}

export function DiagramRenderer({ code }: DiagramRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [iconsRegistered, setIconsRegistered] = useState(false);

  // Register icon packs once when component mounts
  useEffect(() => {
    if (!iconsRegistered) {
      
      try {
        mermaid.registerIconPacks([
          {
            name: 'logos',
            loader: () => import('@iconify-json/logos').then((module) => module.icons),
          },
        ]);
        
        setIconsRegistered(true);
      } catch (err) {
        console.warn("DiagramRenderer: Failed to register icon packs:", err);
        // Don't prevent rendering if icon registration fails
        setIconsRegistered(true);
      }
    }
  }, [iconsRegistered]);

  useEffect(() => {
    if (!code) {
      setIsRendering(false);
      setSvgContent("");
      return;
    }
    
    // Wait for icon packs to be registered before rendering
    if (!iconsRegistered) {
      return;
    }
    
    
    setError(null);
    setIsRendering(true);
    
    // Clear any existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    
    // Create unique ID for each render to avoid conflicts
    const renderID = `mermaid-${crypto.randomUUID()}`;
    let active = true;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: theme === "dark" ? {
        background: "#1B2028", primaryColor: "#242C3A", primaryTextColor: "#E8EDF3",
        primaryBorderColor: "#91A9F7", lineColor: "#A6B0BE", secondaryColor: "#303744",
        tertiaryColor: "#1B2028", fontFamily: "Geist, sans-serif"
      } : {
        background: "#FCFDFE", primaryColor: "#EAF0FF", primaryTextColor: "#19212D",
        primaryBorderColor: "#365CCB", lineColor: "#596474", secondaryColor: "#F0F3F8",
        tertiaryColor: "#FCFDFE", fontFamily: "Geist, sans-serif"
      }
    });
    
    // Set timeout for long renders
    renderTimeoutRef.current = setTimeout(() => {
      if (!active) return;
      active = false;
      setError("Mermaid rendering timed out");
      setIsRendering(false);
    }, 5000);
    
    mermaid
      .render(renderID, code)
      .then(({ svg }) => {
        if (!active) return;
        if (renderTimeoutRef.current) {
          clearTimeout(renderTimeoutRef.current);
        }
        
        
        // Store SVG in state instead of directly manipulating DOM
        setSvgContent(svg);
        setIsRendering(false);
      })
      .catch(() => {
        if (!active) return;
        if (renderTimeoutRef.current) {
          clearTimeout(renderTimeoutRef.current);
        }
        
        setError("Mermaid could not render this diagram. You can review its source or revert to an earlier snapshot.");
        setIsRendering(false);
      });

    // Cleanup function
    return () => {
      active = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [code, iconsRegistered, theme]);

  // Separate effect to handle DOM insertion when SVG content changes
  useEffect(() => {
    if (svgContent && ref.current) {
      ref.current.innerHTML = svgContent;
    }
  }, [svgContent]);

  return (
    <div className="w-full h-full bg-card p-4 flex items-center justify-center relative">
      {/* Debug info - only show if NEXT_PUBLIC_DEBUG_MODE is set */}
      {process.env.NEXT_PUBLIC_DEBUG_MODE && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-100 dark:bg-yellow-900 p-1 rounded text-xs">
          <div className="font-semibold mb-1">🔧 DiagramRenderer Debug</div>
          <div>Code length: {code?.length || 0}</div>
          <div>Has code: {code ? 'Yes' : 'No'}</div>
          <div>Icons registered: {iconsRegistered ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          <div>Rendering: {isRendering ? 'Yes' : 'No'}</div>
          <div>SVG length: {svgContent?.length || 0}</div>
          <div>Has SVG: {svgContent ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      {error && (
        <div role="alert" className="absolute top-2 left-2 z-10 rounded bg-white p-2 text-red-600 text-center">
          <div className="font-medium mb-2">Failed to render diagram</div>
          <div className="text-sm">{error}</div>
        </div>
      )}
      {isRendering && !svgContent && <div className="text-gray-500">Rendering diagram...</div>}
      {!code && <div className="text-gray-500">No code provided to render</div>}
      <div ref={ref} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}

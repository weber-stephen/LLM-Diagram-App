"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { attachDrawioBridge, DRAWIO_ORIGIN, invokeDrawioAction } from "@/lib/drawio-bridge";

export function DiagramXMLPreview({ code }: { code: string }) {
  const { theme } = useTheme();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const error = useMemo(() => {
    if (!code) return "No diagram code provided";
    try {
      return new DOMParser().parseFromString(code, "text/xml").getElementsByTagName("parsererror").length ? "Invalid XML format" : null;
    } catch { return "Failed to parse XML"; }
  }, [code]);
  const frameKey = useMemo(() => {
    let hash = 2166136261;
    for (let index = 0; index < code.length; index++) hash = Math.imul(hash ^ code.charCodeAt(index), 16777619);
    return `${code.length}-${hash >>> 0}-${theme}`;
  }, [code, theme]);
  const url = `${DRAWIO_ORIGIN}/?embed=1&proto=json&spin=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1&ui=${theme === "dark" ? "dark" : "simple"}&dark=${theme === "dark" ? "1" : "0"}`;

  useEffect(() => {
    if (error) return;
    const frame = frameRef.current;
    if (!frame) return;
    return attachDrawioBridge(window, frame, code, () => setLoadedKey(frameKey));
  }, [code, error, frameKey]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const invokeAction = (actionName: "zoomIn" | "zoomOut" | "smartFit") => {
    if (loadedKey !== frameKey) return;
    if (frameRef.current) invokeDrawioAction(frameRef.current, actionName);
  };
  const toggleFullscreen = async () => {
    if (isFullscreen) await document.exitFullscreen();
    else await containerRef.current?.requestFullscreen();
  };

  if (error) return <Card className="w-full h-[400px] sm:h-[600px] flex items-center justify-center"><div className="text-red-600 text-center"><div className="font-medium mb-2">Failed to render diagram</div><div className="text-sm">{error}</div></div></Card>;

  return <div ref={containerRef} className={`relative w-full ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""}`}>
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 sm:hidden">
      <Button size="sm" variant="outline" aria-label="Zoom in" onClick={() => invokeAction("zoomIn")} disabled={loadedKey !== frameKey} className="h-11 w-11 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"><ZoomIn className="w-4 h-4" /></Button>
      <Button size="sm" variant="outline" aria-label="Zoom out" onClick={() => invokeAction("zoomOut")} disabled={loadedKey !== frameKey} className="h-11 w-11 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"><ZoomOut className="w-4 h-4" /></Button>
      <Button size="sm" variant="outline" aria-label="Reset zoom" onClick={() => invokeAction("smartFit")} disabled={loadedKey !== frameKey} className="h-11 w-11 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"><RotateCcw className="w-4 h-4" /></Button>
    </div>
    <div className="absolute top-2 right-2 z-10 hidden sm:flex gap-1"><Button size="sm" variant="outline" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => void toggleFullscreen()} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</Button></div>
    <Card className={`w-full ${isFullscreen ? "h-screen" : "h-[400px] sm:h-[600px]"} overflow-hidden bg-white dark:bg-gray-900 p-2 sm:p-4`}>
      <iframe key={frameKey} ref={frameRef} title="draw.io diagram preview" src={url} className="w-full h-full border-0" referrerPolicy="no-referrer" />
    </Card>
    <div className="sm:hidden absolute bottom-2 left-2 right-2 z-10"><div className="bg-black/70 text-white text-xs p-2 rounded backdrop-blur-sm text-center">Use zoom controls or pinch to zoom • Tap and drag to pan</div></div>
  </div>;
}

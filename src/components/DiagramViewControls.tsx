"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface DiagramViewControlsProps {
  children: React.ReactNode;
  className?: string;
}

export function DiagramViewControls({ children, className = "" }: DiagramViewControlsProps) {
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const togglePan = useCallback(() => {
    setIsPanning(prev => !prev);
  }, []);

  // Handle mouse events for panning (click-and-drag behavior)
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!container || !content) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!isPanning) return;
      e.preventDefault();
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning || lastPanPoint.x === 0 && lastPanPoint.y === 0) return;
      e.preventDefault();
      
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setLastPanPoint({ x: 0, y: 0 });
        container.style.cursor = 'grab';
      }
    };

    const handleMouseLeave = () => {
      if (isPanning) {
        setLastPanPoint({ x: 0, y: 0 });
        container.style.cursor = 'grab';
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      if (!isPanning) {
        e.preventDefault();
        resetView();
      }
    };

    if (isPanning) {
      container.style.cursor = 'grab';
      container.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Always add double-click listener
    container.addEventListener('dblclick', handleDoubleClick);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [isPanning, lastPanPoint, togglePan, resetView]);

  // Handle wheel zoom and keyboard shortcuts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== container && !container.contains(e.target as Node)) return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
        case ' ':
          e.preventDefault();
          togglePan();
          break;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePan, zoomIn, zoomOut, resetView]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          className="size-10 sm:size-8 p-0"
          aria-label="Zoom In" title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          className="size-10 sm:size-8 p-0"
          aria-label="Zoom Out" title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant={isPanning ? "default" : "ghost"}
          size="sm"
          onClick={togglePan}
          className="size-10 sm:size-8 p-0"
          aria-label={isPanning ? "Exit pan mode" : "Pan mode"} aria-pressed={isPanning} title={isPanning ? "Exit Pan Mode" : "Pan Mode (Click and Drag)"}
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetView}
          className="size-10 sm:size-8 p-0"
          aria-label="Reset View" title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-mono shadow-lg">
        {Math.round(scale * 100)}%
      </div>

      {/* Help tooltip */}
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="font-medium mb-1">Controls:</div>
        <div>+/-: Zoom • Space: Pan Mode • 0: Reset • Double-click: Reset</div>
        {isPanning && (
          <div className="text-blue-600 font-medium mt-1">
            Pan Mode: Click and drag to move the diagram
          </div>
        )}
      </div>

      {/* Diagram container */}
      <div
        ref={containerRef}
        className="relative w-full h-full min-h-[600px] overflow-hidden"
        style={{ cursor: isPanning ? 'grab' : 'default' }}
      >
        <div
          ref={contentRef}
          className="origin-center transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          {children}
        </div>
      </div>
    </Card>
  );
}

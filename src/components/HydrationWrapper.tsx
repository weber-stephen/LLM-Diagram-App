"use client";

import { useEffect, useState } from "react";
import { useDiagramStore } from "@/lib/diagramStore";
import mermaid from "mermaid";

interface HydrationWrapperProps {
  children: React.ReactNode;
}

export function HydrationWrapper({ children }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrate = useDiagramStore((state) => state.hydrate);

  useEffect(() => {
    console.log("HydrationWrapper: Initializing Mermaid...");
    
    // Initialize mermaid on client side
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'strict'
    });
    
    console.log("HydrationWrapper: Mermaid initialized");
    
    // Register icon packs
    mermaid.registerIconPacks([
      {
        name: 'logos',
        loader: () => import('@iconify-json/logos').then((module) => module.icons),
      },
    ]);
    
    console.log("HydrationWrapper: Icon packs registered");
    
    hydrate();
    setIsHydrated(true);
    console.log("HydrationWrapper: Hydration complete");
  }, [hydrate]);

  // Show loading state while hydrating to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-8 gap-8">
        <div className="w-full max-w-6xl mx-auto py-6 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-primary">LLM Diagram</h1>
          <p className="text-base text-muted-foreground text-center max-w-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

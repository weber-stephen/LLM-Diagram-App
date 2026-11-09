"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";
import { readSessionKey } from "@/lib/session-key";

export default function Home() {
  const router = useRouter();
  const [hasKey, setHasKey] = useState(false);
  useEffect(() => {
    setHasKey(Boolean(readSessionKey()));
  }, []);
  return <LandingPage hasKey={hasKey} onStart={() => router.push(hasKey ? "/workspace" : "/start")} />;
}

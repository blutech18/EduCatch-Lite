"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

let convex: ConvexReactClient | null = null;

function getClient(): ConvexReactClient {
  if (!convex) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    convex = new ConvexReactClient(url);
  }
  return convex;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return <>{children}</>;
  return <ConvexProvider client={getClient()}>{children}</ConvexProvider>;
}

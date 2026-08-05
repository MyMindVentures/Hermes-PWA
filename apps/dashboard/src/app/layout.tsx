import type { Metadata } from "next";
import React, { Suspense } from "react";
import { RefineContext } from "./_refine_context";
import "./globals.css";

export const metadata: Metadata = { title: "Hermes · AI Project Dashboard", description: "A project command center powered by Hermes", manifest: "/manifest.webmanifest" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Suspense fallback={<div className="min-h-screen bg-[#090d18]" />}><RefineContext>{children}</RefineContext></Suspense></body></html>; }

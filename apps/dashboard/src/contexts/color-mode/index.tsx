"use client";
import React, { createContext, type PropsWithChildren, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { RefineThemes } from "@refinedev/antd";

type ColorMode = { mode: "light" | "dark"; setMode: () => void };
export const ColorModeContext = createContext<ColorMode>({ mode: "dark", setMode: () => undefined });
export function ColorModeContextProvider({ children, defaultMode = "dark" }: PropsWithChildren<{ defaultMode?: string }>) {
  const [mode, setMode] = useState<"light" | "dark">(defaultMode === "light" ? "light" : "dark");
  useEffect(() => { const stored = Cookies.get("theme"); if (stored === "light" || stored === "dark") setMode(stored); }, []);
  const toggle = () => { const next = mode === "dark" ? "light" : "dark"; setMode(next); Cookies.set("theme", next); };
  return <ColorModeContext.Provider value={{ mode, setMode: toggle }}><ConfigProvider theme={{ ...RefineThemes.Blue, algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm }}><AntdApp>{children}</AntdApp></ConfigProvider></ColorModeContext.Provider>;
}

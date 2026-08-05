"use client";

import { useNotificationProvider } from "@refinedev/antd";
import { type AuthProvider, Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import React from "react";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { dataProvider } from "@providers/data-provider";
import "@refinedev/antd/dist/reset.css";

type RefineContextProps = { defaultMode?: string };

export const RefineContext = ({ children, defaultMode }: React.PropsWithChildren<RefineContextProps>) => {
  const authProvider: AuthProvider = {
    login: async (params) => ({ success: false, error: new Error(`Configure Supabase OAuth provider: ${String(params ?? "unknown")}`) }),
    logout: async () => ({ success: true, redirectTo: "/login" }),
    check: async () => ({ authenticated: false, redirectTo: "/login" }),
    getIdentity: async () => null,
    getPermissions: async () => null,
    onError: async (error: Error) => ({ error }),
  };
  return <ColorModeContextProvider defaultMode={defaultMode}><Refine routerProvider={routerProvider} dataProvider={dataProvider} notificationProvider={useNotificationProvider} authProvider={authProvider} resources={[{ name: "projects", list: "/projects", show: "/projects/show/:id", meta: { label: "Projects" } }, { name: "issues", list: "/issues", meta: { label: "Issues" } }, { name: "pullrequests", list: "/pullrequests", meta: { label: "Pull requests" } }, { name: "deployments", list: "/deployments", meta: { label: "Deployments" } }, { name: "settings", list: "/settings", meta: { label: "Settings" } }]} options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}>{children}</Refine></ColorModeContextProvider>;
};

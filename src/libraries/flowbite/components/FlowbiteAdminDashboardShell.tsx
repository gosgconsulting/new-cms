"use client";

import React, { ReactNode } from "react";

export type SidebarConfig = {
  width?: number; // pixels
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
  collapsible?: boolean;
  collapsedWidth?: number;
  backgroundClass?: string; // e.g., 'bg-white/80'
  blur?: boolean;
  shadowClass?: string; // e.g., 'shadow-md'
  borderSide?: "left" | "right";
  borderClass?: string; // e.g., 'border-border'
  zIndex?: number;
};

export interface FlowbiteAdminDashboardShellProps {
  minHeightScreen?: boolean;
  backgroundClass?: string; // container background (e.g., bg-background)
  sidebar?: SidebarConfig;
  header?: ReactNode;
  sidebarSlot?: ReactNode;
  children?: ReactNode; // main content
}

const FlowbiteAdminDashboardShell: React.FC<FlowbiteAdminDashboardShellProps> = ({
  minHeightScreen = true,
  backgroundClass = "bg-background",
  sidebar = {
    width: 256,
    showOnDesktop: true,
    showOnMobile: false,
    collapsible: true,
    collapsedWidth: 64,
    backgroundClass: "bg-white/80",
    blur: true,
    shadowClass: "shadow-md",
    borderSide: "right",
    borderClass: "border-border",
    zIndex: 40,
  },
  header,
  sidebarSlot,
  children,
}) => {
  const containerCls = [
    minHeightScreen ? "min-h-screen" : "",
    backgroundClass,
  ].join(" ");

  const sidebarBaseCls = [
    "top-0 h-screen fixed",
    sidebar.backgroundClass || "bg-white/80",
    sidebar.blur ? "backdrop-blur-md" : "",
    sidebar.shadowClass || "",
    "border",
    sidebar.borderClass || "border-border",
    sidebar.borderSide === "left" ? "border-l" : "border-r",
  ].join(" ");

  const sidebarStyle: React.CSSProperties = {
    width: sidebar.width ?? 256,
    zIndex: sidebar.zIndex ?? 40,
    left: sidebar.borderSide === "left" ? 0 : undefined,
    right: sidebar.borderSide === "right" ? "auto" : undefined,
  };

  const contentOffsetStyle: React.CSSProperties = {
    marginLeft: sidebar.borderSide !== "left" ? undefined : (sidebar.showOnDesktop !== false ? (sidebar.width ?? 256) : 0),
    marginRight: sidebar.borderSide === "left" ? undefined : (sidebar.showOnDesktop !== false ? (sidebar.width ?? 256) : 0),
  };

  return (
    <div className={containerCls}>
      {/* Sidebar (desktop) */}
      {sidebar.showOnDesktop !== false && (
        <div
          className={`${sidebarBaseCls} left-0`}
          style={sidebarStyle}
          aria-label="Admin sidebar"
        >
          {sidebarSlot}
        </div>
      )}

      {/* Header (optional, sits above content area offset) */}
      {header ? (
        <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm" style={contentOffsetStyle}>
          {header}
        </div>
      ) : null}

      {/* Content area */}
      <main className="relative" style={contentOffsetStyle}>
        {children}
      </main>
    </div>
  );
};

export default FlowbiteAdminDashboardShell;
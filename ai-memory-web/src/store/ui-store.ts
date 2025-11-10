"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type PanelView = "timeline" | "graph" | "insights" | "settings";

interface UIState {
  sidebarOpen: boolean;
  activePanel: PanelView;
  showUploadDialog: boolean;
  showVoiceRecorder: boolean;
  showMemoryDetails: boolean;
  lastViewedMemoryId?: string;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;
  setActivePanel: (panel: PanelView) => void;
  setUploadDialog: (value: boolean) => void;
  setVoiceRecorder: (value: boolean) => void;
  setMemoryDetails: (value: boolean, memoryId?: string) => void;
}

const defaultState: UIState = {
  sidebarOpen: true,
  activePanel: "timeline",
  showUploadDialog: false,
  showVoiceRecorder: false,
  showMemoryDetails: false,
  lastViewedMemoryId: undefined,
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      ...defaultState,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setUploadDialog: (value) => set({ showUploadDialog: value }),
      setVoiceRecorder: (value) => set({ showVoiceRecorder: value }),
      setMemoryDetails: (value, memoryId) =>
        set({
          showMemoryDetails: value,
          lastViewedMemoryId: memoryId ?? undefined,
        }),
    }),
    {
      name: "ai-memory-ui",
      version: 1,
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activePanel: state.activePanel,
      }),
    },
  ),
);

export const useActivePanel = () =>
  useUIStore((state) => state.activePanel as PanelView);

export const useDialogStates = () =>
  useUIStore((state) => ({
    showUploadDialog: state.showUploadDialog,
    showVoiceRecorder: state.showVoiceRecorder,
    showMemoryDetails: state.showMemoryDetails,
    lastViewedMemoryId: state.lastViewedMemoryId,
  }));

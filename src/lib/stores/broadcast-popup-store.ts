"use client";

import { useState, useEffect } from "react";

export interface BroadcastPopupData {
  id: string;
  type: "BIRTHDAY" | "FESTIVAL" | "ANNOUNCEMENT" | "URGENT_POLICY";
  title: string;
  message: string;
  author?: string;
  targetAudience?: string;
  badge?: string;
  celebrantAvatar?: string;
  accentEmoji?: string;
  accentColor?: string;
  linkUrl?: string;
  reactions?: { [key: string]: number };
}

interface State {
  activeBroadcast: BroadcastPopupData | null;
  isOpen: boolean;
}

let globalState: State = {
  activeBroadcast: null,
  isOpen: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const BroadcastPopupManager = {
  getState: () => globalState,

  triggerBroadcast: (data: BroadcastPopupData) => {
    globalState = {
      activeBroadcast: {
        ...data,
        reactions: data.reactions || { "🎉": 14, "❤️": 9, "👏": 7, "🚀": 11 },
      },
      isOpen: true,
    };
    notify();
  },

  closeBroadcast: () => {
    globalState = {
      ...globalState,
      isOpen: false,
    };
    notify();
  },

  reactToBroadcast: (emoji: string) => {
    if (!globalState.activeBroadcast) return;
    const reactions = { ...(globalState.activeBroadcast.reactions || {}) };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    globalState = {
      ...globalState,
      activeBroadcast: {
        ...globalState.activeBroadcast,
        reactions,
      },
    };
    notify();
  },
};

/**
 * Global trigger function callable anywhere
 */
export function triggerBroadcastPopup(data: BroadcastPopupData) {
  BroadcastPopupManager.triggerBroadcast(data);
}

/**
 * React hook to consume broadcast popup state
 */
export function useBroadcastPopup() {
  const [state, setState] = useState<State>(BroadcastPopupManager.getState());

  useEffect(() => {
    const listener = () => setState(BroadcastPopupManager.getState());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    activeBroadcast: state.activeBroadcast,
    isOpen: state.isOpen,
    triggerBroadcast: BroadcastPopupManager.triggerBroadcast,
    closeBroadcast: BroadcastPopupManager.closeBroadcast,
    reactToBroadcast: BroadcastPopupManager.reactToBroadcast,
  };
}

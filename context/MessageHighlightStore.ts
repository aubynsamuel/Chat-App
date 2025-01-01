import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface HighlightState {
  highlightedMessageId: string | null;
  highlightMessage: (messageId: string) => void;
  isMessageHighlighted: (messageId: string) => boolean;
  clearHighlight: () => void;
}

export const useHighlightStore = create<HighlightState>()(
  subscribeWithSelector((set, get) => ({
    highlightedMessageId: null,

    highlightMessage: (messageId: string) => {
      set({ highlightedMessageId: messageId });

      setTimeout(() => {
        if (get().highlightedMessageId === messageId) {
          set({ highlightedMessageId: null });
        }
      }, 5000);
    },

    isMessageHighlighted: (messageId: string) => {
      return get().highlightedMessageId === messageId;
    },

    clearHighlight: () => {
      set({ highlightedMessageId: null });
    },
  }))
);

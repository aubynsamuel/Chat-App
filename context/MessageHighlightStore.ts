import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Define the store's state interface
interface HighlightState {
  highlightedMessageId: string | null;
  highlightMessage: (messageId: string) => void;
  isMessageHighlighted: (messageId: string) => boolean;
  clearHighlight: () => void;
}

// Create the store with the subscribeWithSelector middleware
export const useHighlightStore = create<HighlightState>()(
  subscribeWithSelector((set, get) => ({
    highlightedMessageId: null,

    highlightMessage: (messageId: string) => {
      set({ highlightedMessageId: messageId });

      // Clear the highlight after 5 seconds
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

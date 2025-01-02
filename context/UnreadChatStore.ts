import { create } from "zustand";

interface UnreadChatsStore {
  unreadChats: string[];
  addToUnread: (roomId: string) => void;
  removeFromUnread: (roomId: string) => void;
}

export const useUnreadChatsStore = create<UnreadChatsStore>((set) => ({
  unreadChats: [],

  addToUnread: (roomId: string) =>
    set((state) => ({
      unreadChats: state.unreadChats?.includes(roomId)
        ? state.unreadChats
        : [...state.unreadChats, roomId],
    })),

  removeFromUnread: (roomId: string) =>
    set((state) => ({
      unreadChats: state.unreadChats.filter((id) => id !== roomId),
    })),
}));

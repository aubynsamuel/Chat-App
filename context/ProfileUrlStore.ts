/*
Temporary workaround to pass user profile picture from chat object and search users components 
due to expo router issues with passing link parameters 
*/
import { create } from "zustand";

interface StoreState {
  profileUrl: string;
  setProfileUrlLink: (url: string) => void;
}

export const useProfileURlStore = create<StoreState>((set) => ({
  profileUrl: "",

  setProfileUrlLink: (url: string) => {
    // console.log("Profile set from store");
    set({ profileUrl: url });
  },
}));

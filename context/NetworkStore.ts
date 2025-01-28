import { create } from "zustand";
import NetInfo from "@react-native-community/netinfo";

// Define TypeScript types for better type safety
type NetworkState = {
  isConnected: boolean;
  type: string | null;
  details: {
    isWifiEnabled: boolean | null | undefined;
    isInternetReachable: boolean | null | undefined;
  } | null;
  // Store actions
  initialize: () => void;
  cleanup: () => void;
  setNetworkState: (state: {
    isConnected: boolean;
    type: string;
    details: any;
  }) => void;
};

const useNetworkStore = create<NetworkState>((set) => {
  // Variable to store the unsubscribe function
  let unsubscribeNetInfo: (() => void) | null = null;

  return {
    // Initial state
    isConnected: true,
    type: null,
    details: null,

    // Initialize network monitoring
    initialize: () => {
      // Set up the network listener
      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        set({
          isConnected: state.isConnected ?? false,
          type: state.type,
          details: {
            isInternetReachable: state.isInternetReachable,
            isWifiEnabled: state.isWifiEnabled,
            // strength: state.strength,
            // cellularGeneration: state.details?.cellularGeneration,
            // carrier: state.details?.carrier,
          },
        });
      });
    },

    // Cleanup function to remove listener
    cleanup: () => {
      if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
        unsubscribeNetInfo = null;
      }
    },

    // Action to manually update network state
    setNetworkState: (networkState) => {
      set(networkState);
    },
  };
});

export default useNetworkStore;

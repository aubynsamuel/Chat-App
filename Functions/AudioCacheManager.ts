import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio_cache/`;
const AUDIO_CACHE_MAP_KEY = "audio_cache_map";

interface AudioCacheMap {
  [firebaseUrl: string]: {
    localUri: string;
    timestamp: number;
  };
}

export class AudioCacheManager {
  private static instance: AudioCacheManager;
  private cacheMap: AudioCacheMap = {};

  private constructor() {}

  static async getInstance(): Promise<AudioCacheManager> {
    if (!AudioCacheManager.instance) {
      AudioCacheManager.instance = new AudioCacheManager();
      await AudioCacheManager.instance.initializeCacheDirectory();
      await AudioCacheManager.instance.loadCacheMap();
      console.log("Audio Cache Initialized");
    }
    //  else if (AudioCacheManager.instance) {
    //   console.log("Audio Cache Already Initialized");
    // } else {
    //   console.log("Error initializing Audio Cache");
    // }
    return AudioCacheManager.instance;
  }

  private async initializeCacheDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, {
        intermediates: true,
      });
    }
  }

  private async loadCacheMap(): Promise<void> {
    try {
      const cacheMapJson = await AsyncStorage.getItem(AUDIO_CACHE_MAP_KEY);
      this.cacheMap = cacheMapJson ? JSON.parse(cacheMapJson) : {};
    } catch (error) {
      // console.error("Error loading cache map:", error);
      this.cacheMap = {};
    }
  }

  private async saveCacheMap(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        AUDIO_CACHE_MAP_KEY,
        JSON.stringify(this.cacheMap)
      );
    } catch (error) {
      console.error("Error saving cache map:", error);
    }
  }

  async getAudioUriFromStorage(firebaseUrl: string): Promise<string> {
    const cached = this.cacheMap[firebaseUrl];

    if (cached) {
      const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
      if (fileInfo.exists) {
        console.log("Audio loaded from cache: ", fileInfo.uri);
        return cached.localUri;
      }
    }
    console.log("Audio cannot be found in cache");
    return "";
  }

  async downloadAudioUrl(firebaseUrl: string): Promise<string> {
    // Download and cache if not found
    const filename = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.m4a`;
    const localUri = `${AUDIO_CACHE_DIR}${filename}`;

    try {
      await FileSystem.downloadAsync(firebaseUrl, localUri);
      this.cacheMap[firebaseUrl] = {
        localUri,
        timestamp: Date.now(),
      };
      await this.saveCacheMap();
      console.log("Audio downloaded and cached");
      return localUri;
    } catch (error) {
      console.error("Error downloading audio:", error);
      return firebaseUrl; // Fallback to original URL if download fails
    }
  }

  async updateRecordedAudioUri(
    tempUri: string,
    firebaseUrl: string
  ): Promise<void> {
    this.cacheMap[firebaseUrl] = {
      localUri: tempUri,
      timestamp: Date.now(),
    };
    await this.saveCacheMap();
    // console.log("Recorded audio updated in cache");
  }

  async cleanOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const now = Date.now();
    for (const [url, data] of Object.entries(this.cacheMap)) {
      if (now - data.timestamp > maxAge) {
        try {
          await FileSystem.deleteAsync(data.localUri);
          delete this.cacheMap[url];
        } catch (error) {
          console.error("Error cleaning cache:", error);
        }
      }
    }
    await this.saveCacheMap();
    // console.log("Old cache cleaned");
  }
}

interface AudioCacheStore {
  audioCacheManager: AudioCacheManager | null;
  getAudioCacheInstance: () => Promise<void>;
}

export const useAudioManager = create<AudioCacheStore>((set) => ({
  audioCacheManager: null,
  getAudioCacheInstance: async () => {
    set({ audioCacheManager: await AudioCacheManager.getInstance() });
  },
}));

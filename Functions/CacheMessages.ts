import storage from "./Storage";
import { IMessage } from "./types";

export const fetchCachedMessages = async (roomId: string) => {
  try {
    const cachedMessages: any = storage.getString(`messages_${roomId}`);
    const parseCacheMessages = JSON.parse(cachedMessages);
    if (parseCacheMessages) {
      // console.log("Messages fetched from cache successfully")
      return parseCacheMessages;
    }
  } catch (error) {
    // console.error("Failed to fetch cached messages", error);
  }
};

export const cacheMessages = async (roomId: string, messages: IMessage[]) => {
  try {
    if (messages.length > 0) {
      storage.set(`messages_${roomId}`, JSON.stringify(messages));
      // console.log("Messages cached successfully");
    }
  } catch (error) {
    // console.error("Failed to cache messages", error);
  }
};

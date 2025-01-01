import React, { createContext, useContext, useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Audio } from "expo-av";

// Define interfaces for type safety
interface User {
  userId: string;
  username: string;
}

interface Message {
  _id: string;
  text?: string | null;
  image?: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  type: string;
  received: boolean;
}

type OnSendFunction = (messages: Message[]) => void;

interface ChatContextType {
  setImageModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  imageModalVisibility: boolean;
  audioRecordingOverlay: boolean;
  setAudioRecordingOverlay: (value: boolean) => void;
  playbackTime: number;
  setPlaybackTime: React.Dispatch<React.SetStateAction<number>>;
  setIsRecording: (value: boolean) => void;
  isRecording: boolean;
  recordedAudioUri: string;
  setRecordedAudioUri: (value: string) => void;
  getLocationAsync: (
    handleSend: OnSendFunction,
    user: User,
    setGettingLocationOverlay: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;
  setRecording: React.Dispatch<React.SetStateAction<Audio.Recording | null>>;
  recording: Audio.Recording | null;
}

interface ChatProvider {
  children: React.ReactNode;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<ChatProvider> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecordingOverlay, setAudioRecordingOverlay] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string>("");
  const [imageModalVisibility, setImageModalVisibility] =
    useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  async function getLocationAsync(
    handleSend: OnSendFunction,
    user: User,
    setGettingLocationOverlay: React.Dispatch<React.SetStateAction<boolean>>
  ): Promise<void> {
    setGettingLocationOverlay(true);
    const response = await Location.requestForegroundPermissionsAsync();
    if (!response.granted) {
      Alert.alert(
        "Permission denied",
        "Location permission denied, You have to enable location to send location messages"
      );
      setGettingLocationOverlay(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    if (!location) {
      Alert.alert("Error", "Location is not available");
      setGettingLocationOverlay(false);
      return;
    }

    const locationMessage: Message = {
      _id: Math.random().toString(36).substring(7),
      text: `Lat:${location.coords.latitude.toFixed(
        4
      )}\nLong:${location.coords.longitude.toFixed(4)}`,
      createdAt: new Date(),
      user: {
        _id: user.userId,
        name: user.username,
      },
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      type: "location",
      received: true,
    };

    setGettingLocationOverlay(false);
    handleSend([locationMessage]);
  }

  const value = {
    isRecording,
    setIsRecording,
    setAudioRecordingOverlay,
    setPlaybackTime,
    audioRecordingOverlay,
    playbackTime,
    recordedAudioUri,
    setRecordedAudioUri,
    getLocationAsync,
    imageModalVisibility,
    setImageModalVisibility,
    recording,
    setRecording,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

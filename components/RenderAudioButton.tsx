import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { storage } from "@/imports";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Define types for user and message
interface User {
  userId: string;
  username: string;
}

interface AudioMessage {
  _id: string;
  text: string;
  audio: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
  type: string;
  delivered: boolean;
}

interface RecordingButtonProps {
  user: User;
  handleSend: (messages: AudioMessage[]) => void;
}

export default function RecordingButton({
  user,
  handleSend,
}: RecordingButtonProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [isRecordingAllowed, setIsRecordingAllowed] = useState<boolean>(false);

  const playbackTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request permissions on component mount
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setIsRecordingAllowed(status === "granted");

        // Configure audio mode once
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
      } catch (err) {
        console.error("Permission error:", err);
        Alert.alert("Permission Error", "Could not get microphone permissions");
      }
    })();

    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current);
      }
    };
  }, []);

  // Start Recording on Press and Hold
  const startRecording = async () => {
    // Prevent multiple simultaneous recording attempts
    if (recording) return;

    if (!isRecordingAllowed) {
      Alert.alert(
        "Permission Denied",
        "Microphone access is required to record audio"
      );
      return;
    }

    try {
      // Stop any ongoing playback
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Start recording with timeout
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);

      // Add a maximum recording time (e.g., 5 minutes)
      recordingTimer.current = setTimeout(async () => {
        await stopRecording();
      }, 5 * 60 * 1000);

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Recording Error", "Could not start recording");
      setRecording(null);
    }
  };

  // Stop Recording on Release
  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Clear the recording time limit timeout
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current);
      }

      console.log("Stopping recording..");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Validate recording
      if (uri) {
        setAudioUri(uri);
        console.log("Recording stopped and saved to:", uri);
      } else {
        Alert.alert("Recording Failed", "No audio was recorded");
      }

      setRecording(null);

      // Upload and send audio message
      uploadAudioFile(uri, user.username);
      sendAudioMessage(uri);
    } catch (err) {
      console.error("Error stopping recording", err);
      Alert.alert("Error", "Could not stop recording");
    }
  };

  const uploadAudioFile = async (
    audio: string | null,
    username: string
  ): Promise<string | null> => {
    let downloadURL: string | null = null;
    try {
      if (audio) {
        const response = await fetch(audio);
        const blob = await response.blob();
        const storageRef = ref(
          storage,
          `chatAudio/${username}_${Date.now()}.m4a`
        );
        await uploadBytes(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
      }
      return downloadURL;
    } catch (error) {
      console.error("Error uploading audio:", error);
      return null;
    }
  };

  const sendAudioMessage = async (audioFileUri: string | null) => {
    try {
      // Validate audio and user
      if (!audioFileUri || !user) {
        Alert.alert("Error", "No audio file found");
        return;
      }

      // Upload audio file to Firebase Storage
      const downloadURL = await uploadAudioFile(audioFileUri, user.username);

      if (!downloadURL) {
        Alert.alert("Error", "Failed to upload audio");
        return;
      }

      console.log("Audio File Uploaded", downloadURL);

      // Prepare audio message
      const newMessage: AudioMessage = {
        _id: Math.random().toString(36).substring(7),
        text: "",
        audio: downloadURL,
        createdAt: new Date(),
        user: {
          _id: user.userId,
          name: user.username,
        },
        type: "audio",
        delivered: true,
      };

      // Send message
      handleSend([newMessage]);
    } catch (error) {
      console.error("Error sending audio message:", error);
      Alert.alert("Error", "Failed to send audio message");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.recordButton, recording && styles.recordingButton]}
      onPressIn={startRecording}
      onPressOut={stopRecording}
    >
      <MaterialIcons
        style={styles.recordText}
        name={recording ? "stop" : "mic"}
        size={26}
        color={"#fff"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recordButton: {
    backgroundColor: "#FF5252",
    padding: 8,
    borderRadius: 50,
    bottom: 7,
  },
  recordingButton: {
    backgroundColor: "#FF9800",
  },
  recordText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

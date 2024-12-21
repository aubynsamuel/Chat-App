import React, { useState, useEffect, useRef, memo } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useChatContext } from "@/context/ChatContext";

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
  handleSend: (messages: AudioMessage[]) => void;
}

const RecordAudioButton: React.FC<RecordingButtonProps> = memo(() => {
  const [isRecordingAllowed, setIsRecordingAllowed] = useState<boolean>(false);
  const {
    setAudioRecordingOverlay,
    setPlaybackTime,
    isRecording,
    setIsRecording,
    setRecordedAudioUri,
    recording,
    setRecording,
  } = useChatContext();

  const playbackTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setIsRecordingAllowed(status === "granted");

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

    return () => {
      cleanupAudio();
      resetRecording();
    };
  }, []);

  const cleanupAudio = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
    }
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
    }
  };

  const startRecording = async () => {
    if (recording) return;

    if (!isRecordingAllowed) {
      Alert.alert(
        "Permission Denied",
        "Microphone access is required to record audio"
      );
      return;
    }

    try {
      await cleanupAudio();
      setRecordedAudioUri("");

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setPlaybackTime(0);
      setRecording(newRecording);
      setIsRecording(true);
      setAudioRecordingOverlay(true);

      playbackTimer.current = setInterval(() => {
        setPlaybackTime((time) => time + 1);
      }, 1000);

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

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (recordingTimer.current) {
        clearTimeout(recordingTimer.current);
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }

      console.log("Stopping recording..");
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      if (uri) {
        setRecordedAudioUri(uri);
        console.log("Recording stopped and saved to:", uri);
      } else {
        Alert.alert("Recording Failed", "No audio was recorded");
      }

      setRecording(null);
    } catch (err) {
      console.error("Error stopping recording", err);
      resetRecording();
      cleanupAudio();
      // Alert.alert("Error", "Could not stop recording");
    }
  };

  const resetRecording = () => {
    setRecordedAudioUri("");
    setAudioRecordingOverlay(false);
    setPlaybackTime(0);
    setIsRecording(false);
  };

  return (
    <TouchableOpacity
      style={[styles.recordButton, recording && styles.recordingButton]}
      onPressIn={startRecording}
      onPressOut={stopRecording}
    >
      {!isRecording ? (
        <MaterialIcons
          style={styles.recordIcon}
          name={recording ? "stop" : "mic"}
          size={26}
          color={"#fff"}
        />
      ) : (
        <LottieView
          source={require("../myAssets/Lottie_Files/Waves.json")}
          autoPlay
          loop={true}
          style={{ width: 28, height: 28 }}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  recordButton: {
    backgroundColor: "#FF5252",
    padding: 8,
    borderRadius: 50,
    bottom: 3,
  },
  recordingButton: {
    backgroundColor: "#FF9800",
  },
  recordIcon: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RecordAudioButton;

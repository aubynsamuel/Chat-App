import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Audio, ResizeMode } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { Theme } from "../context/ThemeContext";

const AudioPlayerComponent = ({
  currentAudio,
  selectedTheme,
  profileUrl,
}: {
  currentAudio: any;
  selectedTheme: Theme;
  profileUrl: string;
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    duration: 0,
    position: 0,
  });
  const [isFinished, setIsFinished] = useState(false);

  // Remove the playbackTimer as we'll rely solely on the native status updates
  useEffect(() => {
    return () => {
      // Cleanup sound when component unmounts
      if (sound) {
        console.log("Cleaning up audio resources...");
        sound.unloadAsync();
      }
    };
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const playAudio = async () => {
    try {
      console.log("PlayAudio called. Current state:", { isPlaying, isFinished });

      if (!currentAudio) {
        console.warn("No audio URL provided");
        return;
      }

      if (isPlaying && sound) {
        console.log("Pausing audio...");
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (!isFinished && sound) {
        console.log("Resuming audio...");
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      console.log("Creating new sound instance...");
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentAudio },
        { shouldPlay: true },
        // Add progress update callback directly in the creation options
        (status) => {
          if (status.isLoaded) {
            // Update position and duration
            setPlaybackStatus({
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
            });

            if (status.didJustFinish) {
              console.log("Audio playback finished");
              setIsPlaying(false);
              setIsFinished(true);
              setPlaybackStatus({
                duration: status.durationMillis || 0,
                position: 0,  // Set to 0 duration when finished
              });
            }
          }
        }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <View style={styles.audioContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: profileUrl }}
          resizeMode="cover"
          style={{ height: 40, width: 40, borderRadius: 100 }}
        />
        <MaterialIcons
          name={isPlaying ? "pause" : "play-arrow"}
          size={35}
          onPress={playAudio}
          color={selectedTheme.text.primary}
        />
      </View>
      <View style={styles.audioTextContainer}>
        <Text
          style={[styles.audioTimeText, { color: selectedTheme.text.primary }]}
        >
          {formatTime(playbackStatus.position)} /{" "}
          {formatTime(playbackStatus.duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 2,
    gap: 15,
  },
  audioTextContainer: {
    marginHorizontal: 5,
  },
  audioTimeText: {
    fontSize: 12,
  },
});

export default AudioPlayerComponent;
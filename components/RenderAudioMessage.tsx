import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";

// Audio Player Component for Messages
const AudioPlayerComponent = ({ 
  currentMessage, 
  selectedTheme 
}: { 
  currentMessage: any, 
  selectedTheme: any 
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    duration: 0,
    position: 0,
  });

  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    };
  }, [sound]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const playAudio = async () => {
    try {
      // If no audio URL, return
      if (!currentMessage.audio) {
        Alert.alert("No Audio", "Audio message is not available");
        return;
      }

      // If already playing, pause
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
        }
        return;
      }

      // If sound exists, resume
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        startPlaybackTimer();
        return;
      }

      // Create and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentMessage.audio },
        { shouldPlay: true }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackStatus({ 
              duration: status.durationMillis || 0, 
              position: 0 
            });
            if (playbackTimer.current) {
              clearInterval(playbackTimer.current);
            }
          }
        }
      });

      setSound(newSound);
      setIsPlaying(true);
      startPlaybackTimer();
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Playback Error", "Could not play the audio message");
    }
  };

  const startPlaybackTimer = () => {
    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
    }

    playbackTimer.current = setInterval(async () => {
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setPlaybackStatus({
              duration: status.durationMillis || 0,
              position: status.positionMillis || 0,
            });
          }
        } catch (error) {
          console.error("Error updating playback status:", error);
        }
      }
    }, 500);
  };

  return (
    <View style={styles.audioContainer}>
      <MaterialIcons
        name={isPlaying ? "pause" : "play-arrow"}
        size={24}
        onPress={playAudio}
        color={selectedTheme.text.primary}
      />
      <View style={styles.audioTextContainer}>
        <Text style={[styles.audioTimeText, { color: selectedTheme.text.primary }]}>
          {formatTime(playbackStatus.position)} / {formatTime(playbackStatus.duration)}
        </Text>
      </View>
    </View>
  );
};

// Styles for Audio Player
const styles = StyleSheet.create({
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
    width: 110
},
audioTextContainer: {
    marginLeft: 10,
    
},
audioTimeText: {
    fontSize: 12,
  },
});

export default AudioPlayerComponent;
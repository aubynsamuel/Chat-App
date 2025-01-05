import React, { useState, useEffect, memo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { Theme } from "../context/ThemeContext";
import { IMessage } from "@/Functions/types";
import { MessageAudioProps } from "react-native-gifted-chat";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { UserData } from "@/context/AuthContext";
import { darkTheme } from "@/imports";
import { AudioCacheManager } from "../Functions/AudioCacheManager";

interface AudioPlayerComponentProps {
  selectedTheme: Theme;
  profileUrl?: string;
  playBackDuration?: string | null;
  props: MessageAudioProps<IMessage>;
  setReplyToMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (message: IMessage) => Promise<void>;
  user: UserData | null;
}

const AudioPlayerComponent = memo(
  ({
    selectedTheme,
    profileUrl,
    playBackDuration,
    props,
    setReplyToMessage,
    setIsReplying,
    handleDelete,
    user,
  }: AudioPlayerComponentProps) => {
    const currentAudio = props.currentMessage.audio;
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState({
      duration: 0,
      position: 0,
    });
    const [isFinished, setIsFinished] = useState(false);
    const [localAudioUri, setLocalAudioUri] = useState<
      string | null | undefined
    >(null);
    const { showActionSheetWithOptions } = useActionSheet();

    useEffect(() => {
      loadAudioFromCache();
      return () => {
        if (sound) {
          console.log("Cleaning up audio resources...");
          sound.unloadAsync();
        }
      };
    }, [currentAudio]);

    const loadAudioFromCache = async () => {
      if (!currentAudio) return;

      try {
        // If this is a local recording (temporary URI), use it directly
        if (currentAudio.startsWith("file://")) {
          setLocalAudioUri(currentAudio);
          return;
        }

        const cacheManager = await AudioCacheManager.getInstance();
        const audioUri = await cacheManager.getAudioUri(currentAudio);
        setLocalAudioUri(audioUri);
      } catch (error) {
        console.error("Error loading audio from cache:", error);
        // Fallback to original URL if cache fails
        setLocalAudioUri(currentAudio);
      }
    };

    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const playAudio = async () => {
      try {
        if (!localAudioUri) {
          console.warn("No audio URI available");
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
          { uri: localAudioUri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
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
                  position: 0,
                });
              }
            }
          }
        );

        setSound(newSound);
        setIsPlaying(true);
        setIsFinished(false);
      } catch (error) {
        Alert.alert("Error playing audio", "Audio has not been downloading");
        console.error("Error playing audio:", error);
        // If cached file fails, try original URL
        if (localAudioUri !== currentAudio) {
          setLocalAudioUri(currentAudio);
          console.log("Falling back to original URL...");
        }
      }
    };

    const handleMessagePress = (currentMessage: IMessage) => {
      const options = ["Reply"];

      if (currentMessage.user._id === user?.userId) {
        options.push("Delete Audio");
      }
      options.push("Cancel");
      const cancelButtonIndex = options.length - 1;

      const title = `Audio: 🔉 ${props.currentMessage.duration}`;
      const textStyle: TextStyle = {
        textAlign: "center",
        alignSelf: "center",
        width: "100%",
        fontWeight: "500",
        color: selectedTheme.text.primary,
      };
      const destructiveColor = "red";
      const destructiveButtonIndex = options.includes("Delete Audio")
        ? options.indexOf("Delete Audio")
        : options.indexOf("Cancel");
      const titleTextStyle: TextStyle = {
        fontWeight: "400",
        textAlign: "center",
        color: selectedTheme.text.primary,
      };
      const containerStyle: ViewStyle = {
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: selectedTheme.background,
      };
      const showSeparators = true;
      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title,
          titleTextStyle,
          containerStyle,
          textStyle,
          destructiveColor,
          destructiveButtonIndex,
          showSeparators,
        },
        (buttonIndex: number | undefined) => {
          switch (buttonIndex) {
            case 0: {
              setReplyToMessage(currentMessage);
              setIsReplying(true);
              break;
            }
            case 1:
              if (currentMessage.user._id === user?.userId)
                handleDelete(currentMessage);
              break;
            default:
              break;
          }
        }
      );
    };

    return (
      <TouchableOpacity
        style={styles.audioContainer}
        onLongPress={() => handleMessagePress(props.currentMessage)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: profileUrl }}
            resizeMode="cover"
            style={{ height: 40, width: 40, borderRadius: 100 }}
          />
          <TouchableOpacity onPress={playAudio}>
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={35}
              color={
                selectedTheme === darkTheme
                  ? "black"
                  : selectedTheme.text.primary
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.audioTextContainer}>
          <Text
            style={[
              styles.audioTimeText,
              {
                color:
                  selectedTheme === darkTheme
                    ? "black"
                    : selectedTheme.text.primary,
              },
            ]}
          >
            {formatTime(playbackStatus.position)} /{" "}
            {playBackDuration || formatTime(playbackStatus.duration)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

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

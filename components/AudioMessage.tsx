import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { Theme } from "../context/ThemeContext";
import { IMessage } from "@/Functions/types";
import { MessageAudioProps } from "react-native-gifted-chat";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { UserData } from "@/context/AuthContext";

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
    const { showActionSheetWithOptions } = useActionSheet();

    useEffect(() => {
      return () => {
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
        console.log("PlayAudio called. Current state:", {
          isPlaying,
          isFinished,
        });

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
                  position: 0, // Set to 0 duration when finished
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
      };
      const destructiveColor = "red";
      const destructiveButtonIndex = 1;
      const titleTextStyle: TextStyle = {
        fontWeight: "400",
        textAlign: "center",
        color: "#000",
      };
      const containerStyle: ViewStyle = {
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={35}
            onPress={playAudio}
            color={selectedTheme.text.primary}
          />
        </View>
        <View style={styles.audioTextContainer}>
          <Text
            style={[
              styles.audioTimeText,
              { color: selectedTheme.text.primary },
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

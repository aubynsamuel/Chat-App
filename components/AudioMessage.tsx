import React, { useState, useEffect, memo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
  Alert,
  ActivityIndicator,
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
import { useAudioManager } from "../Functions/AudioCacheManager";
import { activeTouchableOpacity } from "@/Functions/Constants";

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
    const { audioCacheManager } = useAudioManager();
    const [downloading, setDownloading] = useState(false);

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
      if (!currentAudio) {
        Alert.alert("Error", "Audio unavailable");
        return;
      }

      // If this is a local recording (temporary URI), use it directly
      if (currentAudio.startsWith("file://")) {
        setLocalAudioUri(currentAudio);
        return;
      }

      const audioUri = await audioCacheManager?.getAudioUriFromStorage(
        currentAudio
      );
      if ((audioUri?.length as any) > 0) {
        setLocalAudioUri(audioUri);
        // console.log("Audio Loaded For Message Component: ", audioUri);
      } else {
        setLocalAudioUri(null);
        // console.log("Loading audio for message component failed");
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
          console.log(
            "No audio URI available locally, downloading from firebase"
          );
          setDownloading(true);
          const audioUri = await audioCacheManager?.downloadAudioUrl(
            currentAudio as any
          );
          if ((audioUri?.length as any) > 0) {
            setLocalAudioUri(audioUri);
            setDownloading(false);
            // console.log("Audio Downloaded For Message Component: ", audioUri);
          } else {
            setLocalAudioUri(null);
            setDownloading(false);
            Alert.alert(
              "Error downloading audio",
              "Please check your internet connection"
            );
          }
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
          { uri: localAudioUri as any },
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
        console.error("Error playing audio:", error);
        Alert.alert(
          "Error playing audio",
          "Audio could not be played, Please try again"
        );
        // if (localAudioUri !== currentAudio) {
        //   setLocalAudioUri(currentAudio);
        //   console.log("Falling back to original URL...");
        // }
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
        activeOpacity={activeTouchableOpacity}
        style={styles.audioContainer}
        onLongPress={() => handleMessagePress(props.currentMessage)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2.5 }}>
          <Image
            source={{ uri: profileUrl }}
            resizeMode="cover"
            style={{ height: 40, width: 40, borderRadius: 100 }}
          />
          <TouchableOpacity
            activeOpacity={activeTouchableOpacity}
            onPress={playAudio}
          >
            {downloading ? (
              <ActivityIndicator
                size="small"
                color={
                  selectedTheme === darkTheme &&
                  props.currentMessage.user.name === user?.username
                    ? "black"
                    : selectedTheme.text.primary
                }
              />
            ) : (
              <MaterialIcons
                name={
                  localAudioUri
                    ? isPlaying
                      ? "pause"
                      : "play-arrow"
                    : "downloading"
                }
                size={localAudioUri ? 30 : 25}
                color={
                  selectedTheme === darkTheme &&
                  props.currentMessage.user.name === user?.username
                    ? "black"
                    : selectedTheme.text.primary
                }
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.audioTextContainer}>
          <Text
            style={[
              styles.audioTimeText,
              {
                color:
                  selectedTheme === darkTheme &&
                  props.currentMessage.user.name === user?.username
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
    gap: 10,
  },
  audioTextContainer: {
    marginHorizontal: 5,
  },
  audioTimeText: {
    fontSize: 12,
  },
});

export default AudioPlayerComponent;

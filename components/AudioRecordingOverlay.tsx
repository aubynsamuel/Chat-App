import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import React, { memo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import ScreenOverlay from "./ScreenOverlay";
import { formatTime } from "../imports";
import { activeTouchableOpacity } from "@/Functions/Constants";

interface AudioRecordingOverlayProps {
  isRecording: boolean;
  playbackTime: number;
  resetRecording: () => void;
  sendAudioMessage: () => Promise<void>;
}
const AudioRecordingOverlay: React.FC<AudioRecordingOverlayProps> = memo(
  ({ isRecording, playbackTime, resetRecording, sendAudioMessage }) => {
    return (
      <ScreenOverlay
        containerStyles={{ bottom: 54, height: null, paddingBottom: 50 }}
        showIndicator={false}
        children={
          <View style={{ alignItems: "center" }}>
            {/* Recording State and timer */}
            <LottieView
              source={require("../myAssets/Lottie_Files/Recording.json")}
              autoPlay
              loop={true}
              style={{ width: 80, height: 80 }}
            />
            <Text style={styles.recordingText as TextStyle}>
              {isRecording ? "Recording..." : "Recording Complete"}
            </Text>
            <Text style={styles.timeText as TextStyle}>
              {formatTime(playbackTime)}
            </Text>

            {/* Recording Controls */}
            {!isRecording && (
              <View style={styles.controlsContainer as ViewStyle}>
                <TouchableOpacity
                  activeOpacity={activeTouchableOpacity}
                  style={[
                    styles.controlButton as any,
                    styles.discardButton as any,
                  ]}
                  onPress={resetRecording}
                >
                  <MaterialIcons name="delete" size={24} color="white" />
                  <Text style={styles.buttonText as TextStyle}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={activeTouchableOpacity}
                  style={[
                    styles.controlButton as any,
                    styles.sendButton as any,
                  ]}
                  onPress={() => {
                    sendAudioMessage();
                    resetRecording();
                  }}
                >
                  <MaterialIcons name="send" size={24} color="white" />
                  <Text style={styles.buttonText as TextStyle}>Send</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />
    );
  }
);

export default AudioRecordingOverlay;

const styles = StyleSheet.create({
  titleText: {
    zIndex: 1,
    fontSize: 18,
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
  recordingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 5,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 20,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 25,
    gap: 8,
  },
  discardButton: {
    backgroundColor: "#FF5252",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

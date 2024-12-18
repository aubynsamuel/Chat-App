import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { InputToolbar } from "react-native-gifted-chat";
import Animated, { FadeInRight } from "react-native-reanimated";
import RenderAudioButton from "./RenderAudioButton";

interface InputToolBarProps {
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
  selectedTheme: any;
  showActions: boolean;
  isEditing: boolean;
  props: any;
  handleSend: (messages: any[]) => void;
  user: any;
}

const InputToolBar = ({
  isReplying,
  setIsReplying,
  selectedTheme,
  showActions,
  isEditing,
  props,
  handleSend,
  user,
}: InputToolBarProps) => {
  return (
    <View>
      {/* Reply to message UI */}
      {isReplying && (
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            backgroundColor: selectedTheme.primary,
            alignItems: "center",
            paddingHorizontal: 15,
            paddingTop: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity style={{ alignSelf: "center" }}>
              <MaterialIcons name="reply" size={28} color="black" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 35,
                alignSelf: "flex-start",
                bottom: 5,
              }}
            >
              |
            </Text>
            <View style={{ height: 50, gap: 3 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                Replying To Name
              </Text>
              <Text>Replying Message</Text>
            </View>
          </View>

          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={() => setIsReplying(false)}
          >
            <MaterialIcons
              name="close"
              size={24}
              color="black"
              style={{
                marginRight: 5,
              }}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Input toolbar and microphone */}
      <View
        style={{
          backgroundColor: isReplying ? selectedTheme.primary : null,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        <InputToolbar
          {...props}
          containerStyle={{
            width: isEditing || isReplying || !showActions ? "96%" : "85%",
            alignSelf: "flex-start",
            borderRadius: 30,
            marginBottom: 8,
            marginTop: 0,
          }}
        />
        {!isEditing && !isReplying && showActions && (
          <Animated.View
            entering={FadeInRight.duration(150)}
            style={{ alignSelf: "flex-end" }}
          >
            <RenderAudioButton user={user} handleSend={handleSend} />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default InputToolBar;

const styles = StyleSheet.create({});

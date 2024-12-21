import { StyleSheet, Text, View } from "react-native";
import React, { memo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { InputToolbar } from "react-native-gifted-chat";
import RenderAudioButton from "./RecordAudioButton";
import { IMessage } from "@/Functions/types";

interface InputToolBarProps {
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
  selectedTheme: any;
  showActions: boolean;
  isEditing: boolean;
  props: any;
  handleSend : (newMessages?: IMessage[]) => Promise<void>
}

const InputToolBar = memo(
  ({
    isReplying,
    setIsReplying,
    selectedTheme,
    showActions,
    isEditing,
    props,
    handleSend,
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
              width: isEditing || isReplying || !showActions ? "97%" : "85%",
              alignSelf: "flex-start",
              borderRadius: 30,
              marginBottom: 8,
              marginTop: 0,
            }}
          />
          {!isEditing && !isReplying && showActions && (
            <RenderAudioButton
              handleSend={handleSend}
            />
          )}
        </View>
      </View>
    );
  }
);

export default InputToolBar;

const styles = StyleSheet.create({});

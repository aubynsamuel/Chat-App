import { View } from "react-native";
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import { ExternalPathString, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth, useTheme, Send } from "../imports";
import purpleTheme from "@/Themes/Purple";

const Index = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { selectedTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/home" as ExternalPathString);
      } else {
        router.replace("/login" as ExternalPathString);
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: selectedTheme.background,
        }}
      >
        <StatusBar
          style={`${
            selectedTheme === purpleTheme
              ? "light"
              : selectedTheme.Statusbar.style
          }` as any}
          backgroundColor={selectedTheme.background}
          animated={true}
        />

        <LottieView
          source={Send}
          autoPlay
          loop={false}
          style={{
            flex: 0.8,
            width: 90 * 7,
            height: 90 * 7,
            alignSelf: "center",
          }}
        />
      </View>
    );
  }

  return null;
};

export default Index;

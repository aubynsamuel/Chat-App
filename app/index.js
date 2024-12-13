import { View } from "react-native";
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { useAuth, useTheme, Send } from "../imports";

const Index = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { selectedTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
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
        <LottieView
          source={Send}
          autoPlay
          loop={false}
          style={{
            flex: 0.8,
            width: 90 * 5,
            height: 90 * 5,
            alignSelf: "center",
          }}
        />
      </View>
    );
  }

  return null;
};

export default Index;

import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LottieView from "lottie-react-native";
import { Redirect, router } from "expo-router";

const Index = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { selectedTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) { // Only redirect when loading is finished
      if (isAuthenticated) {
        router.replace("/home"); // Redirect to home if authenticated
      } else {
        router.replace("/login"); // Redirect to login if not authenticated
      }
    }
  }, [isLoading, isAuthenticated]); // Add dependencies

  if (isLoading) {
    return ( // Loading indicator remains the same
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: selectedTheme.background,
        }}
      >
        <LottieView
          source={require("../myAssets/Lottie_Files/send.json")}
          autoPlay
          loop={false}
          style={{
            flex: 0.8,
            width: 90 * 6.5,
            height: 90 * 6.5,
            alignSelf: "center",
          }}
        />
      </View>
    );
  }

  // Return null while loading is in progress, preventing any premature rendering of other components
  return null;
};

export default Index;


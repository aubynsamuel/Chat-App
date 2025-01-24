import { View } from "react-native";
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth, useTheme, Send } from "../imports";
import { useNavigation } from "@react-navigation/native";

const Index = () => {
  const navigation = useNavigation();
  const { isLoading, isAuthenticated } = useAuth();
  const { selectedTheme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: "(main)" as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "(auth)" as never }],
        });
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
          style={selectedTheme.Statusbar.style as any}
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

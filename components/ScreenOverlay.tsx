import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React from "react";

interface LoadingIndicatorProps {
  title?: string;
  children?: React.ReactNode;
  showIndicator?: boolean;
  containerStyles?: ViewStyle;
}

const ScreenOverlay = ({
  title = "",
  children = null,
  showIndicator = true,
  containerStyles,
}: LoadingIndicatorProps) => {
  return (
    <View style={[styles.loadingSpinnerContainer, containerStyles]}>
      {showIndicator && (
        <ActivityIndicator
          size={"large"}
          color={"white"}
          style={{ zIndex: 1 }}
        />
      )}
      <Text style={styles.titleText}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingSpinnerContainer: {
    position: "absolute",
    zIndex: 10,
    justifyContent: "center",
    alignSelf: "center",
    top: 65,
    bottom: 0,
    paddingBottom: 190,
    width: "100%",
    height: "100%",
    backgroundColor: "#0005",
  },
  titleText: {
    zIndex: 1,
    fontSize: 18,
    textAlign: "center",
    color: "white",
    fontWeight: "600",
  },
});

export default ScreenOverlay;

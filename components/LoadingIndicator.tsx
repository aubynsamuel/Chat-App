import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React from "react";

const LoadingIndicator = ({
  title = "",
  children = null,
  showIndicator = true,
  containerStyles,
}: {
  title?: string;
  children?: React.ReactNode;
  showIndicator: boolean;
  containerStyles?: ViewStyle;
}) => {
  return (
    <View style={[styles.loadingSpinnerContainer, containerStyles]}>
      {showIndicator && (
        <ActivityIndicator
          size={"large"}
          color={"white"}
          style={{ zIndex: 1 }}
        />
      )}
      <Text
        style={{
          zIndex: 1,
          fontSize: 18,
          textAlign: "center",
          color: "white",
          fontWeight: "semibold",
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};

export default LoadingIndicator;

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
});

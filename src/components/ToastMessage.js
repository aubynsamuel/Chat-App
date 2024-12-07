import React, { useState, useEffect, useRef, memo } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from "react-native";

const Toast = memo(({ message, duration, pressToDismiss = true, style }) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      show();
    }
  }, [message]);

  const show = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      hideAfterDelay();
    });
  };

  const hideAfterDelay = () => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }, duration);
  };

  const dismissToast = () => {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={pressToDismiss && dismissToast}>
      <Animated.View
        style={[
          styles.toastContainer,
          { opacity: fadeAnim },
          style, // Custom styles
        ]}
      >
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: "15%",
    right: "15%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Toast;

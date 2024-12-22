import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useTheme, useAuth, getStyles, storage, SignUp } from "../../imports";

const SignUpScreen = () => {
  const email = useRef("");
  const password = useRef("");
  const { signUp, showToast } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedTheme } = useTheme();
  const [passwordReveal, setPasswordReveal] = useState(true);
  const [color, setColor] = useState(
    selectedTheme === darkTheme ? "white" : "black"
  );

  const styles = getStyles(selectedTheme);

  // Email regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password regex created to ensure password strength (at least 8 characters, including a number and a special character)
  const passwordStrengthRegex = /^(?=.*[0-9])(?=.*[!@#$_%^&*])(?=.{8,})/;

  const handleSignUpPressed = async () => {
    setIsLoading(true);
    if (!email.current || !password.current) {
      showToast("Please fill all the required fields.");
      setIsLoading(false);
      return;
    }

    // Email format validation
    if (!emailRegex.test(email.current)) {
      showToast("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Password strength validation
    if (!passwordStrengthRegex.test(password.current)) {
      Alert.alert(
        "Sign Up",
        "Password must be at least 8 characters long and include a number and a special character."
      );
      setIsLoading(false);
      return;
    }

    try {
      let response = await signUp(
        email.current,
        password.current,
      );

      if (response.success) {
        router.replace("/setUserDetails");
      } else {
        showToast(response.msg || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showToast("An error occurred during sign up. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 24,
        backgroundColor:
          selectedTheme === darkTheme ? selectedTheme.background : null,
      }}
    >
      <StatusBar style={`${selectedTheme.Statusbar.style}`} animated={true} />

      <LottieView
        source={SignUp}
        autoPlay
        loop={true}
        style={{ flex: 0.8, left: 10 }}
      />

      <Text style={styles.suSignUpFormHeader}>Sign Up</Text>

      {/* Input Fields */}
      <View style={styles.suForm}>
        {/* Email field */}
        <View style={styles.suInputField}>
          <MaterialIcons name="email" color={styles.IconColor} size={25} />
          <TextInput
            placeholder="Email*"
            style={styles.suInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (email.current = value)}
          />
        </View>

        {/* Password */}
        <View style={styles.suInputField}>
          <MaterialIcons name="lock" color={styles.IconColor} size={25} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              flex: 1,
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="Password*"
              secureTextEntry={passwordReveal}
              style={styles.suInputText}
              placeholderTextColor={"grey"}
              onChangeText={(value) => (password.current = value)}
            />
            <TouchableOpacity
              onPress={() => {
                setPasswordReveal((prev) => !prev);
                setColor(passwordReveal ? "grey" : styles.IconColor);
              }}
            >
              <MaterialIcons name="remove-red-eye" color={color} size={25} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.suSignUpButton}
          onPress={handleSignUpPressed}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.suSignUpText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View
          style={{ flexDirection: "row", alignSelf: "center", marginTop: 5 }}
        >
          <Text style={styles.suHaveAnAccount}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.suLoginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

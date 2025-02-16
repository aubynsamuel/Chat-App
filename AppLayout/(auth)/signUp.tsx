import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme, useAuth, getStyles, SignUp, darkTheme } from "../../imports";
import { useNavigation } from "@react-navigation/native";
import { activeTouchableOpacity } from "@/Functions/Constants";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const email = useRef("");
  const password = useRef("");
  const { signUp, showToast } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedTheme } = useTheme();
  const [passwordReveal, setPasswordReveal] = useState(true);

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
      let response = await signUp(email.current, password.current);

      if (response.success) {
        navigation.navigate("setUserDetails" as never);
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
      style={
        {
          flex: 1,
          paddingTop: 24,
          backgroundColor:
            selectedTheme === darkTheme ? selectedTheme.background : null,
        } as any
      }
    >
      <StatusBar
        style={`${selectedTheme.Statusbar.style}` as any}
        animated={true}
      />

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
          <MaterialIcons
            name="email"
            size={25}
            color={selectedTheme.text.primary}
          />
          <TextInput
            placeholder="Email*"
            style={styles.suInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (email.current = value)}
          />
        </View>

        {/* Password */}
        <View style={styles.suInputField}>
          <MaterialIcons
            name="lock"
            size={25}
            color={selectedTheme.text.primary}
          />
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
              activeOpacity={activeTouchableOpacity}
              onPress={() => {
                setPasswordReveal((prev) => !prev);
              }}
            >
              {passwordReveal ? (
                <MaterialIcons
                  name="remove-red-eye"
                  color={selectedTheme === darkTheme ? "white" : "black"}
                  size={25}
                />
              ) : (
                <Feather
                  name="eye-off"
                  color={selectedTheme === darkTheme ? "white" : "black"}
                  size={22}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={activeTouchableOpacity}
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
          <TouchableOpacity
            activeOpacity={activeTouchableOpacity}
            onPress={() => navigation.navigate("login" as never)}
          >
            <Text style={styles.suLoginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

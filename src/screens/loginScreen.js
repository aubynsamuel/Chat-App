import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import { useTheme } from "../ThemeContext";
import { StatusBar } from "expo-status-bar";


const LoginScreen = () => {
  const { login, resetPassword, showToast } = useAuth();
  const email = useRef("");
  const password = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState(true);
  const { selectedTheme } = useTheme();
  const [color, setColor] = useState(
    selectedTheme === darkTheme ? "white" : "black"
  );
  const styles = getStyles(selectedTheme);

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email.current) {
      showToast("Please enter your email address");
      return;
    }

    const response = await resetPassword(email.current);
    if (response.success) {
      showToast("Reset link has been sent to your email");
    } else {
      showToast(response.msg);
      console.log(response);
    }
  };

  const handleLoginPressed = async () => {
    setIsLoading(true);
    if (!email.current || !password.current) {
      showToast("Please enter your email and password");
      setIsLoading(false);
      return;
    }
    const response = await login(email.current, password.current);
    if (!response.success) {
      showToast(response.msg);
      console.log(response);
      setIsLoading(false);
      return;
    }
    navigation.replace("Home");
    setIsLoading(false);
  };

  const navigation = useNavigation();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 24,
        backgroundColor:
          selectedTheme === darkTheme ? selectedTheme.background : null,
      }}
    >
      <StatusBar
        style={`${selectedTheme.Statusbar.style}`}
        animated={true}
      />
      <LottieView
        source={require("../../myAssets/Lottie_Files/Online Chat.json")}
        autoPlay
        loop={true}
        style={{
          flex: 0.8,
          width: 90 * 6.5,
          height: 90 * 6.5,
          alignSelf: "center",
        }}
      />
      {/* background image */}

      <Text style={styles.lsLoginHeaderText}>Login</Text>

      {/* Input Fields */}
      <View style={styles.lsForm}>
        {/* Email */}
        <View style={styles.lsInputField}>
          <MaterialIcons name="email" color={styles.IconColor} size={25} />
          <TextInput
            placeholder="Email"
            style={styles.lsInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (email.current = value)}
          />
        </View>

        {/* Password */}
        <View style={styles.lsInputField}>
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
              placeholder="Password"
              secureTextEntry={passwordReveal}
              style={styles.lsInputText}
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

        {/* forgot password */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.lsForgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.lsLoginButton}
          onPress={() => {
            handleLoginPressed();
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.lsLoginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View
          style={{ flexDirection: "row", alignSelf: "center", marginTop: 5 }}
        >
          <Text style={styles.lsDontHaveAnAccount}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace("Sign Up")}>
            <Text style={styles.lsSignUp}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

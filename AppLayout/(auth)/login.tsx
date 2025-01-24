import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  useTheme,
  useAuth,
  getStyles,
  OnlineChat,
  darkTheme,
} from "../../imports";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, resetPassword, showToast } = useAuth();
  const email = useRef("");
  const password = useRef("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState(true);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  const handleForgotPassword = async () => {
    if (!email.current) {
      showToast("Please enter your email address");
      return;
    }

    const response = await resetPassword(email.current);
    if (response.success) {
      showToast("Reset link has been sent to your email");
    } else {
      showToast(response.msg as string);
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
      showToast(response.msg as string);
      console.log(response);
      setIsLoading(false);
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "(main)" as never }],
    });
    setIsLoading(false);
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
      <StatusBar style={selectedTheme.Statusbar.style as any} animated={true} />
      <LottieView
        source={OnlineChat}
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
          <MaterialIcons
            name="email"
            size={25}
            color={selectedTheme.text.primary}
          />
          <TextInput
            placeholder="Email"
            style={styles.lsInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (email.current = value)}
          />
        </View>

        {/* Password */}
        <View style={styles.lsInputField}>
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
              placeholder="Password"
              secureTextEntry={passwordReveal}
              style={styles.lsInputText}
              placeholderTextColor={"grey"}
              onChangeText={(value) => (password.current = value)}
            />
            <TouchableOpacity
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
          <TouchableOpacity
            onPress={() => navigation.navigate("signUp" as never)}
          >
            <Text style={styles.lsSignUp}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

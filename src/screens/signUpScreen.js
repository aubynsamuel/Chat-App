import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
import { useAuth } from "../AuthContext";
import LottieView from "lottie-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { storage } from "../../env/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import { useTheme } from "../ThemeContext";
import { StatusBar } from "expo-status-bar";


const SignUpScreen = () => {
  const navigation = useNavigation();
  const email = useRef("");
  const username = useRef("");
  const password = useRef("");
  const { signUp, showToast } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedTheme } = useTheme();
  const [passwordReveal, setPasswordReveal] = useState(true);
  const [color, setColor] = useState(
    selectedTheme === darkTheme ? "white" : "black"
  );
  const [profileUrl, setProfileUrl] = useState(null);
  const styles = getStyles(selectedTheme);

  // Function to handle image selection from the gallery
  const selectImage = () => {
    const options = {
      mediaType: "photo",
      maxWidth: 300,
      maxHeight: 300,
      quality: 2,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        setProfileUrl(selectedImage); // Set selected image URI to state
      }
    });
  };

  // Email regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password regex created to ensure password strength (at least 8 characters, including a number and a special character)
  const passwordStrengthRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  const handleSignUpPressed = async () => {
    setIsLoading(true);
    if (!email.current || !username.current || !password.current) {
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
      let downloadURL = null;

      // Upload the profile picture if selected
      if (profileUrl) {
        const response = await fetch(profileUrl); // Fetch the local file
        const blob = await response.blob(); // Convert to Blob for Firebase

        // Create a reference in Firebase Storage
        const storageRef = ref(
          storage,
          `profilePictures/${username.current}.jpg`
        );

        // Upload the blob
        await uploadBytes(storageRef, blob);

        // Get the download URL
        downloadURL = await getDownloadURL(storageRef);
      }

      // Use the downloadURL in your signUp function
      let response = await signUp(
        email.current,
        username.current,
        password.current,
        downloadURL
      );

      if (response.success) {
        navigation.replace("Home");
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
      <StatusBar
        style={`${selectedTheme.Statusbar.style}`}
        animated={true}
      />

      <LottieView
        source={require("../../myAssets/Lottie_Files/Sign Up.json")}
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
            color={styles.IconColor}
            size={25}
          />
          <TextInput
            placeholder="Email*"
            style={styles.suInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (email.current = value)}
          />
        </View>

        {/* Username field */}
        <View style={styles.suInputField}>
          <MaterialIcons
            name="person"
            color={styles.IconColor}
            size={25}
          />
          <TextInput
            placeholder="Username*"
            style={styles.suInputText}
            placeholderTextColor={"grey"}
            onChangeText={(value) => (username.current = value)}
          />
        </View>

        {/* Password */}
        <View style={styles.suInputField}>
          <MaterialIcons
            name="lock"
            color={styles.IconColor}
            size={25}
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
              onPress={() => {
                setPasswordReveal((prev) => !prev);
                setColor(passwordReveal ? "grey" : styles.IconColor);
              }}
            >
              <MaterialIcons name="remove-red-eye" color={color} size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Picture */}

        <View style={styles.suInputField}>
          {/* <MaterialIcons name="image" color="black" size={25} /> */}
          <TouchableOpacity
            onPress={() => {
              selectImage();
              console.log("select image from gallery");
            }}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Text style={{ color: styles.IconColor }}>
              {profileUrl ? "Change profile pic" : "Select a profile picture"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Uncomment to display image after selection */}
        {/* Display selected image (if any) */}
        {/* {profileUrl && (
          <Image source={{uri: profileUrl}} style={styles.profileImage} />
        )} */}

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
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.suLoginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

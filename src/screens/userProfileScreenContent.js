import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import { useTheme } from "../ThemeContext";
import { StatusBar } from "expo-status-bar";
import { launchImageLibrary } from "react-native-image-picker";

const UserProfileContent = ({ children }) => {
  const { user, logout, showToast } = useAuth();
  const navigation = useNavigation();
  const profileUrl = user?.profileUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const { selectedTheme, changeBackgroundPic } = useTheme();
  const styles = getStyles(selectedTheme);

  const [selected, setSelected] = useState();
  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  const selectImage = async () => {
    const options = {
      mediaType: "photo",
      quality: 2,
    };
    
    try {
      const response = await new Promise((resolve) => {
        launchImageLibrary(options, resolve);
      });

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        console.log("ImagePicker Selected: ", selectedImage);
        await changeBackgroundPic(selectedImage);
        showToast("Background Picture Changed");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      showToast("Failed to change background picture");
    }
  };

  return (
    <ScrollView style={styles.upContainer}>
      <StatusBar style={`${selectedTheme.Statusbar.style}`} animated={true} />
      {/* back icon */}
      <TouchableOpacity
        // style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={25} color={styles.IconColor} />
      </TouchableOpacity>
      {/* User Profile Info */}
      <View style={styles.upProfileContainer}>
        {imageFailed || profileUrl == "" ? (
          <Image
            style={styles.upAvatar}
            source={require("../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
            transition={500}
          />
        ) : (
          <Image
            style={styles.upAvatar}
            source={{ uri: profileUrl }}
            transition={500}
            onError={() => setImageFailed(true)}
          />
        )}
        <Text style={styles.upUsername}>{user?.username || "User Name"}</Text>
      </View>

      {/* Options Section */}
      <View style={styles.upOptionsContainer}>
        {/* Edit profile */}
        <TouchableOpacity
          style={styles.upOption}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <MaterialIcons
            name="edit"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <View style={styles.upOption}>
          <MaterialIcons
            name="notifications"
            size={25}
            color={selectedTheme.text.primary}
          />
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.upOptionText}>Notifications</Text>
            <Switch
              value={selected}
              onValueChange={() => setSelected((prev) => !prev)}
              thumbColor={"white"}
              trackColor={{
                true: "white",
                false: "black",
              }}
              style={{
                marginLeft: 10,
              }}
            ></Switch>
          </View>
        </View>
        {/*Change background picture */}
        <TouchableOpacity style={styles.upOption} onPress={selectImage}>
          <MaterialIcons
            name="image-search"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Background Picture</Text>
        </TouchableOpacity>

        {/* Change Theme */}
        {children}

        {/* Logout */}
        <TouchableOpacity style={styles.upOption} onPress={handleLogout}>
          <MaterialIcons
            name="logout"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserProfileContent;

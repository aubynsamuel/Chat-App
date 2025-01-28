import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme, getStyles, useAuth } from "../../../imports";
import { useNavigation } from "@react-navigation/native";
import useNetworkStore from "@/context/NetworkStore";
import { activeTouchableOpacity } from "@/Functions/Constants";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile, showToast } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [profileUrl, setProfileUrl] = useState(user?.profileUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);
  const isInternetReachable = useNetworkStore(
    (state) => state.details?.isInternetReachable
  );

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setProfileUrl(selectedImage.uri);
      } else {
        console.log("No image selected");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);

    if (!username) {
      showToast("Username cannot be empty");
      setIsLoading(false);
      return;
    }

    if (isInternetReachable) {
      try {
        let downloadURL: string | null | undefined = profileUrl;

        if (profileUrl && profileUrl.startsWith("file://")) {
          const storageRef = storage().ref(`profilePictures/${user?.userId}`);

          const response = await fetch(profileUrl);
          const blob = await response.blob();

          const uploadTask = storageRef.put(blob);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
            },
            (error) => {
              console.error("Upload failed:", error.message);
              showToast("Picture Could Not Be Uploaded");
              setIsLoading(false);
            },
            async () => {
              downloadURL = await uploadTask.snapshot?.ref.getDownloadURL();
              console.log("File available at", downloadURL);

              const response = await updateProfile({
                username,
                profileUrl: downloadURL,
              });

              if (!response.success) {
                showToast(response.msg as string);
              } else {
                showToast("Profile updated successfully!");
              }
              setIsLoading(false);
            }
          );
        } else {
          const response = await updateProfile({ username, profileUrl } as any);
          if (!response.success) {
            showToast(response.msg as string);
          } else {
            showToast("Profile updated successfully!");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        showToast("Failed to update profile");
        setIsLoading(false);
      }
    } else {
      showToast("No internet connection");
      console.log("No internet connection");
      setIsLoading(false);
      return;
    }
  };

  return (
    <ScrollView style={styles.epContainer}>
      <StatusBar
        style={`${selectedTheme.Statusbar.style}` as any}
        animated={true}
      />
      {/* back icon */}
      <TouchableOpacity
        activeOpacity={activeTouchableOpacity}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons
          name="arrow-back"
          size={25}
          color={selectedTheme.text.primary}
        />
      </TouchableOpacity>

      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        {/* Profile Picture */}
        {profileUrl ? (
          <Image source={{ uri: profileUrl }} style={styles.epProfileImage} />
        ) : (
          <Image
            source={require("../../../myAssets/Images/profile-picture-placeholder.webp")}
            style={styles.epProfileImage}
          />
        )}
        <TouchableOpacity
          activeOpacity={activeTouchableOpacity}
          onPress={selectImage}
        >
          <Text style={styles.epChangePicText}>Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Username */}
        <View style={styles.epInputField}>
          <MaterialIcons
            name="person"
            size={25}
            color={selectedTheme.text.primary}
          />
          <TextInput
            placeholder="Username"
            style={styles.epInputText}
            placeholderTextColor={"grey"}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={activeTouchableOpacity}
          style={styles.epSaveButton}
          onPress={handleUpdateProfile}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.epSaveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
        <View style={{ paddingBottom: 50 }}></View>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;

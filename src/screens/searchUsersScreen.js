import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../../env/firebaseConfig";
import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import { useTheme } from "../ThemeContext";
import { StatusBar } from "expo-status-bar";

const SearchUsersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", "!=", user?.username),
        where("username", ">=", text),
        where("username", "<=", text + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      const userData = [];
      querySnapshot.forEach((doc) => {
        userData.push({ ...doc.data() });
      });
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserPress = (selectedUser) => {
    navigation.navigate("ChatScreen", {
      userId: selectedUser.userId,
      username: selectedUser.username,
      profileUrl: selectedUser.profileUrl,
    });
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
        style={`${
          selectedTheme === purpleTheme
            ? "light"
            : selectedTheme.Statusbar.style
        }`}
        backgroundColor={selectedTheme.primary}
        animated={true}
      />
      <View style={styles.header}>
        <MaterialIcons
          name="arrow-back"
          size={25}
          color={
            selectedTheme === darkTheme || selectedTheme === purpleTheme
              ? "lightgrey"
              : "black"
          }
          onPress={() => navigation.goBack()}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={
            selectedTheme === darkTheme ? "lightgrey" : "black"
          }
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserPress(item)}
          >
            <Image
              source={
                { uri: item.profileUrl } ||
                require("../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")
              }
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>No users found</Text>
        }
      />
    </SafeAreaView>
  );
};

export default SearchUsersScreen;

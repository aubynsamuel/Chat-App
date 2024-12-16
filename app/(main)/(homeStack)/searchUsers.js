import React, { useEffect, useRef, useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useTheme, useAuth, db, getStyles } from "../../../imports";

const SearchUsersScreen = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const inputRef = useRef();
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

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleUserPress = (selectedUser) => {
    router.navigate({
      pathname: "/chatRoom",
      params: {
        userId: selectedUser.userId,
        username: selectedUser.username,
        profileUrl: selectedUser.profileUrl,
      },
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
          onPress={() => router.navigate("..")}
        />
        <TextInput
          ref={inputRef}
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
                require("../../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")
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

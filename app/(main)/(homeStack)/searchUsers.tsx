import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { getDocs, query, where, collection } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ExternalPathString, router } from "expo-router";
import { useTheme, useAuth, db, getStyles } from "../../../imports";
import { useProfileURlStore } from "@/context/ProfileUrlStore";

interface User {
  userId: string;
  username: string;
  profileUrl: string;
}

const SearchUsersScreen: React.FC = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const inputRef = useRef<TextInput>(null);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);
  const [errorMessage, setErrorMessage] = useState("Search users");
  const [isLoading, setIsLoading] = useState(false);
  const setProfileUrlLink = useProfileURlStore(
    (state) => state.setProfileUrlLink
  );

  const handleSearch = async (text: string) => {
    setIsLoading(true);
    setSearchText(text);

    if (text.trim() === "") {
      setIsLoading(false);
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
      const userData: User[] = querySnapshot.docs.map(
        (doc) =>
          ({
            userId: doc.id,
            ...doc.data(),
          } as User)
      );

      setFilteredUsers(userData);
    } catch (error) {
      setIsLoading(false);
      console.error("Error searching users:", error);
    } finally {
      if (filteredUsers.length < 0) {
        setErrorMessage("No users found");
      } else {
        setErrorMessage(
          "An error occurred \n Please check your internet connection"
        );
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUserPress = (selectedUser: User) => {
    setProfileUrlLink(selectedUser.profileUrl);
    router.push({
      pathname: "/chatRoom" as ExternalPathString,
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
        backgroundColor: selectedTheme.background,
      }}
    >
      <StatusBar
        style={selectedTheme.Statusbar.style as any}
        backgroundColor={selectedTheme.primary}
        animated={true}
      />
      <View style={styles.header}>
        <MaterialIcons
          name="arrow-back"
          size={25}
          color={selectedTheme.text.primary}
          onPress={() => router.push("..")}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={selectedTheme.text.secondary}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {!isLoading ? (
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
                  item.profileUrl
                    ? { uri: item.profileUrl }
                    : require("../../../myAssets/Images/profile-picture-placeholder.webp")
                }
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.noResults}>{errorMessage}</Text>
          }
        />
      ) : (
        <ActivityIndicator
          size={"large"}
          color={selectedTheme.secondary}
          style={{ padding: 20, marginTop: "10%" }}
        />
      )}
    </SafeAreaView>
  );
};

export default SearchUsersScreen;

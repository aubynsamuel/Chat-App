import { SafeAreaView, View, TouchableOpacity, Button } from "react-native";
import { useAuth } from "../AuthContext";
import TopHeaderBar from "../components/HeaderBar_HomeScreen";
import { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import {
  query,
  where,
  orderBy,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { usersRef, db } from "../../env/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationTokenManager from "../NotificationTokenManager";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import { useTheme } from "../ThemeContext";
import { StatusBar } from "expo-status-bar";
// import {schedulePushNotification} from '../services/ExpoPushNotifications'

function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  useEffect(() => {
    NotificationTokenManager.initializeAndUpdateToken(user?.userId);
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      initializeRooms();
    }
  }, [user]);

  const initializeRooms = async () => {
    setIsLoading(true);
    try {
      // First load from cache
      const cachedRooms = await loadCachedRooms();
      if (cachedRooms) {
        setRooms(cachedRooms);
      }

      // Then subscribe to real-time updates
      subscribeToRooms();
    } catch (error) {
      console.error("Error initializing rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedRooms = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(`rooms_${user.uid}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error("Error loading rooms from cache:", error);
      return null;
    }
  };

  const subscribeToRooms = () => {
    const roomsRef = collection(db, "rooms");
    const roomsQuery = query(
      roomsRef,
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    return onSnapshot(roomsQuery, async (snapshot) => {
      const roomsData = [];

      for (const roomDoc of snapshot.docs) {
        const roomData = roomDoc.data();
        const otherUserId = roomData.participants.find((id) => id !== user.uid);

        if (otherUserId) {
          const userDocRef = doc(usersRef, otherUserId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            roomsData.push({
              roomId: roomDoc.id,
              lastMessage: roomData?.lastMessage,
              lastMessageTimestamp: roomData?.lastMessageTimestamp,
              lastMessageSenderId: roomData?.lastMessageSenderId,
              otherParticipant: {
                userId: otherUserId,
                username: userData.username,
                profileUrl: userData.profileUrl,
                otherUsersDeviceToken: userData.deviceToken,
              },
            });
          }
        }
      }
      if (roomsData.length > 0) {
        setRooms(roomsData);
        await AsyncStorage.setItem(
          `rooms_${user.uid}`,
          JSON.stringify(roomsData)
        );
      }
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
      {/* <Button title="Message Actions" onPress={()=>schedulePushNotification("Hey", "What up", "ReplyTo", "RoomId")}></Button> */}
      <StatusBar
        style={`${
          selectedTheme === purpleTheme
            ? "light"
            : selectedTheme.Statusbar.style
        }`}
        backgroundColor={selectedTheme.primary}
        animated={true}
      />

      <TopHeaderBar
        title={"Chats"}
        backButtonShown={false}
        theme={selectedTheme}
      />

      <View style={styles.hsContainer}>
        <ChatList
          rooms={rooms}
          isLoading={isLoading}
          onRefresh={initializeRooms}
          theme={selectedTheme}
        />
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Search_Users")}
      >
        <MaterialIcons
          name="search"
          size={30}
          color={selectedTheme.text.primary}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default HomeScreen;

import { View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import {
  query,
  where,
  orderBy,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationTokenManager from "../../../Functions/NotificationTokenManager";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  useTheme,
  useAuth,
  db,
  usersRef,
  getStyles,
} from "../../../imports";
import TopHeaderBar from "../../../components/HeaderBar_HomeScreen";
import ChatList from "../../../components/ChatList";

function HomeScreen() {
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
    <View
      style={{
        flex: 1,
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
        onPress={() => router.navigate("/searchUsers")}
      >
        <MaterialIcons
          name="search"
          size={30}
          color={selectedTheme.text.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default HomeScreen;

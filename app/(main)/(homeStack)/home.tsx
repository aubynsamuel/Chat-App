import { View, TouchableOpacity, SafeAreaView, ViewStyle } from "react-native";
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
import { useTheme, useAuth, db, usersRef, getStyles } from "../../../imports";
import TopHeaderBar from "../../../components/HeaderBar_HomeScreen";
import ChatList from "../../../components/ChatList";
import { deviceToken } from "@/services/RegisterForPushNotifications";

export interface RoomData {
  roomId: any;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  lastMessageSenderId?: string;
  otherParticipant: {
    userId: string;
    username: string;
    profileUrl: string;
    otherUsersDeviceToken: string;
  };
}

function HomeScreen() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  useEffect(() => {
    NotificationTokenManager.initializeAndUpdateToken(user?.userId as string);
  }, [user, deviceToken]);

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
      const cachedData = await AsyncStorage.getItem(`rooms_${user?.uid}`);
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
      where("participants", "array-contains", user?.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    return onSnapshot(roomsQuery, async (snapshot) => {
      const roomsData: RoomData[] = [];

      for (const roomDoc of snapshot.docs) {
        const roomData = roomDoc.data();
        const otherUserId = roomData.participants.find(
          (id: any) => id !== user?.uid
        );

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
          `rooms_${user?.uid}`,
          JSON.stringify(roomsData)
        );
      }
    });
  };

  return (
    <SafeAreaView
      style={
        {
          flex: 1,
          backgroundColor: selectedTheme.background,
        } as ViewStyle
      }
    >
      <StatusBar
        style={selectedTheme.Statusbar.style as any}
        backgroundColor={selectedTheme.primary}
        animated={true}
      />

      <TopHeaderBar
        title={"Flash Send"}
        theme={selectedTheme}
        searchButtonShown={true}
        menuButtonShown={true}
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
        <MaterialIcons name="add" size={30} color={selectedTheme.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default HomeScreen;

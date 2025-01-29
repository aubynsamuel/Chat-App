import { View, TouchableOpacity, SafeAreaView, ViewStyle } from "react-native";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationTokenManager from "../../../Functions/NotificationTokenManager";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useTheme, useAuth, getStyles } from "../../../imports";
import TopHeaderBar from "../../../components/HeaderBar_HomeScreen";
import ChatList from "../../../components/ChatList";
import { deviceToken } from "../../../services/RegisterForPushNotifications";
import { useNavigation } from "@react-navigation/native";
import useNetworkStore from "@/context/NetworkStore";
import { activeTouchableOpacity } from "@/Functions/Constants";

export interface RoomData {
  roomId: string;
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
  const navigation = useNavigation();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);
  const isInternetReachable = useNetworkStore(
    (state) => state.details?.isInternetReachable
  );

  useEffect(() => {
    NotificationTokenManager.initializeAndUpdateToken(user?.userId as string);
  }, [deviceToken]);

  useEffect(() => {
    // console.log(user?.userId);
    if (user?.userId) {
      initializeRooms();
    }
  }, [user, isInternetReachable]);

  const initializeRooms = async () => {
    console.log("Initializing Rooms");
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
      const cachedData = await AsyncStorage.getItem(`rooms_${user?.userId}`);
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
    try {
      const roomsRef = firestore().collection("rooms");
      const roomsQuery = roomsRef
        .where("participants", "array-contains", user?.userId)
        .orderBy("lastMessageTimestamp", "desc");

      return roomsQuery.onSnapshot(async (snapshot) => {
        const roomsData: RoomData[] = [];

        for (const roomDoc of snapshot.docs) {
          const roomData = roomDoc.data();
          const otherUserId = roomData.participants.find(
            (id: string) => id !== user?.userId
          );

          if (otherUserId) {
            const userDocRef = firestore().collection("users").doc(otherUserId);
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {
              const userData = userDoc.data();
              roomsData.push({
                roomId: roomDoc.id,
                lastMessage: roomData?.lastMessage,
                lastMessageTimestamp: roomData?.lastMessageTimestamp,
                lastMessageSenderId: roomData?.lastMessageSenderId,
                otherParticipant: {
                  userId: otherUserId,
                  username: userData?.username,
                  profileUrl: userData?.profileUrl,
                  otherUsersDeviceToken: userData?.deviceToken,
                },
              });
            }
          }
        }
        if (roomsData.length > 0) {
          // console.log(roomsData);
          setRooms(roomsData);
          await AsyncStorage.setItem(
            `rooms_${user?.userId}`,
            JSON.stringify(roomsData)
          );
        }
      });
    } catch (error) {
      console.error(error);
    }
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
        activeOpacity={activeTouchableOpacity}
        style={styles.floatingButton}
        onPress={() => navigation.navigate("searchUsers" as never)}
      >
        <MaterialIcons name="add" size={30} color={selectedTheme.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default HomeScreen;

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import React from "react";
import { db } from "../../env/firebaseConfig";
import {
  collection,
  query,
  doc,
  setDoc,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { userDetails as user } from "../AuthContext";
import { getCurrentTime } from "../Functions/Commons";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// let notificationDisplayed = false;
export let deviceToken = "";

export default function ExpoPushNotifications({ children }) {
  const responseListener = useRef();
  const [roomId, setRoomId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const notificationCategories = async () => {
      try {
        // Set up notification categories

        await Notifications.setNotificationCategoryAsync(
          "MESSAGE_CATEGORY",
          [
            {
              identifier: "REPLY_ACTION",
              buttonTitle: "Reply",
              options: {
                opensAppToForeground: true,
                isDestructive: true,
                isAuthenticationRequired: false,
              },
              textInput: {
                submitButtonTitle: "Send",
                placeholder: "Type your reply...",
              },
            },
            {
              identifier: "MARK_AS_READ",
              buttonTitle: "Mark as Read",
              options: {
                opensAppToForeground: false,
                isDestructive: false,
                isAuthenticationRequired: false,
              },
            },
          ],
          null
        );
        console.log("Notification category set successfully!");
      } catch (error) {
        console.error("Failed to set notification category:", error);
      }
    };
    notificationCategories();

    const notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const content = notification.request.content;
        if (!content.categoryIdentifier) {
          content.categoryIdentifier = "MESSAGE_CATEGORY"; // Set the category manually
        }
        console.log("Remote Notification Received:", notification);
        const { replyTo, roomId } = notification.request.content.data || {};
        const { title, body } = notification.request.content || {};

        if (!roomId) {
          console.error("No roomId received in notification data");
          return;
        }

        // schedulePushNotification(title, body, roomId)

        setReplyTo(replyTo);
        setRoomId(roomId);
        console.log(`Title: ${title}`);
        console.log(`Body: ${body}`);
        console.log(`Reply To: ${replyTo}`);
        console.log(`RoomId: ${roomId}`);
      }
    );

    // Listen for notification responses
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          // console.log("Remote Notification Response:", response);
          const { actionIdentifier, userText } = response.actionIdentifier
            ? response
            : { actionIdentifier: null, userText: null };

          if (!roomId) {
            console.error("No roomId available for action");
            return;
          }

          console.log("Action:", actionIdentifier, "Text:", userText);
          console.log("Current RoomId:", roomId);

          if (actionIdentifier === "REPLY_ACTION") {
            await handleReplyAction(userText, user, roomId, replyTo);
          } else if (actionIdentifier === "MARK_AS_READ") {
            await handleMarkAsReadAction(user, roomId);
          }

          if (response.notification) {
            await Notifications.dismissNotificationAsync(
              response.notification.request.identifier
            );
          }
        }
      );

    return () => {
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, [roomId]);

  return <>{children}</>;
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.error("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      deviceToken = token;
      console.log("Expo Push Token: " + deviceToken);
    } catch (e) {
      token = `${e}`;
      deviceToken = token;
      console.log("Expo Push Token: " + deviceToken);
    }
  } else {
    console.error("Must use physical device for Push Notifications");
  }

  return token;
}

export async function schedulePushNotification(title, body, roomId) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { replyTo: deviceToken || null, roomId: roomId || null },
      categoryIdentifier: "MESSAGE_CATEGORY",
    },
    trigger: null,
  });
}

export const sendNotification = async (expoPushToken, title, body, roomId) => {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    categoryIdentifier: "MESSAGE_CATEGORY",
    data: { replyTo: deviceToken || null, roomId: roomId || null },
    channelId: "default",
    priority: "high",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

async function handleReplyAction(replyText, user, roomId, deviceToken) {
  try {
    const roomRef = doc(db, "rooms", roomId); // Update roomId as needed
    const messagesRef = collection(roomRef, "messages");
    const newMessageRef = doc(messagesRef);

    const newMessage = {
      content: replyText,
      senderId: user?.userId,
      senderName: user?.username,
      createdAt: getCurrentTime(),
      delivered: true,
      read: false,
    };
    await setDoc(newMessageRef, { ...newMessage });

    await setDoc(
      roomRef,
      {
        lastMessage: newMessage.content,
        lastMessageTimestamp: getCurrentTime(),
        lastMessageSenderId: user?.userId,
      },
      { merge: true }
    );
    // Send a notification to the room's owner
    sendNotification(
      deviceToken,
      `New message from ${user.username}`,
      replyText,
      roomId
    );
  } catch (error) {
    console.error(error);
  }
  console.log("Replied to message");
}

async function handleMarkAsReadAction(user, roomId) {
  // Validate inputs
  if (!user?.userId) {
    console.error("Invalid user data:", user);
    return;
  }

  if (!roomId || typeof roomId !== "string") {
    console.error("Invalid roomId:", roomId);
    return;
  }

  console.log("Marking as read for user:", user.userId, "in room:", roomId);

  try {
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(
      messagesRef,
      where("senderId", "!=", user.userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No unread messages found");
      return;
    }

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log(`Marked ${snapshot.size} messages as read`);
  } catch (error) {
    console.error("Failed to update message read status:", error);
    throw error;
  }
}

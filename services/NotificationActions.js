import { db } from "../env/firebaseConfig";
import {
  collection,
  query,
  doc,
  setDoc,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { getCurrentTime } from "../Functions/Commons";
import { deviceToken } from "./RegisterForPushNotifications";

async function sendNotification(expoPushToken, title, body, roomId) {
  if (!expoPushToken) {
    console.warn("No device token provided for notification");
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    categoryId: "MESSAGE_CATEGORY",
    data: { 
      tokenToReplyTo: deviceToken || null, 
      replyToRoomId: roomId || null 
    },
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

    const responseData = await response.json();
    console.log("Notification sent:", responseData);
    return responseData;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

async function handleReplyAction(replyText, user, roomId, deviceToken) {
//   if (!user?.userId || !roomId || !replyText) {
//     console.error("Missing required parameters for reply action");
//     console.log(user, roomId, replyText, deviceToken);
//     return;
//   }


  try {
    const roomRef = doc(db, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");
    const newMessageRef = doc(messagesRef);

    const newMessage = {
      content: replyText,
      senderId: user.userId,
      senderName: user.username,
      createdAt: getCurrentTime(),
      delivered: true,
      read: false,
    };
    await setDoc(newMessageRef, newMessage);

    await setDoc(
      roomRef,
      {
        lastMessage: newMessage.content,
        lastMessageTimestamp: getCurrentTime(),
        lastMessageSenderId: user.userId,
      },
      { merge: true }
    );

    // Send a notification to the room's owner
    if (deviceToken) {
      await sendNotification(
        deviceToken,
        `New message from ${user.username}`,
        replyText,
        roomId
      );
    }
  } catch (error) {
    console.error("Error in handleReplyAction:", error);
  }
}

async function handleMarkAsReadAction(user, roomId) {
  if (user.userId ==="") {
    console.error("Invalid user data" , user);
    return;
  }

  if (!roomId) {
    console.error("Invalid roomId");
    return;
  }

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
  }
}

export { handleMarkAsReadAction, handleReplyAction, sendNotification };
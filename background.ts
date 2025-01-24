import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { messageData } from "./services/ExpoPushNotifications";
import { markAsRead, sendReply } from "./services/NotificationActions";

let notificationBody: messageData;

const backgroundListener = notifee.onBackgroundEvent(
  async ({ type, detail }) => {
    const {
      recipientsUserId: sendersUserId,
      roomId,
      sendersUserId: recipientsUserId,
    } = notificationBody;
    if (detail.pressAction?.id === "reply") {
      console.log(`Reply button pressed in killed state ${detail.input}.`);
      sendReply(
        sendersUserId,
        recipientsUserId,
        roomId,
        detail.input as string
      );
    } else if (detail.pressAction?.id === "mark-as-read") {
      console.log("Marked as read in killed state.");
      markAsRead(sendersUserId, roomId);
    } else {
      console.log("Notification pressed");
    }
  }
);

// Register background handler
export const backgroundListenerFireBase =
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const parsedData: messageData = JSON.parse(remoteMessage.data?.body as any);
    notificationBody = parsedData;
    displayNotification(
      remoteMessage.notification?.title as string,
      remoteMessage.notification?.body as string,
      notificationBody.profileUrl as string
    );
    console.log("Message handled in the background!", parsedData);
  });

export const displayNotification = async (
  title: string,
  body: string,
  profileUrl: string = require("./myAssets/Images/profile-picture-placeholder.webp")
) => {
  try {
    const channelId = await notifee.createChannel({
      id: "high-importance-channel",
      name: "High Importance Notifications",
      importance: AndroidImportance.HIGH,
      vibration: true,
    });

    // Display a notification
    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        color: "#4CAF50",
        pressAction: { id: "default" },
        autoCancel: true,
        showTimestamp: true,
        onlyAlertOnce: true,
        largeIcon: profileUrl,
        circularLargeIcon: true,
        // style: {
        //   type: AndroidStyle.MESSAGING,
        //   person: { name: title },
        //   messages: [{ text: body, timestamp: Date.now() }],
        //   group: false,
        // },
        actions: [
          {
            title: "Reply",
            pressAction: { id: "reply" },
            input: {
              placeholder: "Type you reply here",
            },
          },
          {
            title: "Mark as Read",
            pressAction: { id: "mark-as-read" },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

export default backgroundListener;

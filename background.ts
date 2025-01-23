import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { messageData } from "./services/ExpoPushNotifications";

let notificationBody: messageData;

const backgroundListener = notifee.onBackgroundEvent(
  async ({ type, detail }) => {
    const { roomId, recipientsUserId, sendersUserId } = notificationBody;
    if (detail.pressAction?.id === "reply") {
      // TODO: make a server request to handle reply
      console.log(`Reply button pressed in background ${detail.input}.`);
    } else if (detail.pressAction?.id === "mark-as-read") {
      //TODO: make a server request to handle reply
      console.log("Marked as read in the background.");
    } else {
      console.log("Notification pressed");
    }
  }
);

// Register background handler
export const backgroundListenerFireBase =
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    displayNotification(
      remoteMessage.notification?.title as string,
      remoteMessage.notification?.body as string
    );
    const parsedData: messageData = JSON.parse(remoteMessage.data?.body as any);
    console.log("Message handled in the background!", parsedData);
    notificationBody = parsedData;
  });

const displayNotification = async (title: string, body: string) => {
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

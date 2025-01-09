import { deviceToken as currentUsersDeviceToken } from "./RegisterForPushNotifications";

async function sendNotification(
  expoPushTokenOfOtherUser: string,
  title: string,
  body: string,
  roomId: string
) {
  const message = {
    to: expoPushTokenOfOtherUser,
    sound: "default",
    title: title,
    body: body.length < 100 ? body : body.substring(0, 100) + "...",
    data: {
      tokenToReplyTo: currentUsersDeviceToken || null,
      replyToRoomId: roomId || null,
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

export default sendNotification;

import { Timestamp } from "@react-native-firebase/firestore";

export const getRoomId = (
  userId1: string | undefined,
  userId2: string | string[]
) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join("_");
  return roomId;
};

export const getCurrentTime = () => {
  const now = Timestamp.now();
  return now;
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatTimeWithoutSeconds = (firestoreTimestamp: any) => {
  const seconds = firestoreTimestamp.seconds;

  // Convert seconds to milliseconds and create a Date object
  const date = new Date(seconds * 1000);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const period = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${hours}:${formattedMinutes} ${period}`;

  return formattedTime;
};

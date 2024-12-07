import { Timestamp } from "firebase/firestore";

export const getRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join("_");
  return roomId;
};

export const getCurrentTime = () => {
  const now = Timestamp.now();
  return now;
};

export const formatDate = (firestoreTimestamp) => {
  // Extract seconds from Firestore Timestamp
  const seconds = firestoreTimestamp.seconds;

  // Convert seconds to milliseconds and create a Date object
  const date = new Date(seconds * 1000);

  // Get day, date, month, and year
  const dayOfTheWeek = date.getUTCDay();
  const day = date.getUTCDate();
  const month = date.getUTCMonth(); // Months are 0-based
  const year = date.getUTCFullYear();

  const formattedDayOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Format day, date, month, and year
  const formattedDay = day.toString().padStart(2, "0");
  // const formattedMonth = month.toString().padStart(2, '0');
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let formattedDate;

  const currentDate = new Date();
  const currentDay = currentDate.getUTCDate();
  // console.log(' current day: ' + currentDay);
  // console.log(' formatted day: ' + formattedDay);

  if (formattedDay == currentDay - 1) {
    formattedDate = `Yesterday`;
  } else if (formattedDay == currentDay) {
    formattedDate = `Today`;
  } else {
    formattedDate = `${
      formattedDayOfTheWeek[dayOfTheWeek]
    } ${formattedDay} ${months[month]}, ${year}`;
  }

  return formattedDate;
};


export const formatTimeWithoutSeconds = (firestoreTimestamp) => {
  // Extract seconds from Firestore Timestamp
  const seconds = firestoreTimestamp.seconds;

  // Convert seconds to milliseconds and create a Date object
  const date = new Date(seconds * 1000);

  // Get hours and minutes
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Determine AM or PM period
  const period = hours >= 12 ? "pm" : "am";

  // Convert 24-hour time to 12-hour format
  hours = hours % 12 || 12;

  // Format hours and minutes
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${hours}:${formattedMinutes} ${period}`;

  return formattedTime;
};

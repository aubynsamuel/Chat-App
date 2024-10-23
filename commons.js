import {Timestamp} from 'firebase/firestore';
import { SectionList } from 'react-native';

export const getRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join('_');
  return roomId;
};

export const getCurrentTime = () => {
  const now = Timestamp.now();
  return now;
};

export const formatDate = firestoreTimestamp => {
  // Extract seconds from Firestore Timestamp
  const seconds = firestoreTimestamp.seconds;

  // Convert seconds to milliseconds and create a Date object
  const date = new Date(seconds * 1000);

  // Get day, date, month, and year
  const day = date.getUTCDate();
  const month = date.getUTCMonth(); // Months are 0-based
  const year = date.getUTCFullYear();

  // Format day, date, month, and year
  const formattedDay = day.toString().padStart(2, '0');
  // const formattedMonth = month.toString().padStart(2, '0');
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
    formattedDate = `${formattedDay} ${months[month]}, ${year}`;
  }

  return formattedDate;
};

export const formatTimeWithoutSeconds = firestoreTimestamp => {
  // Extract seconds from Firestore Timestamp
  const seconds = firestoreTimestamp.seconds;

  // Convert seconds to milliseconds and create a Date object
  const date = new Date(seconds * 1000);

  // Get hours and minutes
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Determine AM or PM period
  const period = hours >= 12 ? 'pm' : 'am';

  // Convert 24-hour time to 12-hour format
  hours = hours % 12 || 12;

  // Format hours and minutes
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedTime = `${hours}:${formattedMinutes} ${period}`;

  return formattedTime;
};

/**
 * TO DO before it is production ready
 * 1. Forgot password functionality in login screen
 * 2. Edit profile
 * 3. Push notifications functionality
 * 4. Settings
 * 5. DarkMode
 */

SectionList
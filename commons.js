export const getRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join('_');
  return roomId;
};

export const getCurrentTime = () => {
  const now = new Date();
  // Add day, month and year
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  //  format it to the 12 hours time format
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12;

  const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;
  return `${year}-${month}-${day} ${formattedTime}`;
};

export function formatTimeWithoutSeconds(time) {
  // Split the time into its components (hour, minute, second, period)
  let [date, timePart, period] = time.split(' '); // e.g. '4:45:18' and 'am'
  let [hour, minute] = timePart.split(':'); // Extract hour and minute, ignore seconds

  // Return the formatted time without seconds  
  return `${hour}:${minute} ${period}`;
}

// persist users from home screen
// persist user from authContext
// persist messages from chatroom
// persist lastMessage from chatObject

// change the color of the small space under the go home button to match my screen bg color
// do not automatically display chat of all users, will only display list of chats a user has a room with
// make it possible to search users by their username and start a conversation
// there should be no rooms with empty messages
// animations and many more features in the chat room and the whole app

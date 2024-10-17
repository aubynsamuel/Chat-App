import { Timestamp } from 'firebase/firestore';
export const getRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join('_');
  return roomId;
};


// Function to get the current Firestore time in the desired format
export const getCurrentTime = () => {
  // Firestore's Timestamp.now() returns a Timestamp object with the current time
  const now = Timestamp.now().toDate(); // Convert Firestore Timestamp to JavaScript Date

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  // Format the time to the 12-hour time format
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
// import {StyleSheet, SafeAreaView, View, StatusBar} from 'react-native';
// import {useAuth} from '../AuthContext';
// import TopHeaderBar from '../components/HeaderBar_HomeScreen';
// import {useEffect, useState} from 'react';
// import ChatList from '../components/ChatList';
// import {usersRef, db} from '../../firebaseConfig';
// import {getRoomId} from '../../commons';
// import {
//   collection,
//   query,
//   orderBy,
//   doc,
//   limit,
//   getDocs,
//   where,
// } from 'firebase/firestore';

// function HomeScreen() {
//   const {user} = useAuth();
//   const [users, setUsers] = useState([]);
  

//   useEffect(() => {
//     if (user?.uid) getUsers();
//   }, [user]);

//   useEffect(() => {
//     if (users.length > 0) {
//       const fetchLastMessages = async () => {
//         const usersWithLastMessage = await Promise.all(
//           users.map(async (contact) => {
//             const roomId = getRoomId(user?.uid, contact.userId);
//             const docRef = doc(db, 'rooms', roomId);
//             const messagesRef = collection(docRef, 'messages');
//             const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
//             const snapshot = await getDocs(q);
//             let lastMessageData = null;
//             if (!snapshot.empty) {
//               lastMessageData = snapshot.docs[0].data();
//             }
//             return {
//               ...contact,
//               lastMessage: lastMessageData,
//             };
//           })
//         );

//         // Sort users by the last message timestamp in descending order
//         usersWithLastMessage.sort((a, b) => {
//           if (!a.lastMessage && !b.lastMessage) return 0;
//           if (!a.lastMessage) return 1;
//           if (!b.lastMessage) return -1;
//           return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
//         });

//         setUsers(usersWithLastMessage);
//       };

//       fetchLastMessages();
//     }
//   }, [users]);

//   const getUsers = async () => {
//     const q = query(usersRef, where('userId', '!=', user?.uid));
//     const querySnapshot = await getDocs(q);
//     let data = [];
//     querySnapshot.forEach(doc => {
//       data.push({...doc.data()});
//     });
//     setUsers(data);
//   };

//   return (
//     <SafeAreaView>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="lightblue"
//       />
//       <TopHeaderBar title={'Chats'} backButtonShown={false} />
//       <View style={styles.container}>
//         <ChatList users={users} />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

import { Timestamp } from 'firebase/firestore';
export const getRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  const roomId = sortedIds.join('_');
  return roomId;
};


export const getCurrentTime = () => {
  const now = Timestamp.now(); 
  return now;
};


// Function to format Firestore Timestamp, removing seconds and date
export const formatTimeWithoutSeconds = (firestoreTimestamp) => {
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


# 🔥 Flash Send (Real-Time Chat Application)


Welcome to the **Real-Time Chat Application** built using **React Native** and **Firebase**. This app allows users to chat in real-time with messaging features such as message caching, user presence, and seamless chat history.


## 📱 Features


- **Real-Time Messaging**: Send and receive messages instantly with the help of Firebase Firestore.
- **User Authentication**: Secure login and sign-up system using Firebase Authentication.
- **Cached Messages**: Store and retrieve messages locally to allow offline access.
- **Profile Picture Handling**: Each user can set a profile picture displayed in chats.
- **Unread Message Count**: Keep track of unread messages for each conversation.
- **Smooth UI and UX**: A user-friendly interface with smooth transitions and responsive layouts.
- **Status Indicators**: Display the last message sent, message timestamps, and user activity status.
- **Push Notifications**: Receive notifications for new messages (optional).


## 🚀 Getting Started


### Prerequisites


- **Node.js** (>= 12.x)
- **React Native CLI** or **Expo CLI** (optional, if using Expo)
- **Firebase Project** with Firestore and Authentication enabled


### Installation


1. Clone the repository:

   ```bash
   git clone https://github.com/aubynsamuel/React-Native-Chat-App.git
   cd chat-app
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```


3. Set up Firebase:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a Firebase project and enable **Firestore** and **Authentication**
   - Copy the Firebase config and paste it into `firebaseConfig.js` in the app’s root folder.
  
  
### Firebase Configuration


Make sure to configure Firebase in `firebaseConfig.js`:


```js
// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})
export const storage = getStorage(app);


export const db = getFirestore(app);
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms")
```


4. Run the app:

   For Expo
   
   First create a development build
   ```bash
   npx eas build --profile development --platform android
   ```
   Then
   ```bash
   npx expo start
   ```

   For iOS:

   ```bash
   npx react-native run-ios
   ```

   For Android:

   ```bash
   npx react-native run-android
   ```


## 🛠️ App Structure

- **`components/`**: Contains reusable UI components like chat bubbles, header bars, and chat list items.
- **`screens/`**: Includes the main app screens like `ChatScreen`, `HomeScreen`, `LoginScreen`, and `SignUpScreen`.
- **`navigation/`**: Defines the navigation flow of the app using React Navigation.
- **`AuthContext.js`**: Handles user authentication context (sign-up, login, logout).
- **`firebaseConfig.js`**: Firebase initialization and configuration.
- **`commons.js`**: Helper functions for date formatting, room ID generation, and more.

## 🧑‍💻 Usage

- **Login/Sign Up**: Users can sign up or log in to the app using their email and password.
- **Real-Time Messaging**: Once logged in, users can view their chat history, send new messages, and receive messages in real-time.
- **Offline Access**: Messages are cached locally so that users can view previous messages even when offline.
- **Profile Management**: Users can upload a profile picture and update their details.


## 📂 Project Layout
```

/chat-app
│
├── /myAssets/                    # Images and lottie animations
├── /components/                # Reusable UI components (e.g., Header, ChatBubble)
├── /navigation/                # Navigation setup with React Navigation
├── /screens/                   # App screens (e.g., Chat, Home, Login, Sign Up)
├── /Functions/                 # Utility functions
├── /env/                       # Firebase configuration, google-services and service account files
├──/Theme/                      # Themes for the app
├── /Services/                  # ExpoPushNotifications
├── AuthContext.js              # User authentication context
├── NotificationTokenManager.js # Ensures that a valid token is available for notifications
├── ThemeContext.js             # Handles theme switching 
├── App.js                      # Main app entry point
└── package.json                # Project dependencies and scripts

```


## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request with any improvements or bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request

---

Feel free to adjust it as needed for your repository, such as updating the Firebase setup or the description.

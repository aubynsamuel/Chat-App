# 🔥 Flash Send (Real-Time Chat Application)

A real-time chat application built with **Expo Router**, **React Native**, and **Firebase**. This app delivers a seamless messaging experience with features like real-time updates, message caching, user presence, and multimedia messaging support.

## 📱 Key Features

- **Real-Time Messaging**: Instant message delivery powered by Firebase
- **Authentication**: Secure login/sign up system with Firebase Auth
- **Offline Support**: Local message caching for offline access
- **Rich Media**: Support for images, audio messages, and location sharing
- **Profile Management**: Customizable user profiles with profile pictures
- **Message Status**: Read receipts and message delivery status
- **Push Notifications**: Real-time notifications for new messages
- **Theme Support**: Multiple built-in themes with customizable chat backgrounds
- **Smart Caching**: Efficient data persistence using AsyncStorage
- **Type Safety**: Essential files are written in TypeScript for to limit error and bugs

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 14.x)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Firebase Project with Firestore and Authentication enabled

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aubynsamuel/Chat-App.git
   cd Chat-App
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Firebase:

   - Create a project in [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Create a file `env/firebaseConfig.js`:

   ```javascript
   import { initializeApp } from "firebase/app";
   import { initializeAuth, getReactNativePersistence } from "firebase/auth";
   import AsyncStorage from "@react-native-async-storage/async-storage";
   import { getFirestore, collection } from "firebase/firestore";
   import { getStorage } from "firebase/storage";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };

   const app = initializeApp(firebaseConfig);
   export const auth = initializeAuth(app, {
     persistence: getReactNativePersistence(AsyncStorage),
   });
   export const storage = getStorage(app);
   export const db = getFirestore(app);
   export const usersRef = collection(db, "users");
   export const roomRef = collection(db, "rooms");
   ```

4. Make sure to set up expo-notifications to be able to send and receive notifications. [Check Their Official Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/#configuration)

5. Create a development build:

   ```bash
   npx eas build --profile development --platform android
   ```

6. Start the Expo server and run the app on your device:

   ```bash
   npx expo start
   ```

## 📁 Project Structure

```File Structure
/Chat-App
├── app/                     # Expo Router navigation structure
│   ├── (auth)/              # Authentication-related screens
│   ├── (main)/              # Main app screens (protected routes)
│   │   ├── (homeStack)/     # Home-related screens
│   │   └── (profileStack)/  # Profile-related screens
│   ├── chatRoom/            # Chat room screen
│   └── _layout.tsx          # Root layout configuration
├── components/              # Reusable UI components
├── context/                 # React Context providers
│   ├── AuthContext.tsx      # Authentication state management
│   ├── ChatContext.tsx      # Chat-related state and functions
│   └── ThemeContext.tsx     # Theme management
├── Functions/               # Utility functions and helpers
├── Services/                # Backend services (notifications, etc.)
├── Theme/                   # Theme definitions and styles
└── env/                     # Environment configuration
```

## 🔑 Key Components

### Navigation

The app uses Expo Router for file-based navigation, organizing routes in the `app/` directory:

- `(auth)`: Login, sign up, and user details screens
- `(main)`: Protected routes accessible after authentication
- `chatRoom`: Dynamic chat room screen

### Context Providers/State Management

- `AuthContext`: Manages authentication state and user data
- `ChatContext`: Handles chat-related state and functions
- `ThemeContext`: Controls app theming and appearance
- `Zustand Stores`: Used Zustand to optimize performance and prevent unnecessary component re-rendering

### Features Implementation

- Real-time messaging using Firebase Firestore listeners
- Message caching with react-native-mmkv for offline support
- Push notifications via Expo Push Notifications
- Multi-theme support with dynamic theme switching
- Audio recording and playback functionality
- Image sharing and location sharing capabilities

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

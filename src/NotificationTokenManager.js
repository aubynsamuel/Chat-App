import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../env/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { deviceToken } from './services/ExpoPushNotifications';

const expoPushTokenRegex = /^ExponentPushToken\[[a-zA-Z0-9-_]+\]$/;

const NotificationTokenManager = {
  // Initialize and check for token changes
  async initializeAndUpdateToken(userId) {
    try {
      const newToken = deviceToken;

      if (!expoPushTokenRegex.test(newToken)) {
        console.warn('Invalid Expo push token format:', newToken);
        return;
      }

      const cachedToken = await AsyncStorage.getItem('deviceToken');

      if (cachedToken === newToken) {
        console.log('Token has not changed, no updates needed.');
        return;
      }

      await this.updateUserToken(userId, newToken);

    } catch (error) {
      console.error('Failed to initialize or update FCM token:', error);
    }
  },

  async updateUserToken(userId, token) {
    if (!userId || !token) {
      return;
    }
    try {

      if (!expoPushTokenRegex.test(token)) {
          console.warn('Invalid Expo push token format:', token);
          return;
      }
      
      const userDocRef = doc(db, 'users', userId);

      // Update only the deviceToken field
      await updateDoc(userDocRef, {
        deviceToken: token 
      });

      await AsyncStorage.setItem('deviceToken', token);
      console.log('FCM token updated and cached successfully.');
      console.log('User token updated.');
    } catch (error) {
      console.error('Error updating user token:', error);
    }
  },

  // Retrieve the stored token from AsyncStorage if needed
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem('deviceToken');
      return token || null;
    } catch (error) {
      console.error('Error retrieving token from AsyncStorage:', error);
      return null;
    }
  },
};

export default NotificationTokenManager;

import React from 'react';
import {AuthContextProvider, useAuth} from './AuthContext';
import Navigator from './navigation/navigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {MenuProvider} from 'react-native-popup-menu';

const App = () => {
  return (
    <AuthContextProvider>
      <MenuProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </MenuProvider>
    </AuthContextProvider>
  );
};

const AppContent = () => {
  const {isAuthenticated} = useAuth();
  return (
    <NavigationContainer>
      {console.log('isAuthenticated', isAuthenticated)}
      <Navigator />
    </NavigationContainer>
  );
};

export default App;

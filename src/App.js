import React from 'react';
import {AuthContextProvider, useAuth} from './AuthContext';
import Navigator from './navigation/navigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {MenuProvider} from 'react-native-popup-menu';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthContextProvider>
        <MenuProvider>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </MenuProvider>
      </AuthContextProvider>
    </GestureHandlerRootView>
  );
};

const AppContent = () => {
  const {isAuthenticated} = useAuth();
  return (
    <NavigationContainer>
      {console.log('isAuthenticated', isAuthenticated)}
      <Navigator />
      {changeNavigationBarColor('#f3f3f3', false)}
    </NavigationContainer>
  );
};

export default App;

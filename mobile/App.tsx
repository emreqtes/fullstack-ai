import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import PrivateChatsScreen from './src/screens/PrivateChatsScreen';
import PrivateChatScreen from './src/screens/PrivateChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Ana Sayfa', headerLeft: null }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Genel Sohbet' }}
        />
        <Stack.Screen 
          name="PrivateChats" 
          component={PrivateChatsScreen}
          options={{ title: 'Özel Mesajlar' }}
        />
        <Stack.Screen 
          name="PrivateChat" 
          component={PrivateChatScreen}
          options={({ route }) => ({ title: route.params?.otherUserName || 'Sohbet' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
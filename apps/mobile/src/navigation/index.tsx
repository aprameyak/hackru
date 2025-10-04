import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/Onboarding';
import { SwipeScreen } from '../screens/Swipe';
import { MatchesScreen } from '../screens/Matches';
import { ChatScreen } from '../screens/Chat';
import { ProfileScreen } from '../screens/Profile';

export type RootStackParamList = {
  Onboarding: undefined;
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string } | undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

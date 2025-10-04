import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/Onboarding';
import { SwipeScreen } from '../screens/Swipe';
import { MatchesScreen } from '../screens/Matches';
import { ProfileScreen } from '../screens/Profile';

export type RootStackParamList = {
  Onboarding: undefined;
  Swipe: undefined;
  Matches: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Swipe" 
          component={SwipeScreen} 
          options={{ title: "Find Roommates" }} 
        />
        <Stack.Screen 
          name="Matches" 
          component={MatchesScreen} 
          options={{ title: "Your Matches" }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: "Profile" }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

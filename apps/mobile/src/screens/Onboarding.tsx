import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Welcome to Roomi</Text>
      <Button title="Continue" onPress={() => navigation.replace('Swipe')} />
    </View>
  );
}

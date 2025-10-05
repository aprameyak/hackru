import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/app';
import { VoiceInput } from '../components/VoiceInput';
import { NLPService } from '../services/nlpService';

export function OnboardingScreen({ navigation }: Readonly<NativeStackScreenProps<RootStackParamList, 'Onboarding'>>) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [extractedPreferences, setExtractedPreferences] = useState<any>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const handleVoiceTranscript = (text: string) => {
    setVoiceTranscript(text);
    const preferences = NLPService.extractPreferences(text);
    setExtractedPreferences(preferences);
    
    // Auto-fill form fields based on extracted data
    if (preferences.budget) {
      // You could set a budget field if you have one
    }
    if (preferences.age) {
      // You could set an age field if you have one
    }
    if (preferences.location) {
      // You could set a location field if you have one
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Swipe');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Roomi</Text>
        <Text style={styles.subtitle}>Find your perfect roommate</Text>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.gray800}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.gray800}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.gray800}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>

        {!isLogin && (
          <View style={styles.voiceSection}>
            <Text style={styles.voiceSectionTitle}>🎤 Tell us about your preferences</Text>
            <Text style={styles.voiceSectionSubtitle}>
              Speak naturally about your budget, lifestyle, and what you're looking for in a roommate
            </Text>
            
            <TouchableOpacity
              style={styles.voiceToggleButton}
              onPress={() => setShowVoiceInput(!showVoiceInput)}
            >
              <Text style={styles.voiceToggleText}>
                {showVoiceInput ? 'Hide Voice Input' : 'Use Voice Input'}
              </Text>
            </TouchableOpacity>

            {showVoiceInput && (
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                placeholder="Example: 'I'm looking for a quiet roommate, budget around $1200, near University of Michigan, I like to study and keep things clean'"
              />
            )}

            {extractedPreferences && (
              <View style={styles.preferencesContainer}>
                <Text style={styles.preferencesTitle}>Detected Preferences:</Text>
                <Text style={styles.preferencesText}>
                  {NLPService.generateSummary(extractedPreferences)}
                </Text>
                <TouchableOpacity
                  style={styles.clearPreferencesButton}
                  onPress={() => {
                    setExtractedPreferences(null);
                    setVoiceTranscript('');
                  }}
                >
                  <Text style={styles.clearPreferencesText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: fontSizes.h1,
    fontFamily: fonts.heading,
    color: colors.brandBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
  },
  form: {
    paddingHorizontal: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    backgroundColor: colors.white,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.brandBlue,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: colors.brandBlue,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
  },
  voiceSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.brandBlue50,
    borderRadius: 16,
    marginHorizontal: 24,
  },
  voiceSectionTitle: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceSectionSubtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  voiceToggleButton: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceToggleText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  preferencesContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  preferencesTitle: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 8,
  },
  preferencesText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    lineHeight: 20,
    marginBottom: 12,
  },
  clearPreferencesButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  clearPreferencesText: {
    color: colors.gray800,
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
});
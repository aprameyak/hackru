import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { apiService } from '../services/api';
import { VoiceInput } from '../components/VoiceInput';
import { NLPService } from '../services/nlpService';

interface UserProfile {
  name: string;
  age: number;
  budget: number;
  location: string;
  lifestylePreferences: any;
  profileImage?: string;
  badges?: {
    universityVerified?: boolean;
  };
  verification?: {
    status: string;
    university?: string;
  };
}

export function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    age: 22,
    budget: 1200,
    location: 'University of Michigan',
    lifestylePreferences: {
      cleanliness: 'high',
      noise: 'quiet',
      guests: 'occasional',
      pets: 'none',
    },
    badges: {
      universityVerified: true,
    },
    verification: {
      status: 'verified',
      university: 'University of Michigan',
    },
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [extractedPreferences, setExtractedPreferences] = useState<any>(null);


  const saveProfile = async () => {
    setLoading(true);
    try {
      await apiService.createUser('current-user', profile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    try {
      await apiService.requestUniversityVerification(
        'current-user',
        'john.doe@umich.edu',
        'University of Michigan'
      );
      Alert.alert('Verification Requested', 'Check your email to complete verification');
    } catch (error) {
      console.error('Error requesting verification:', error);
      Alert.alert('Error', 'Failed to request verification');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    const preferences = NLPService.extractPreferences(text);
    setExtractedPreferences(preferences);
    
    // Auto-update profile based on extracted data
    if (preferences.budget) {
      setProfile(prev => ({ ...prev, budget: preferences.budget }));
    }
    if (preferences.age) {
      setProfile(prev => ({ ...prev, age: preferences.age }));
    }
    if (preferences.location) {
      setProfile(prev => ({ ...prev, location: preferences.location }));
    }
    if (preferences.lifestylePreferences) {
      setProfile(prev => ({ 
        ...prev, 
        lifestylePreferences: { ...prev.lifestylePreferences, ...preferences.lifestylePreferences }
      }));
    }
  };

  const renderBadge = (type: string) => {
    const badges = {
      verified: { text: '🎓 Verified Student', color: colors.accentMint },
      pending: { text: '⏳ Verification Pending', color: colors.accentOrange },
      none: { text: 'Verify University Email', color: colors.gray800 },
    };

    const badge = badges[type as keyof typeof badges] || badges.none;

    return (
      <View style={[styles.badge, { backgroundColor: badge.color }]}>
        <Text style={styles.badgeText}>{badge.text}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(!editing)}
        >
          <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: profile.profileImage || 'https://via.placeholder.com/150x150' }}
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.age}>{profile.age} years old</Text>
        <Text style={styles.location}>{profile.location}</Text>

        {renderBadge(profile.verification?.status || 'none')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={profile.budget.toString()}
            onChangeText={(text: string) => setProfile(prev => ({ ...prev, budget: parseInt(text) || 0 }))}
            keyboardType="numeric"
            placeholder="Monthly budget"
          />
        ) : (
          <Text style={styles.sectionValue}>${profile.budget}/month</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle Preferences</Text>
        <View style={styles.preferencesContainer}>
                {Object.entries(profile.lifestylePreferences).map(([key, value]) => (
                  <View key={key} style={styles.preferenceItem}>
                    <Text style={styles.preferenceKey}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                    <Text style={styles.preferenceValue}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                  </View>
                ))}
        </View>
      </View>

      {!profile.badges?.universityVerified && (
        <View style={styles.verificationSection}>
          <Text style={styles.verificationTitle}>University Verification</Text>
          <Text style={styles.verificationText}>
            Verify your university email to build trust with other students
          </Text>
          <TouchableOpacity style={styles.verifyButton} onPress={requestVerification}>
            <Text style={styles.verifyButtonText}>Request Verification</Text>
          </TouchableOpacity>
        </View>
      )}

      {editing && (
        <View style={styles.voiceSection}>
          <Text style={styles.voiceSectionTitle}>🎤 Update with Voice</Text>
          <Text style={styles.voiceSectionSubtitle}>
            Speak naturally to update your preferences
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
              placeholder="Example: 'I prefer a quiet environment, budget around $1000, I like to keep things clean'"
            />
          )}

          {extractedPreferences && (
            <View style={styles.voicePreferencesContainer}>
              <Text style={styles.preferencesTitle}>Detected Changes:</Text>
              <Text style={styles.preferencesText}>
                {NLPService.generateSummary(extractedPreferences)}
              </Text>
              <TouchableOpacity
                style={styles.clearPreferencesButton}
                onPress={() => setExtractedPreferences(null)}
              >
                <Text style={styles.clearPreferencesText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {editing && (
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: fontSizes.h1,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
  },
  name: {
    fontSize: fontSizes.h2,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 4,
  },
  age: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginBottom: 8,
  },
  location: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.brandBlue,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray100,
    borderRadius: 8,
    padding: 12,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    backgroundColor: colors.white,
  },
  preferencesContainer: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  preferenceKey: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    fontWeight: '500',
  },
  preferenceValue: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.brandBlue,
    fontWeight: '600',
  },
  verificationSection: {
    margin: 24,
    padding: 20,
    backgroundColor: colors.brandBlue50,
    borderRadius: 12,
  },
  verificationTitle: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginBottom: 16,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  saveSection: {
    padding: 24,
  },
  saveButton: {
    backgroundColor: colors.brandBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray800,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  voiceSection: {
    margin: 24,
    padding: 20,
    backgroundColor: colors.brandBlue50,
    borderRadius: 16,
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
  voicePreferencesContainer: {
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

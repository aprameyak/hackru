import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Voice from '@react-native-community/voice';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface VoiceInputProps {
  readonly onTranscript: (text: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function VoiceInput({ onTranscript, placeholder = "Tap to speak your preferences", disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Initialize voice recognition
    Voice.onSpeechStart = () => {
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const spokenText = e.value[0];
        setTranscript(spokenText);
        onTranscript(spokenText);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
      Alert.alert('Voice Error', 'Sorry, I couldn\'t understand. Please try again.');
    };

    // Check if voice recognition is available
    Voice.isAvailable().then((available: boolean) => setIsAvailable(available));

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onTranscript]);

  const startListening = async () => {
    try {
      setTranscript('');
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Voice recognition is not available');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (isAvailable === false) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>Voice input not available on this device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.voiceButtonActive,
          disabled && styles.voiceButtonDisabled
        ]}
        onPress={toggleListening}
        disabled={disabled}
      >
        <Text style={styles.voiceButtonText}>
          {isListening ? '🎤 Listening...' : '🎤 Tap to Speak'}
        </Text>
      </TouchableOpacity>
      
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
      
      <Text style={styles.placeholderText}>{placeholder}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.accentMint,
  },
  voiceButtonDisabled: {
    backgroundColor: colors.gray100,
    opacity: 0.6,
  },
  voiceButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  transcriptContainer: {
    backgroundColor: colors.brandBlue50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  transcriptLabel: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginBottom: 8,
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    color: colors.gray800,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unavailableContainer: {
    padding: 20,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    textAlign: 'center',
  },
});

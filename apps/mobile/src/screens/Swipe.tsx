import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { apiService } from '../services/api';

interface Candidate {
  id: string;
  name: string;
  age: number;
  budget: number;
  location: string;
  lifestylePreferences: any;
  profileImage?: string;
  badges?: {
    universityVerified?: boolean;
  };
  score: number;
}

export function SwipeScreen() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      // Mock data for now since API might not have users yet
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          age: 22,
          budget: 1200,
          location: 'University of Michigan',
          lifestylePreferences: { cleanliness: 'high', noise: 'quiet' },
          score: 85,
          badges: { universityVerified: true }
        },
        {
          id: '2',
          name: 'Alex Chen',
          age: 21,
          budget: 1000,
          location: 'Ann Arbor',
          lifestylePreferences: { pets: 'none', guests: 'occasional' },
          score: 92
        }
      ];
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (candidate: Candidate) => {
    try {
      await apiService.likeUser('current-user', candidate.id);
      setCandidates(prev => prev.filter(c => c.id !== candidate.id));
      Alert.alert('Liked!', `You liked ${candidate.name}`);
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handlePass = async (candidate: Candidate) => {
    try {
      await apiService.passUser('current-user', candidate.id);
      setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more candidates</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadCandidates}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {candidates.map((candidate) => (
        <View key={candidate.id} style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: candidate.profileImage || 'https://via.placeholder.com/300x200' }}
              style={styles.profileImage}
            />
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{candidate.score}%</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.header}>
              <Text style={styles.name}>{candidate.name}, {candidate.age}</Text>
              {candidate.badges?.universityVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>🎓 Verified</Text>
                </View>
              )}
            </View>

            <Text style={styles.location}>{candidate.location}</Text>
            <Text style={styles.budget}>Budget: ${candidate.budget}/month</Text>

            <View style={styles.lifestyleContainer}>
              <Text style={styles.lifestyleTitle}>Lifestyle:</Text>
              <View style={styles.lifestyleTags}>
                {Object.entries(candidate.lifestylePreferences || {}).map(([key, value]) => (
                  <View key={key} style={styles.lifestyleTag}>
                    <Text style={styles.lifestyleText}>{key}: {String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.passButton} 
                onPress={() => handlePass(candidate)}
              >
                <Text style={styles.passButtonText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.likeButton} 
                onPress={() => handleLike(candidate)}
              >
                <Text style={styles.likeButtonText}>Like</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scoreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: colors.white,
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: colors.accentMint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: colors.white,
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  location: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginBottom: 4,
  },
  budget: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.brandBlue,
    fontWeight: '600',
    marginBottom: 16,
  },
  lifestyleContainer: {
    marginTop: 8,
  },
  lifestyleTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 8,
  },
  lifestyleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lifestyleTag: {
    backgroundColor: colors.brandBlue50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  lifestyleText: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    color: colors.brandBlue,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  passButton: {
    flex: 0.45,
    backgroundColor: colors.gray100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  passButtonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    fontWeight: '600',
  },
  likeButton: {
    flex: 0.45,
    backgroundColor: colors.brandBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  likeButtonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.white,
    fontWeight: '600',
  },
});

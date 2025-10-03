import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

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
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1'}/getTopCandidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user', limit: 20 }),
      });
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (cardIndex: number) => {
    const candidate = candidates[cardIndex];
    if (!candidate) return;

    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1'}/likeUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: 'current-user',
          toUserId: candidate.id,
        }),
      });
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handleSwipeLeft = async (cardIndex: number) => {
    const candidate = candidates[cardIndex];
    if (!candidate) return;

    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1'}/passUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: 'current-user',
          toUserId: candidate.id,
        }),
      });
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };

  const renderCard = (candidate: Candidate, index: number) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: candidate.profileImage || 'https://via.placeholder.com/300x400' }}
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
        </View>
      </View>
    );
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
    <View style={styles.container}>
      <Swiper
        cards={candidates}
        renderCard={renderCard}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwipedAll={() => setCandidates([])}
        cardIndex={currentIndex}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={15}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
      />
    </View>
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
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 40,
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
});
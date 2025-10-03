import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

interface Match {
  id: string;
  userA: string;
  userB: string;
  score: number;
  status: string;
  createdAt: any;
  userProfile?: {
    name: string;
    age: number;
    profileImage?: string;
    location: string;
  };
}

export function MatchesScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Matches'>) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1'}/listRooms`);
      const data = await response.json();
      
      const mockMatches: Match[] = [
        {
          id: '1',
          userA: 'current-user',
          userB: 'user-2',
          score: 85,
          status: 'matched',
          createdAt: new Date(),
          userProfile: {
            name: 'Sarah Johnson',
            age: 22,
            location: 'University of Michigan',
            profileImage: 'https://via.placeholder.com/100x100',
          },
        },
        {
          id: '2',
          userA: 'current-user',
          userB: 'user-3',
          score: 92,
          status: 'matched',
          createdAt: new Date(),
          userProfile: {
            name: 'Alex Chen',
            age: 21,
            location: 'University of Michigan',
            profileImage: 'https://via.placeholder.com/100x100',
          },
        },
      ];
      
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (match: Match) => {
    navigation.navigate('Chat', { matchId: match.id });
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchCard} onPress={() => openChat(item)}>
      <Image
        source={{ uri: item.userProfile?.profileImage || 'https://via.placeholder.com/100x100' }}
        style={styles.profileImage}
      />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.userProfile?.name}</Text>
        <Text style={styles.matchLocation}>{item.userProfile?.location}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.score}% match</Text>
        </View>
      </View>
      <View style={styles.chatButton}>
        <Text style={styles.chatButtonText}>💬</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No matches yet</Text>
        <Text style={styles.emptySubtitle}>Keep swiping to find your perfect roommate!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>{matches.length} mutual matches</Text>
      </View>
      
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: fontSizes.h2,
    fontFamily: fonts.heading,
    color: colors.gray800,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSizes.h1,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: fontSizes.h3,
    fontFamily: fonts.heading,
    color: colors.gray800,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: fontSizes.body,
    fontFamily: fonts.body,
    color: colors.gray800,
    marginBottom: 8,
  },
  scoreContainer: {
    backgroundColor: colors.brandBlue50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scoreText: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    color: colors.brandBlue,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: colors.brandBlue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 16,
  },
});

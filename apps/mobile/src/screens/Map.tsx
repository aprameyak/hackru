import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';

interface Room {
  id: string;
  title: string;
  price: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  amenities: string[];
  distance?: number;
}

export function MapScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadRooms();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { Location } = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1'}/listRooms`);
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const roomsWithDistance = rooms.map(room => {
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        room.location.latitude,
        room.location.longitude
      );
      return { ...room, distance };
    }
    return room;
  });

  const onMarkerPress = (room: Room) => {
    setSelectedRoom(room);
  };

  const onRoomSelect = (room: Room) => {
    Alert.alert(
      room.title,
      `$${room.price}/month\n${room.address}\n\nAmenities: ${room.amenities.join(', ')}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 37.78825,
          longitude: userLocation?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {roomsWithDistance.map((room) => (
          <Marker
            key={room.id}
            coordinate={room.location}
            title={room.title}
            description={`$${room.price}/month`}
            onPress={() => onMarkerPress(room)}
          />
        ))}
      </MapView>

      {selectedRoom && (
        <View style={styles.roomCard}>
          <Text style={styles.roomTitle}>{selectedRoom.title}</Text>
          <Text style={styles.roomPrice}>${selectedRoom.price}/month</Text>
          <Text style={styles.roomAddress}>{selectedRoom.address}</Text>
          {selectedRoom.distance && (
            <Text style={styles.roomDistance}>
              {selectedRoom.distance.toFixed(1)} km away
            </Text>
          )}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onRoomSelect(selectedRoom)}
          >
            <Text style={styles.selectButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  roomCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  roomPrice: {
    fontSize: 16,
    color: colors.brandBlue,
    fontWeight: '600',
  },
  roomAddress: {
    fontSize: 14,
    color: colors.gray800,
    marginTop: 4,
  },
  roomDistance: {
    fontSize: 12,
    color: colors.gray800,
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: colors.brandBlue,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

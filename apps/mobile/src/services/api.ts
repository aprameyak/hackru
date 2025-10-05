// API Service for Roomi App
// This service handles all API calls to the backend

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/hackru/us-central1';

export const apiService = {
  // User management
  async createUser(userId: string, userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...userData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Swiping functionality
  async likeUser(currentUserId: string, targetUserId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/likeUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId,
          targetUserId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error liking user:', error);
      throw error;
    }
  },

  async passUser(currentUserId: string, targetUserId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/passUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId,
          targetUserId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error passing user:', error);
      throw error;
    }
  },

  // Get potential matches
  async getCandidates(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/getCandidates?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting candidates:', error);
      throw error;
    }
  },

  // Get user matches
  async getMatches(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/getMatches?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting matches:', error);
      throw error;
    }
  },

  // University verification
  async requestUniversityVerification(userId: string, email: string, university: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/requestUniversityVerification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          university,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error requesting university verification:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId: string, profileData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/updateProfile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...profileData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};

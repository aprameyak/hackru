import { API_BASE_URL } from '../firebase/app';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  university?: string;
  budget?: number;
  location?: string;
  leaseDuration?: string;
  lifestylePreferences?: Record<string, any>;
  profilePicture?: string;
  verification?: {
    status: 'pending' | 'verified' | 'rejected';
    email?: string;
    domain?: string;
    eduDomain?: boolean;
    university?: string;
    requestedAt?: any;
    verifiedAt?: any;
  };
  badges?: {
    universityVerified?: boolean;
  };
}

export interface Room {
  id: string;
  title: string;
  description: string;
  location: string;
  rent: number;
  availableFrom: string;
  images: string[];
  amenities: string[];
  createdBy: string;
}

export interface Match {
  id: string;
  userA: string;
  userB: string;
  score: number;
  status: 'pending' | 'matched';
  createdAt: any;
}

export interface Candidate {
  id: string;
  score: number;
  profile: User;
}

export interface Message {
  sender: string;
  text: string;
  timestamp: any;
}

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // User management
  async createUser(userId: string, profile: Partial<User>): Promise<{ ok: boolean }> {
    return this.request('/createUser', {
      method: 'POST',
      body: JSON.stringify({ userId, profile }),
    });
  }

  // Room management
  async listRooms(): Promise<{ rooms: Room[] }> {
    return this.request('/listRooms');
  }

  // Matching system
  async getTopCandidates(userId: string, limit: number = 20): Promise<{ candidates: Candidate[] }> {
    return this.request('/getTopCandidates', {
      method: 'POST',
      body: JSON.stringify({ userId, limit }),
    });
  }

  async likeUser(fromUserId: string, toUserId: string): Promise<{ matched: boolean; score?: number }> {
    return this.request('/likeUser', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUserId }),
    });
  }

  async passUser(fromUserId: string, toUserId: string): Promise<{ ok: boolean }> {
    return this.request('/passUser', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUserId }),
    });
  }

  // Match management
  async createMatch(
    userA: string,
    userB: string,
    score: number,
    status: string = 'pending'
  ): Promise<{ id: string }> {
    return this.request('/createMatch', {
      method: 'POST',
      body: JSON.stringify({ userA, userB, score, status }),
    });
  }

  // Messaging
  async postMessage(
    conversationId: string,
    sender: string,
    text: string,
    timestamp?: any
  ): Promise<{ ok: boolean }> {
    return this.request('/postMessage', {
      method: 'POST',
      body: JSON.stringify({ conversationId, sender, text, timestamp }),
    });
  }

  // University verification
  async requestUniversityVerification(
    userId: string,
    email: string,
    university?: string
  ): Promise<{ ok: boolean; eduDomain: boolean }> {
    return this.request('/requestUniversityVerification', {
      method: 'POST',
      body: JSON.stringify({ userId, email, university }),
    });
  }

  async confirmUniversityVerification(userId: string): Promise<{ ok: boolean }> {
    return this.request('/confirmUniversityVerification', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async submitStudentId(userId: string, storagePath: string): Promise<{ ok: boolean }> {
    return this.request('/submitStudentId', {
      method: 'POST',
      body: JSON.stringify({ userId, storagePath }),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
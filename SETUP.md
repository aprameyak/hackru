# Roomi App Setup Guide

## Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- Firebase CLI: `npm install -g firebase-tools`
- Xcode (for iOS simulator)
- Expo Go app on your phone (optional)

## 1. Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "hackru" (or your preferred name)
4. Enable Google Analytics (optional)
5. Note your **Project ID** (you'll need this)

### Enable Services
1. **Authentication**: Go to Authentication → Sign-in method → Enable Email/Password and Google
2. **Firestore**: Go to Firestore Database → Create database → Start in test mode
3. **Storage**: Go to Storage → Get started → Start in test mode
4. **Functions**: Go to Functions → Get started

### Get API Keys
1. Go to Project Settings (gear icon) → General tab
2. Scroll to "Your apps" → Add app → Web app
3. Register app with name "Roomi Web"
4. Copy the config object - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "hackru-xxxxx.firebaseapp.com",
  projectId: "hackru-xxxxx",
  storageBucket: "hackru-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 2. Backend Configuration

### Update Firebase Config
1. Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

2. Build and deploy functions:
```bash
cd functions
npm run build
cd ..
firebase login
firebase deploy --only functions
```

### Test Backend
```bash
# Start emulators locally
npm run emulators

# Test health endpoint
curl http://localhost:5001/your-project-id/us-central1/health
```

## 3. Frontend Configuration

### Environment Variables
Create `apps/mobile/.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=hackru-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=hackru-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=hackru-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Copy the **Client ID** to your `.env` file

### Update Firebase Config
Edit `apps/mobile/src/firebase/app.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

## 4. Run the App

### Start Backend (Terminal 1)
```bash
cd /Users/aprameyakannan/Documents/GitHub/hackru
npm run emulators
```

### Start Frontend (Terminal 2)
```bash
cd apps/mobile
npm install
npm run ios
```

### Alternative: Expo Go
```bash
cd apps/mobile
npx expo start
# Scan QR code with Expo Go app
```

## 5. iOS Simulator Setup

### Install Dependencies
```bash
cd apps/mobile
npx expo install expo-location expo-image-picker
```

### Configure Permissions
Add to `apps/mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "This app needs access to location to show nearby rooms."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you upload profile pictures."
        }
      ]
    ]
  }
}
```

## 6. Testing the App

### 1. Authentication
- Sign up with email/password
- Try Google OAuth
- Verify university email

### 2. Profile Creation
- Upload profile picture
- Set budget and preferences
- Request university verification

### 3. Swiping
- Swipe through candidate cards
- Check compatibility scores
- Like/pass users

### 4. Matches & Chat
- View matches list
- Open chat conversations
- Send messages

### 5. Maps
- View room locations
- Check distances
- Filter by preferences

## 7. Production Deployment

### Deploy Backend
```bash
firebase deploy --only functions,firestore,storage
```

### Deploy Frontend
```bash
cd apps/mobile
npx expo build:ios
# Or for web: npx expo build:web
```

## 8. Troubleshooting

### Common Issues

**Functions not loading:**
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

**Auth not working:**
- Check API keys in `.env`
- Verify Firebase Auth is enabled
- Check Google OAuth client ID

**Maps not showing:**
- Add Google Maps API key to `app.json`
- Enable Maps SDK in Google Cloud Console

**Images not uploading:**
- Check Storage rules in Firebase Console
- Verify Storage is enabled

### Debug Commands
```bash
# Check emulator status
firebase emulators:list

# View logs
firebase emulators:start --debug

# Reset emulators
firebase emulators:start --import=./emulator-data --export-on-exit
```

## 9. API Endpoints

### Local Development
- Functions: `http://localhost:5001/your-project-id/us-central1/`
- Firestore: `http://localhost:8080`
- UI: `http://localhost:4000`

### Production
- Functions: `https://us-central1-your-project-id.cloudfunctions.net/`

### Available Endpoints
- `GET /health` - Health check
- `POST /createUser` - Create user profile
- `GET /listRooms` - Get room listings
- `POST /getTopCandidates` - Get matching candidates
- `POST /likeUser` - Like a user
- `POST /passUser` - Pass on a user
- `POST /postMessage` - Send message
- `POST /requestUniversityVerification` - Request verification
- `POST /confirmUniversityVerification` - Confirm verification
- `POST /submitStudentId` - Submit student ID

## 10. Next Steps

1. **Add Push Notifications**: Configure FCM for match/message alerts
2. **Add Video Calls**: Integrate WebRTC for video chats
3. **Add Payment**: Stripe integration for premium features
4. **Add Analytics**: Firebase Analytics for user behavior
5. **Add Testing**: Jest/Detox for automated testing

## Support

- Firebase Docs: https://firebase.google.com/docs
- Expo Docs: https://docs.expo.dev
- React Navigation: https://reactnavigation.org
- React Native Maps: https://github.com/react-native-maps/react-native-maps

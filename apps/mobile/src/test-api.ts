import { apiService } from './services/api';

// Test the API integration
export async function testApiIntegration() {
  console.log('🧪 Testing Roomi API Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await apiService.health();
    console.log('✅ Health check:', healthResponse);

    // Test 2: List Rooms
    console.log('\n2. Testing list rooms endpoint...');
    const roomsResponse = await apiService.listRooms();
    console.log('✅ Rooms response:', roomsResponse);

    // Test 3: Test error handling with invalid user ID
    console.log('\n3. Testing get candidates endpoint (should handle no user gracefully)...');
    try {
      const candidatesResponse = await apiService.getTopCandidates('test-user-id', 5);
      console.log('⚠️  Candidates response (expected 404):', candidatesResponse);
    } catch (error) {
      console.log('✅ Expected error for non-existent user:', (error as Error).message);
    }

    console.log('\n🎉 API Integration Test Complete!');
    console.log('\nNext steps:');
    console.log('1. Enable Authentication in Firebase Console: https://console.firebase.google.com/project/hackru-3e4db/authentication');
    console.log('2. Enable Storage in Firebase Console: https://console.firebase.google.com/project/hackru-3e4db/storage');
    console.log('3. Set up Google OAuth credentials in Google Cloud Console');
    
  } catch (error) {
    console.error('❌ API Integration test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApiIntegration();
}
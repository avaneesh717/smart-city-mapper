const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test API endpoints
async function testAPI() {
  console.log('🧪 Testing Smart City Mapper API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test register endpoint
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ User registered:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Test login endpoint
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ User logged in:', loginResponse.data.message);
    const token = loginResponse.data.data.token;

    // Test get complaints endpoint
    console.log('\n4. Testing get complaints...');
    const complaintsResponse = await axios.get(`${BASE_URL}/complaints`);
    console.log('✅ Complaints retrieved:', complaintsResponse.data.count, 'complaints found');

    // Test create complaint endpoint
    console.log('\n5. Testing create complaint...');
    const complaintData = {
      title: 'Test Road Issue',
      description: 'This is a test complaint for road repair',
      category: 'Road Issues',
      priority: 'Medium',
      location: {
        address: '123 Test Street, Test City',
        coordinates: {
          latitude: 19.0760,
          longitude: 72.8777
        },
        city: 'Mumbai',
        pincode: '400001'
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/complaints`, complaintData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Complaint created:', createResponse.data.message);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('   - MongoDB is running');
    console.log('   - Backend server is running (npm run dev)');
    console.log('   - .env file is configured');
  }
}

// Run tests
testAPI();

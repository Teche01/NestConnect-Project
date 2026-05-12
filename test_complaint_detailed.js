const axios = require('axios');

const testComplaint = async () => {
  try {
    console.log('[TEST] Logging in as resident...');
    
    // Step 1: Login first to get auth token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'jasminesameera7@gmail.com',
      password: '123456'
    });
    
    console.log('[TEST] Login successful, token:', loginResponse.data.token.substring(0, 20) + '...');
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Submit test complaint
    console.log('[TEST] Submitting test complaint...');
    
    const response = await axios.post('http://localhost:5000/api/complaints', {
      title: 'Electricity cut off completely',
      description: 'The power supply is completely cut off from my entire apartment'
    }, { headers });
    
    console.log('[TEST] Response Status:', response.status);
    console.log('[TEST] Response Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('[TEST] Error:', err.message);
    if (err.response) {
      console.error('[TEST] Response Status:', err.response.status);
      console.error('[TEST] Response Data:', JSON.stringify(err.response.data, null, 2));
    }
  }
};

testComplaint();

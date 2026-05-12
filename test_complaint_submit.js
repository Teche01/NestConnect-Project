const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

async function testComplaintSubmission() {
  try {
    console.log('🔍 Testing complaint submission...');

    // First, try to login with different users
    console.log('\n1. Attempting login...');
    const testUsers = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'jasminesameera7@gmail.com', password: 'password123' },
      { email: 'trisha@gmail.com', password: 'password123' },
      { email: 'admin@community.com', password: 'password123' },
      { email: 'resident@test.com', password: 'password123' }
    ];

    let loginRes;
    let token;

    for (const user of testUsers) {
      try {
        console.log(`   Trying ${user.email}...`);
        loginRes = await api.post('/auth/login', user);
        token = loginRes.data.token;
        console.log(`✅ Login successful with ${user.email}`);
        break;
      } catch (loginErr) {
        console.log(`   ❌ ${user.email} failed: ${loginErr.response?.data?.message}`);
      }
    }

    if (!token) {
      throw new Error('All login attempts failed');
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    // Now try to submit a complaint
    console.log('\n2. Submitting personal complaint...');
    const formData = new FormData();
    formData.append('title', 'Test Complaint - Water Leak');
    formData.append('description', 'There is a water leak in my bathroom sink');
    formData.append('preferred_time', '2026-04-02T14:00:00');
    formData.append('is_general_issue', 'false');

    const complaintRes = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Complaint submitted successfully!');
    console.log('   ID:', complaintRes.data.id);
    console.log('   Category:', complaintRes.data.category);
    console.log('   Status:', complaintRes.data.status);
    console.log('   Worker:', complaintRes.data.assigned_worker_name);

    // Test general complaint
    console.log('\n3. Submitting general complaint...');
    const generalFormData = new FormData();
    generalFormData.append('title', 'General Issue - Power Outage');
    generalFormData.append('description', 'Power outage in the entire building');
    generalFormData.append('is_general_issue', 'true');

    const generalRes = await api.post('/complaints', generalFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ General complaint submitted successfully!');
    console.log('   ID:', generalRes.data.id);
    console.log('   Category:', generalRes.data.category);
    console.log('   Status:', generalRes.data.status);

  } catch (err) {
    console.error('❌ Error occurred:');
    console.error('   Status:', err.response?.status);
    console.error('   Message:', err.response?.data?.message);
    console.error('   Error:', err.response?.data?.error);
    console.error('   Full response:', err.response?.data);
    console.error('   Network error:', err.message);
  }
}

testComplaintSubmission();

const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

async function test() {
  try {
    console.log('1. Testing login with resident test credentials...');
    const loginRes = await api.post('/auth/login', {
      email: 'resident@test.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // Set token for subsequent requests
    api.defaults.headers.Authorization = `Bearer ${token}`;
    
    console.log('\n2. Testing complaint submission (personal)...');
    const complaintRes = await api.post('/complaints', {
      title: 'Test Complaint',
      description: 'This is a test complaint for water leaking from the ceiling',
      preferred_time: '2026-04-02T10:00:00',
      is_general_issue: false
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Complaint submitted successfully');
    console.log('   Complaint ID:', complaintRes.data.id);
    console.log('   Category:', complaintRes.data.category);
    console.log('   Status:', complaintRes.data.status);
    console.log('   Assigned Worker:', complaintRes.data.assigned_worker_name);
    
    console.log('\n3. Testing general complaint submission...');
    const generalRes = await api.post('/complaints', {
      title: 'General Issue',
      description: 'This is a general complaint affecting the whole community',
      is_general_issue: true
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ General complaint submitted successfully');
    console.log('   Complaint ID:', generalRes.data.id);
    console.log('   Category:', generalRes.data.category);
    console.log('   Status:', generalRes.data.status);
    console.log('   Message:', generalRes.data.message);
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data?.message || err.message);
    if (err.response?.data?.error) {
      console.error('   Details:', err.response.data.error);
    }
  }
}

test();

const axios = require('axios');

async function testCleaningComplaint() {
  try {
    console.log('Creating test complaint with "Cleaning" keyword...\n');
    
    // Create a new complaint with cleaning-related keywords
    const response = await axios.post('http://localhost:5000/api/complaints/create', {
      title: 'Cleaning required urgently',
      description: 'The common area needs immediate cleaning and maintenance',
      location: 'Building A - Common Area',
      resident_id: 1  // Using existing resident
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✓ Complaint Created Successfully!\n');
    console.log('Response:', response.data);
    
    if (response.data.id) {
      // Check database for the complaint
      const query = `SELECT id, title, description, ai_category, status, worker_id FROM complaints WHERE id = ${response.data.id}`;
      console.log('\n✓ Final Check - Query: ' + query);
      console.log('Expected ai_category: "Cleaning" (not "Others")');
      console.log('Expected worker_id: Should be assigned to a Cleaning worker (26=Lakshmi or 27=Radha)');
    }
  } catch (error) {
    console.error('Error creating complaint:', error.response?.data || error.message);
  }
}

testCleaningComplaint();

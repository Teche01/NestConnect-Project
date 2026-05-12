const axios = require('axios');

(async () => {
  try {
    const AI_SERVICE_URL = 'http://localhost:8000';
    console.log('[AI-TEST] Testing AI service...');
    console.log('[AI-TEST] AI_SERVICE_URL:', AI_SERVICE_URL);
    
    // Test 1: Health check
    console.log('[AI-TEST] Checking AI service health...');
    const healthResponse = await axios.get(`${AI_SERVICE_URL}/health`);
    console.log('[AI-TEST] Health check response:', healthResponse.status, healthResponse.data);
    
    // Test 2: Predict category for "electricity cut off"
    console.log('[AI-TEST] Testing category prediction...');
    const categoryResponse = await axios.post(`${AI_SERVICE_URL}/predict-category`, {
      description: 'The power supply is completely cut off from my entire apartment'
    });
    console.log('[AI-TEST] Category prediction response:', JSON.stringify(categoryResponse.data, null, 2));
    
    // Test 3: Full analysis
    console.log('[AI-TEST] Testing full analysis...');
    const analysisResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      title: 'Electricity cut off',
      description: 'Power is cut off',
      category: 'Electrical'
    });
    console.log('[AI-TEST] Analysis response:', JSON.stringify(analysisResponse.data, null, 2));
    
  } catch (err) {
    console.error('[AI-TEST] Error:', err.message);
    if (err.response) {
      console.error('[AI-TEST] Response Status:', err.response.status);
      console.error('[AI-TEST] Response Data:', err.response.data);
    }
    if (err.code) {
      console.error('[AI-TEST] Error Code:', err.code);
    }
  }
  process.exit(0);
})();

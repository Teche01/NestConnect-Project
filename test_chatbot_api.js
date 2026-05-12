const axios = require('axios');

(async () => {
  try {
    console.log('[CHATBOT-TEST] Testing chatbot API...\n');
    
    const testCases = [
      'how to raise complaint',
      'complaint status',
      'emergency',
      'worker',
      'help',
      'random message'
    ];
    
    for (const message of testCases) {
      try {
        const response = await axios.post('http://localhost:5000/api/chatbot', {
          message: message
        });
        
        console.log(`📝 Query: "${message}"`);
        console.log(`✓ Response: ${response.data.reply.substring(0, 80)}...\n`);
      } catch (err) {
        console.error(`✗ Error for "${message}":`, err.message);
      }
    }
    
    console.log('[CHATBOT-TEST] ✓ All tests completed!');
  } catch (error) {
    console.error('[CHATBOT-TEST] Error:', error.message);
  }
  process.exit(0);
})();

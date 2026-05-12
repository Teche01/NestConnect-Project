// Test the actual API response
async function testPaymentAPI() {
  try {
    console.log('Testing Payment API Response...\n');

    // First, we need to get a valid token
    // Login as resident
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'resident@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log('Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✓ Logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Now fetch payment details for complaint 46 (has Lakshmi with QR)
    console.log('Fetching payment details for complaint 46...\n');
    const paymentRes = await fetch('http://localhost:5000/api/work/payment/46', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const paymentData = await paymentRes.json();
    
    if (paymentData.success) {
      console.log('✓ API Response Successful!\n');
      console.log('=== RESPONSE DATA ===\n');
      console.log(JSON.stringify(paymentData.data, null, 2));
      
      console.log('\n=== QR IMAGE PATH ===');
      console.log('QR Image from API:', paymentData.data.qr_image);
      console.log('Expected path:', 'http://localhost:5000/uploads/worker_profiles/1774359501274-ks3brr-QR.jpg');
      
    } else {
      console.log('✗ API Response Error:', paymentData);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testPaymentAPI();

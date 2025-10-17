// Simple test to verify form submission API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4173';

async function testFormSubmission() {
  console.log('🧪 Testing Form Submission API...\n');

  const testData = {
    form_id: 'contact-modal',
    form_name: 'Contact Modal Form',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+65 1234 5678',
    company: 'Test Company',
    message: 'This is a test message from the form submission test.',
    ip_address: '127.0.0.1',
    user_agent: 'Test User Agent'
  };

  try {
    console.log('📝 Submitting test form data...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_BASE}/api/form-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`\n📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS! Form submitted successfully');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      
      // Test fetching the data back
      console.log('\n🔍 Testing data retrieval...');
      const fetchResponse = await fetch(`${API_BASE}/api/form-submissions/all`);
      
      if (fetchResponse.ok) {
        const submissions = await fetchResponse.json();
        console.log(`✅ Found ${submissions.length} form submissions in database`);
        
        // Show the latest submission
        if (submissions.length > 0) {
          const latest = submissions[0];
          console.log('📋 Latest submission:');
          console.log(`   Name: ${latest.name}`);
          console.log(`   Email: ${latest.email}`);
          console.log(`   Company: ${latest.company || 'N/A'}`);
          console.log(`   Message: ${latest.message}`);
          console.log(`   Date: ${latest.submitted_at}`);
        }
      } else {
        console.log('❌ Failed to fetch submissions');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED! Form submission failed');
      console.log('📄 Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ ERROR! Network or other error occurred');
    console.log('📄 Error:', error.message);
  }

  console.log('\n🎯 Test completed!');
  console.log('💡 If successful, the form data should appear in your Leads Manager');
}

testFormSubmission();

// Test script to submit sample contact form data
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4173';

const sampleSubmissions = [
  {
    form_id: 'homepage_contact',
    form_name: 'Homepage Contact Form',
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+65 9123 4567',
    company: 'Tech Corp Pte Ltd',
    message: 'Hi, I\'m interested in your SEO services for our e-commerce website. We currently have about 10,000 products and are looking to improve our organic search rankings.'
  },
  {
    form_id: 'homepage_contact',
    form_name: 'Homepage Contact Form',
    name: 'Sarah Lee',
    email: 'sarah@startup.sg',
    phone: '+65 8765 4321',
    company: 'StartupSG',
    message: 'We\'re a fintech startup looking for comprehensive digital marketing strategy. Our budget is around $15,000/month.'
  },
  {
    form_id: 'homepage_contact',
    form_name: 'Homepage Contact Form',
    name: 'Michael Wong',
    email: 'michael@enterprise.com',
    phone: '',
    company: 'Enterprise Solutions',
    message: 'Looking for SEO audit and strategy for our B2B SaaS platform.'
  }
];

async function testContactForm() {
  console.log('🧪 Testing Contact Form Submissions...\n');

  for (let i = 0; i < sampleSubmissions.length; i++) {
    const submission = sampleSubmissions[i];
    
    try {
      console.log(`📝 Submitting form ${i + 1}/3: ${submission.name}`);
      
      const response = await fetch(`${API_BASE}/api/form-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success: Form submission ID ${result.id}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Wait a bit between submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🔍 Testing API endpoints...');
  
  try {
    // Test fetching all form submissions
    const leadsResponse = await fetch(`${API_BASE}/api/form-submissions/all`);
    if (leadsResponse.ok) {
      const leads = await leadsResponse.json();
      console.log(`✅ Leads API: Found ${leads.length} form submissions`);
    } else {
      console.log(`❌ Leads API failed: ${leadsResponse.status}`);
    }

    // Test fetching all contacts
    const contactsResponse = await fetch(`${API_BASE}/api/contacts`);
    if (contactsResponse.ok) {
      const contacts = await contactsResponse.json();
      console.log(`✅ Contacts API: Found ${contacts.length} contacts`);
    } else {
      console.log(`❌ Contacts API failed: ${contactsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ API Test Error: ${error.message}`);
  }

  console.log('\n🎉 Test completed! Check your Leads Manager in the admin dashboard.');
}

testContactForm();

// Script to create an admin user directly from the browser console
// This is for development purposes only

(function() {
  // Create admin user with credentials: admin/admin
  const adminUser = {
    id: '1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin',
    role: 'admin'
  };
  
  // Store the admin user in localStorage
  localStorage.setItem('sparti-demo-session', JSON.stringify(adminUser));
  
  // Store credentials in localStorage for future login (demo only)
  localStorage.setItem('sparti-demo-credentials', JSON.stringify({ email: 'admin', password: 'admin' }));
  
  console.log('✅ Admin user created successfully!');
  console.log('Username: admin');
  console.log('Password: admin');
  console.log('You can now navigate to /dashboard');
})();

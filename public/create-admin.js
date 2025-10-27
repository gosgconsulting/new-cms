// Script to create an admin user directly from the browser console
// This is for development purposes only

(function() {
  // Create admin user with credentials: admin/admin
  const adminUser = {
    id: '1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin',
    role: 'admin',
    is_super_admin: true
  };
  
  // Store the admin user in localStorage
  localStorage.setItem('sparti-user-session', JSON.stringify(adminUser));
  
  // Store the credentials in localStorage for demo purposes
  localStorage.setItem('sparti-demo-credentials', JSON.stringify({ email: 'admin', password: 'admin' }));
  
  console.log('✅ Admin user created successfully!');
  console.log('Username: admin');
  console.log('Password: admin');
  console.log('You can now navigate to /dashboard');
})();

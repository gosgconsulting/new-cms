
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalTheme } from '@/lib/utils-dashboard'
import { initializeDatabase } from '@/integrations/postgres'

// Set light mode by default
document.documentElement.classList.add("light");

// Initialize global theme settings from localStorage
initializeGlobalTheme();

// Initialize the PostgreSQL database
initializeDatabase()
  .then(success => {
    if (success) {
      console.log('Database initialized successfully');
    } else {
      console.error('Failed to initialize database');
    }
  })
  .catch(error => {
    console.error('Error initializing database:', error);
  });

createRoot(document.getElementById("root")!).render(<App />);


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalTheme } from '@/lib/utils-dashboard'

// Set light mode by default
document.documentElement.classList.add("light");

// Initialize global theme settings from localStorage
initializeGlobalTheme();

// Dynamically import and expose migration functions
const loadMigrationFunctions = async () => {
  try {
    const { runPageMigration, testWordPressConnection, testCreatePage } = await import('./lib/run-migration');
    
    // Make migration functions available globally for console access
    if (typeof window !== 'undefined') {
      (window as any).runPageMigration = runPageMigration;
      (window as any).testWordPressConnection = testWordPressConnection;
      (window as any).testCreatePage = testCreatePage;
      console.log('✅ Migration functions loaded! Available commands:');
      console.log('- testWordPressConnection()');
      console.log('- testCreatePage()');
      console.log('- runPageMigration()');
    }
  } catch (error) {
    console.error('Failed to load migration functions:', error);
  }
};

// Load functions after a short delay to ensure everything is ready
setTimeout(loadMigrationFunctions, 1000);

createRoot(document.getElementById("root")!).render(<App />);

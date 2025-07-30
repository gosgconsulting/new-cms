
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalTheme } from '@/lib/utils-dashboard'
import { runPageMigration, testWordPressConnection, testCreatePage } from './lib/run-migration'

// Set light mode by default
document.documentElement.classList.add("light");

// Initialize global theme settings from localStorage
initializeGlobalTheme();

// Make migration functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).runPageMigration = runPageMigration;
  (window as any).testWordPressConnection = testWordPressConnection;
  (window as any).testCreatePage = testCreatePage;
}

createRoot(document.getElementById("root")!).render(<App />);


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGlobalTheme } from '@/lib/utils-dashboard'

// Set light mode by default
document.documentElement.classList.add("light");

// Initialize global theme settings from localStorage
initializeGlobalTheme();

createRoot(document.getElementById("root")!).render(<App />);

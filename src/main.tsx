
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set light mode by default
document.documentElement.classList.add("light");

createRoot(document.getElementById("root")!).render(<App />);

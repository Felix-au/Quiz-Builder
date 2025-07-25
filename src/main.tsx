import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Credits from './components/Credits';

createRoot(document.getElementById("root")!).render(<App />);

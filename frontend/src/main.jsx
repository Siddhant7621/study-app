import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios' // Make sure to import axios
import './index.css'
import App from './App.jsx'

export const server = import.meta.env.DEV 
  ? "http://localhost:5001" 
  : "https://study-app-server-8j26.onrender.com"; // Replace with your actual Render URL

// Use lowercase 'axios'
axios.defaults.baseURL = server;

console.log('API Base URL:', server);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
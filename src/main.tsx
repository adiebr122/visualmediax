
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupStorage } from './integrations/supabase/setup'

// Initialize Supabase storage
setupStorage()
  .catch(console.error)
  .finally(() => {
    console.log('Supabase storage initialization complete');
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

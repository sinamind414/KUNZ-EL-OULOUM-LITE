import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { enregistrerServiceWorker } from './utils/pwa';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

enregistrerServiceWorker();

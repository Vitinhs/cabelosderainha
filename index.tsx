import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingQuiz from './src/components/LandingQuiz';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Registra o Service Worker para suporte PWA
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LandingQuiz />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './src/core/auth/AuthContext';
import { SubscriptionProvider } from './src/core/subscription/SubscriptionContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import './index.css';

// Registra o Service Worker para suporte PWA
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/*
      Hierarquia de providers:
      AuthProvider     — sessão, user, login, logout
      SubscriptionProvider — plan, isPremium, isVIP, updatePlan
    */}
    <AuthProvider>
      <SubscriptionProvider>
        <App />
        <SpeedInsights />
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>
);

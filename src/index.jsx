import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
  }
}

prepare().then(() => {
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
});

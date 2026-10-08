import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactNode } from 'react';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';

async function prepare(): Promise<ComponentType<{ children: ReactNode }>> {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` } });
    const { MockAuthProvider } = await import('./mocks/MockAuthProvider');
    return MockAuthProvider;
  }
  return AuthProvider;
}
prepare().then((Provider) => {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element #root not found');
  createRoot(container).render(<Provider><App /></Provider>);
}).catch(() => {
  const container = document.getElementById('root');
  if (container) container.textContent = 'Unable to start the app. Reload the page; for mock development, regenerate the MSW worker.';
});

import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactNode } from 'react';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeTelemetry, reportError } from './telemetry';

initializeTelemetry();

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
  createRoot(container).render(<ErrorBoundary><Provider><App /></Provider></ErrorBoundary>);
}).catch((error) => {
  reportError(error, 'startup');
  const container = document.getElementById('root');
  if (container) container.textContent = 'Unable to start the app. Reload the page; for mock development, regenerate the MSW worker.';
});

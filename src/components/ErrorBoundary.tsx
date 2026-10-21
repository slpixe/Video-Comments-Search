import { Component, type ReactNode } from 'react';
import { reportError } from '../telemetry';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { reportError(error, 'render'); }
  render() {
    if (this.state.failed) return <main role="alert"><h1>Something went wrong</h1>
      <p>Reload the page to try again.</p><button onClick={() => window.location.reload()}>Reload</button></main>;
    return this.props.children;
  }
}

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, details: ErrorInfo) {
    console.error('RoboMotion canvas initialization failed:', error, details.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="canvas-fallback" role="alert">
          <h3>3D preview unavailable</h3>
          <p>The application shell is still usable. Verify that your browser supports WebGL, then reload.</p>
          <button className="btn btn-small" type="button" onClick={() => window.location.reload()}>Reload workspace</button>
        </div>
      );
    }
    return this.props.children;
  }
}

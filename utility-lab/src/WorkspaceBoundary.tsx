import { Component, type ReactNode } from "react";
export default class WorkspaceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="workspace-recovery" role="alert">
        <h1>This workspace could not open.</h1>
        <p>
          Your saved records are still on this device. Reload to load the
          current app files, or choose another tab.
        </p>
        <button className="primary-button" onClick={() => location.reload()}>
          Reload app
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}

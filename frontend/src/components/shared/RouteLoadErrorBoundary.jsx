import { Component } from "react";

export default class RouteLoadErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
        <div className="max-w-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-lg font-bold text-white">
            CP
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            This page needs to be refreshed
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            A newer version of CareerPilot may be available.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }
}

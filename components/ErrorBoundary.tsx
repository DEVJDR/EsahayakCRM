"use client";

import { Component, ReactNode, useState } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state to trigger fallback UI
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to an error tracking service (e.g., Sentry) in a real app
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h2>
          <p className="text-gray-700 mb-4">{this.state.error}</p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
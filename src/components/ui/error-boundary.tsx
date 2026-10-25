"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught clinical rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50/40 p-8 text-center my-4">
          <div className="rounded-full bg-red-100 p-3 text-red-700 mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-red-900">
            Clinical Module Encountered an Execution Error
          </h3>
          <p className="mt-1 max-w-md text-xs text-red-700">
            {this.state.error?.message ||
              "An unexpected error occurred in this workspace module. Audit telemetry has captured this state."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="border-red-300 text-red-900 hover:bg-red-100"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 rtl:ml-1.5 rtl:mr-0" />
              Reset Module
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

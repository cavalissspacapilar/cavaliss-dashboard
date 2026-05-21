"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` / ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="glass-card border border-red-500/20 bg-red-500/5 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">
              {this.props.label ? `Error en ${this.props.label}` : "Error en esta sección"}
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">{this.state.message || "Error inesperado"}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2 underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

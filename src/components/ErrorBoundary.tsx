"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallbackName?: string
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in visualization:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-500">Visualization Logic Fault</h3>
            <p className="text-xs text-white/40 mt-1 max-w-[200px]">
              {this.props.fallbackName || "This component"} encountered a computational error in the DS engine layer.
            </p>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Re-initialize
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

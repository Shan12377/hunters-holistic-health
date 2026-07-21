// App-wide error boundary (CLAUDE.md Rule E: errors must be visible).
// A render error anywhere below shows a friendly recovery screen instead of a white page.

import { Component, type ReactNode } from 'react'
import shared from '../../styles/shared.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[app] render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={shared.loadingPage}>
          <div className={shared.loadingInner}>
            <p className={shared.loadingText}>Something went wrong loading this page.</p>
            <button className={shared.btnPrimary} onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

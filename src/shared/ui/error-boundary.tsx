import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
          <p className="text-5xl font-bold text-primary">!</p>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-[#8D8D8D]">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-[4px] bg-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

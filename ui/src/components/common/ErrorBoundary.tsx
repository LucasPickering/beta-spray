import React from "react";
import ErrorMessage from "./ErrorMessage";

interface Props {
  fallback?: React.ReactNode;
}

interface State {
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    fallback: <ErrorMessage />,
  };
  state: State = {
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): State {
    // Set some state derived from the caught error
    return { error };
  }

  render(): React.ReactNode {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

type RouteErrorBoundaryProps = {
  children: ReactNode;
};

type RouteErrorBoundaryInnerProps = {
  children: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
};

type RouteErrorBoundaryState = {
  hasError: boolean;
};

class RouteErrorBoundaryInner extends Component<RouteErrorBoundaryInnerProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Route rendering error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border/70 bg-surface-elevated p-6 shadow-xs">
          <h1 className="text-lg font-semibold text-foreground">{this.props.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{this.props.description}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 h-11 rounded-xl bg-primary px-4 text-base font-medium text-primary-foreground transition-opacity hover:opacity-95"
          >
            {this.props.actionLabel}
          </button>
        </div>
      </div>
    );
  }
}

export function RouteErrorBoundary(props: RouteErrorBoundaryProps) {
  const { t } = useTranslation();

  return (
    <RouteErrorBoundaryInner
      title={t("errors.routeCrash.title")}
      description={t("errors.routeCrash.description")}
      actionLabel={t("errors.routeCrash.retry")}
    >
      {props.children}
    </RouteErrorBoundaryInner>
  );
}


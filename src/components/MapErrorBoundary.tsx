import React, { Component, type ReactNode } from "react";
import { MapPin } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackHeight?: string;
}

interface State {
  hasError: boolean;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Map component error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground"
          style={{ height: this.props.fallbackHeight || "300px" }}
        >
          <MapPin className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm">Kaart kon niet geladen worden</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;

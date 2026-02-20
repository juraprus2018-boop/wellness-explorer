import { lazy, Suspense } from "react";
import MapErrorBoundary from "./MapErrorBoundary";

const SaunaMap = lazy(() => import("./SaunaMap"));

interface SafeSaunaMapProps {
  saunas: any[];
  height?: string;
  className?: string;
}

const SafeSaunaMap = ({ saunas, height = "400px", className }: SafeSaunaMapProps) => {
  return (
    <MapErrorBoundary fallbackHeight={height}>
      <Suspense
        fallback={
          <div
            className={`flex items-center justify-center rounded-lg border border-border bg-muted/20 ${className || ""}`}
            style={{ height }}
          >
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <SaunaMap saunas={saunas} height={height} className={className} />
      </Suspense>
    </MapErrorBoundary>
  );
};

export default SafeSaunaMap;

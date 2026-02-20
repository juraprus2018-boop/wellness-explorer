interface AdPlaceholderProps {
  slot?: string;
  className?: string;
}

const AdPlaceholder = ({ slot = "ad", className = "" }: AdPlaceholderProps) => (
  <div
    className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 py-4 text-xs text-muted-foreground ${className}`}
  >
    Advertentie
  </div>
);

export default AdPlaceholder;

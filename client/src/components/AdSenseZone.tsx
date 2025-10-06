interface AdSenseZoneProps {
  slot: string;
  format?: "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export default function AdSenseZone({ slot, format = "rectangle", className = "" }: AdSenseZoneProps) {
  const heights = {
    horizontal: "h-24",
    vertical: "h-96",
    rectangle: "h-64",
  };

  return (
    <div
      className={`bg-muted/30 border border-dashed rounded-md flex items-center justify-center ${heights[format]} ${className}`}
      data-testid={`ad-zone-${slot}`}
    >
      <div className="text-center text-muted-foreground">
        <p className="text-xs font-medium">AdSense Zone</p>
        <p className="text-xs">{slot}</p>
      </div>
    </div>
  );
}

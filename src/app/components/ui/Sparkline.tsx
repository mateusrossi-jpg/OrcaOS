type Props = { data: number[]; stroke?: string; fill?: string; height?: number };

/**
 * Sparkline: Ultra-minimal technical trend line.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 * Enhanced with built-in premium linear gradient fills.
 */
export function Sparkline({ data, stroke = "var(--accent-green)", fill, height = 38 }: Props) {
  if (!data || data.length < 2) return null;
  const w = 120;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;

  // Standardize stroke colors and resolve gold tone
  const isGold = stroke.includes("gold") || stroke.includes("85");
  const strokeColor = isGold ? "oklch(0.82 0.14 85)" : stroke;

  // Premium gradient configuration
  const gradientId = `sparkline-grad-${strokeColor.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {isGold ? (
            <>
              {/* Gold gradient: rgba(212, 169, 78, 0.1) to transparent */}
              <stop offset="0%" stopColor="rgb(212, 169, 78)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(212, 169, 78)" stopOpacity="0" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </>
          )}
        </linearGradient>
      </defs>
      <path d={area} fill={fill || `url(#${gradientId})`} />
      <path d={d} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

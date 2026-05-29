type Props = { data: number[]; stroke?: string; fill?: string; height?: number };

/**
 * Sparkline: Ultra-minimal technical trend line.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function Sparkline({ data, stroke = "var(--accent-green)", fill = "transparent", height = 38 }: Props) {
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
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

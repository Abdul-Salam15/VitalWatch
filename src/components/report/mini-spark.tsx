interface MiniSparkProps {
  values: number[];
  color: string;
}

export function MiniSpark({ values, color }: MiniSparkProps) {
  if (!values || values.length < 2) return null;
  const w = 132;
  const h = 34;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / rng) * (h - 2 * pad);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${pad},${h - pad} ${pts} ${(w - pad).toFixed(1)},${h - pad}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polygon points={area} fill={color} opacity="0.08" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="2.4" fill={color} />
    </svg>
  );
}

// ── Responsive SVG line chart with hover tooltip ───────────────────────────
function useWidth() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => { const ww = el.getBoundingClientRect().width; if (ww) setW(ww); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  return [ref, w];
}

function LineChartView({ data, color = '#1A6B3C', unit = '', height = 280, valueFmt = (v) => v, refLine = null, seriesKey = '' }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = React.useState(null);
  const lineRef = React.useRef(null);
  const areaRef = React.useRef(null);
  const firstRender = React.useRef(true);

  // Draw-on transition when the user switches series. Skipped on initial mount
  // (line renders solid immediately) so the chart is never blank in a background
  // tab / print / reduced-motion. dasharray lives in the keyframes with
  // fill:'none', so no inline style can get stuck if the animation is interrupted.
  React.useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const line = lineRef.current;
    if (!line || document.hidden) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    line.animate(
      [{ strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0 }],
      { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'none' },
    );
    if (areaRef.current) areaRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease', fill: 'none' });
  }, [seriesKey]);

  const pad = { t: 16, r: 16, b: 28, l: 40 };
  const W = Math.max(width || 320, 240);
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const vals = data.map(d => d.value);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (refLine) { min = Math.min(min, refLine.value); max = Math.max(max, refLine.value); }
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  min = min - range * 0.15;
  max = max + range * 0.15;

  const x = (i) => pad.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - ((v - min) / (max - min)) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${x(data.length - 1).toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  // y ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + (i / ticks) * (max - min));
  // x labels — show ~6
  const xStep = Math.max(1, Math.ceil(data.length / 6));

  const gid = 'g' + color.replace('#', '');

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0, bestD = Infinity;
    data.forEach((d, i) => { const dd = Math.abs(x(i) - px); if (dd < bestD) { bestD = dd; best = i; } });
    setHover(best);
  };

  return (
    <div ref={ref} className="relative w-full min-w-0 select-none" style={{ height }}>
      <svg width={W} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="overflow-visible block max-w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#f0f0f0" strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-400" style={{ fontSize: 11 }}>{valueFmt(Math.round(t))}</text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) => (i % xStep === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 11 }}>{fmtDate(d.ts)}</text>
        ))}

        <path ref={areaRef} d={areaPath} fill={`url(#${gid})`} />
        <path ref={lineRef} d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />

        {/* reference line */}
        {refLine && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(refLine.value)} y2={y(refLine.value)} stroke={refLine.color || '#F59E0B'} strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.9" />
            <rect x={W - pad.r - 96} y={y(refLine.value) - 20} width="96" height="17" rx="4" fill={refLine.color || '#F59E0B'} />
            <text x={W - pad.r - 48} y={y(refLine.value) - 8} textAnchor="middle" className="fill-white" style={{ fontSize: 10, fontWeight: 700 }}>{refLine.label} {refLine.value}</text>
          </g>
        )}

        {/* hover */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke={color} strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5.5" fill="white" stroke={color} strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 px-3 py-2 text-white shadow-lg"
          style={{
            left: Math.min(Math.max(x(hover), 60), W - 60),
            top: Math.max(y(data[hover].value) - 56, 0),
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-[11px] text-slate-300">{fmtDate(data[hover].ts)}</div>
          <div className="text-sm font-bold whitespace-nowrap">{valueFmt(data[hover].value)}<span className="ml-0.5 text-[11px] font-medium text-slate-300">{unit}</span></div>
        </div>
      )}
    </div>
  );
}

window.LineChartView = LineChartView;

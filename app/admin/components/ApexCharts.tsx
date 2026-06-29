'use client';

const BRAND = '#2596be';
const BRAND_DARK = '#1e7ea1';
const BRAND_DIM = 'rgba(37,150,190,0.12)';
const SIDEBAR_ACCENT = '#00b4ff';

/** GoDocLab CMS theme — matches admin sidebar reference */
export const APEX = {
  brand: BRAND,
  brandDark: BRAND_DARK,
  brandDim: BRAND_DIM,
  sidebarAccent: SIDEBAR_ACCENT,
  /** Main content area */
  bg: '#f4f6f8',
  /** Cards */
  card: '#ffffff',
  border: '#e5e7eb',
  /** Sidebar */
  sidebar: '#112240',
  sidebarActive: '#1e2f4d',
  sidebarBorder: '#1a3050',
  /** Text */
  text: '#111827',
  textSecondary: '#374151',
  muted: '#6b7280',
  /** Sidebar text */
  sidebarText: '#ffffff',
  sidebarMuted: '#8899af',
  /** Gradients */
  heroGradient: 'linear-gradient(135deg, #112240 0%, #1a3050 50%, #2596be 100%)',
  sidebarGradient: '#112240',
  /** Legacy aliases */
  green: BRAND,
  greenDim: BRAND_DIM,
};

export function Sparkline({
  data,
  color = BRAND,
  width = 100,
  height = 36,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OverviewChart({ data }: { data: number[] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const w = 560;
  const h = 200;
  const pad = { t: 10, b: 28, l: 36, r: 10 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const max = Math.max(...data, 1);

  const pts = data
    .map((v, i) => {
      const x = pad.l + (i / (data.length - 1)) * cw;
      const y = pad.t + ch - (v / max) * ch;
      return `${x},${y}`;
    })
    .join(' ');

  const area = `${pad.l},${pad.t + ch} ${pts} ${pad.l + cw},${pad.t + ch}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cms-chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.2" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = pad.t + ch * (1 - pct);
        return (
          <g key={pct}>
            <line x1={pad.l} y1={y} x2={pad.l + cw} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="9">
              ${Math.round(max * pct / 1000)}k
            </text>
          </g>
        );
      })}
      <polygon points={area} fill="url(#cms-chart-area)" />
      <polyline points={pts} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((_, i) => {
        if (i % 2 !== 0 && i !== data.length - 1) return null;
        const x = pad.l + (i / (data.length - 1)) * cw;
        return (
          <text key={i} x={x} y={h - 6} textAnchor="middle" fill="#9ca3af" fontSize="9">
            {months[i]}
          </text>
        );
      })}
    </svg>
  );
}

export function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 52;
  const cx = 70;
  const cy = 70;
  let angle = -90;

  const arcs = segments.map((seg) => {
    const sweep = (seg.value / total) * 360;
    const start = angle;
    angle += sweep;
    const end = angle;
    const large = sweep > 180 ? 1 : 0;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(start));
    const y1 = cy + r * Math.sin(rad(start));
    const x2 = cx + r * Math.cos(rad(end));
    const y2 = cy + r * Math.sin(rad(end));
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { ...seg, d };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={140} height={140} viewBox="0 0 140 140">
        {arcs.map((a) => (
          <path key={a.label} d={a.d} fill={a.color} opacity={0.9} />
        ))}
        <circle cx={cx} cy={cy} r={32} fill="#ffffff" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={APEX.text} fontSize="11" fontWeight="600">
          100%
        </text>
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span style={{ color: APEX.muted }}>{s.label}</span>
            </div>
            <span className="font-medium" style={{ color: APEX.text }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressGoal({
  label,
  pct,
  color = BRAND,
}: {
  label: string;
  pct: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span style={{ color: APEX.muted }}>{label}</span>
        <span className="font-semibold" style={{ color: APEX.text }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

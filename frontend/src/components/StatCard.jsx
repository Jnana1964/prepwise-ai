export default function StatCard({ label, value, unit, sub, icon: Icon, trend }) {
  return (
    <div className="card p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-muted text-sm">{label}</p>
        {Icon && <Icon size={18} className="text-accent-500" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-fg">{value}</span>
        {unit && <span className="text-muted text-sm">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-muted">{sub}</p>}
      {trend && (
        <div className="h-8 mt-1">
          <MiniSparkline points={trend} />
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((p - min) / range) * h}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#ff6a1a" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={h - ((p - min) / range) * h} r="2" fill="#ff6a1a" />
      ))}
    </svg>
  );
}

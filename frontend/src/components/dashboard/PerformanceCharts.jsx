const INTERVIEW_DATA = [
  { label: "Mon", value: 6.2 },
  { label: "Tue", value: 7.1 },
  { label: "Wed", value: 6.8 },
  { label: "Thu", value: 7.5 },
  { label: "Fri", value: 8.2 },
  { label: "Sat", value: 8.4 },
  { label: "Sun", value: 8.0 },
];

const ATS_DATA = [
  { label: "W1", value: 72 },
  { label: "W2", value: 78 },
  { label: "W3", value: 81 },
  { label: "W4", value: 87 },
];

function LineChart({ data, max, unit }) {
  const width = 100;
  const height = 48;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.value / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  const areaPoints = [
    `${padding},${height - padding}`,
    ...points,
    `${width - padding},${height - padding}`,
  ].join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#lineGrad)" />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="rgb(99,102,241)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2);
          const y = height - padding - (d.value / max) * (height - padding * 2);
          return (
            <circle
              key={d.label}
              cx={x}
              cy={y}
              r="2"
              fill="rgb(99,102,241)"
              className="dark:fill-brand-400"
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d) => (
          <span key={d.label} className="text-[10px] text-slate-400">
            {d.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Peak: <span className="font-semibold text-slate-900 dark:text-white">{Math.max(...data.map((d) => d.value))}{unit}</span>
      </p>
    </div>
  );
}

function BarChart({ data, max }) {
  return (
    <div>
      <div className="flex h-28 items-end justify-between gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {d.value}%
            </span>
            <div
              className="w-full rounded-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all dark:from-brand-500 dark:to-brand-300"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: "8px" }}
            />
            <span className="text-[10px] text-slate-400">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Latest: <span className="font-semibold text-slate-900 dark:text-white">{data[data.length - 1].value}%</span>
        <span className="ml-2 text-emerald-600 dark:text-emerald-400">+15% vs start</span>
      </p>
    </div>
  );
}

export default function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="dash-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Interview Performance
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Average score over the last 7 days
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            +18%
          </span>
        </div>
        <div className="mt-5">
          <LineChart data={INTERVIEW_DATA} max={10} unit="/10" />
        </div>
      </div>

      <div className="dash-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              ATS Score Trend
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Weekly resume match rate improvement
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Improving
          </span>
        </div>
        <div className="mt-5">
          <BarChart data={ATS_DATA} max={100} />
        </div>
      </div>
    </div>
  );
}

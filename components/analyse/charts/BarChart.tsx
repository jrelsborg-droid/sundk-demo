type BarRow = {
  id: string;
  navn: string;
  sublabel?: string;
  vaerdi: number;
  enhed: string;
  rang?: number | null;
};

function formatValue(value: number, enhed: string) {
  if (enhed === "pct" || enhed === "%") return `${value.toFixed(1)}%`;
  if (enhed === "dage") return `${value.toFixed(1)} dage`;
  if (enhed === "timer") return `${value.toFixed(1)} timer`;
  return value.toFixed(1);
}

export default function BarChart({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: BarRow[];
}) {
  const maxValue = rows.length ? Math.max(...rows.map((r) => r.vaerdi)) : 1;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/76 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>

        <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
          Søjlediagram
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-[20px] border border-slate-200 bg-white/60 p-4">
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-slate-900">{row.navn}</div>
                {row.sublabel && <div className="text-xs text-slate-500">{row.sublabel}</div>}
              </div>

              <div className="text-sm font-semibold text-slate-900">
                {formatValue(row.vaerdi, row.enhed)}
              </div>
            </div>

            <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-sky-400"
                style={{ width: `${(row.vaerdi / (maxValue || 1)) * 100}%` }}
              />
            </div>

            {row.rang != null && (
              <div className="mt-2 text-xs text-slate-500">Rang: {Math.round(row.rang)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
type TableRow = {
  navn: string;
  sublabel?: string;
  aar: number;
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

export default function TableView({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: TableRow[];
}) {
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
          Tabel
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
        <div className="grid grid-cols-[1.8fr_120px_140px_90px] bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <div>Enhed</div>
          <div>År</div>
          <div>Værdi</div>
          <div>Rang</div>
        </div>

        <div className="divide-y divide-slate-200/80 bg-white/60">
          {rows.map((row, idx) => (
            <div
              key={`${row.navn}-${row.aar}-${idx}`}
              className="grid grid-cols-[1.8fr_120px_140px_90px] items-center px-5 py-4 text-sm"
            >
              <div>
                <div className="font-medium text-slate-900">{row.navn}</div>
                {row.sublabel && <div className="mt-1 text-xs text-slate-500">{row.sublabel}</div>}
              </div>
              <div className="text-slate-700">{row.aar}</div>
              <div className="font-medium text-slate-900">{formatValue(row.vaerdi, row.enhed)}</div>
              <div className="text-slate-700">
                {row.rang == null ? "–" : Math.round(row.rang)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
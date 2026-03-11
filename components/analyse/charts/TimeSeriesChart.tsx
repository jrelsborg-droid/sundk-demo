"use client";

import { useMemo, useState } from "react";

type TrendPoint = {
  aar: number;
  vaerdi: number;
  rang?: number | null;
};

type LineSeries = {
  id: string;
  navn: string;
  sublabel?: string;
  points: TrendPoint[];
};

function formatValue(value: number, enhed: string) {
  if (enhed === "pct" || enhed === "%") return `${value.toFixed(1)}%`;
  if (enhed === "dage") return `${value.toFixed(1)} dage`;
  if (enhed === "timer") return `${value.toFixed(1)} timer`;
  return value.toFixed(1);
}

export default function TimeSeriesChart({
  title,
  subtitle,
  enhed,
  series,
}: {
  title: string;
  subtitle: string;
  enhed: string;
  series: LineSeries[];
}) {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    seriesName: string;
    year: number;
    value: number;
    rang?: number | null;
  } | null>(null);

  const allValues = series.flatMap((s) => s.points.map((p) => p.vaerdi));
  const minY = allValues.length ? Math.min(...allValues) : 0;
  const maxY = allValues.length ? Math.max(...allValues) : 1;
  const yRange = maxY - minY || 1;

  const allYears = useMemo(
    () =>
      Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.aar)))).sort(
        (a, b) => a - b
      ),
    [series]
  );

  const colors = [
    "rgb(14 165 233)",
    "rgb(148 163 184)",
    "rgb(16 185 129)",
    "rgb(245 158 11)",
    "rgb(244 63 94)",
    "rgb(99 102 241)",
    "rgb(168 85 247)",
    "rgb(34 197 94)",
  ];

  function xForYear(aar: number) {
    if (allYears.length <= 1) return 50;
    const index = allYears.indexOf(aar);
    return (index / (allYears.length - 1)) * 100;
  }

  function yForValue(value: number) {
    return 100 - ((value - minY) / yRange) * 100;
  }

  const axisTicks = 5;
  const axisValues = Array.from({ length: axisTicks }, (_, i) => {
    const ratio = i / (axisTicks - 1);
    return maxY - ratio * yRange;
  });

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
          Tidsserie
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
        <div className="grid grid-cols-[56px_1fr] gap-3">
          <div className="relative h-[360px]">
            {axisValues.map((tick, idx) => (
              <div
                key={idx}
                className="absolute right-0 -translate-y-1/2 text-[11px] text-slate-500"
                style={{ top: `${(idx / (axisTicks - 1)) * 100}%` }}
              >
                {formatValue(tick, enhed)}
              </div>
            ))}
          </div>

          <div className="relative h-[360px]">
            <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(to_right,rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:48px_48px]" />

            <svg viewBox="0 0 100 100" className="relative z-10 h-full w-full overflow-visible">
              {series.map((s, idx) => {
                const color = colors[idx % colors.length];
                const points = s.points.map((p) => `${xForYear(p.aar)},${yForValue(p.vaerdi)}`);

                return (
                  <g key={s.id}>
                    <polyline
                      fill="none"
                      stroke={color}
                      strokeWidth="1.7"
                      points={points.join(" ")}
                    />

                    {s.points.map((p) => {
                      const x = xForYear(p.aar);
                      const y = yForValue(p.vaerdi);

                      return (
                        <g key={`${s.id}-${p.aar}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="1.7"
                            fill={color}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="transparent"
                            onMouseEnter={() =>
                              setHovered({
                                x,
                                y,
                                seriesName: s.navn,
                                year: p.aar,
                                value: p.vaerdi,
                                rang: p.rang,
                              })
                            }
                            onMouseLeave={() => setHovered(null)}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute z-20 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-xl"
                style={{
                  left: `calc(${hovered.x}% + 10px)`,
                  top: `calc(${hovered.y}% - 10px)`,
                }}
              >
                <div className="font-semibold text-slate-900">{hovered.seriesName}</div>
                <div>År: {hovered.year}</div>
                <div>Værdi: {formatValue(hovered.value, enhed)}</div>
                {hovered.rang != null && <div>Rang: {Math.round(hovered.rang)}</div>}
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-4 bottom-0 flex justify-between text-[11px] text-slate-500">
              {allYears.map((year) => (
                <span key={year}>{year}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
          {series.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              {s.navn}
            </div>
          ))}
          <div className="flex items-center gap-2 text-slate-500">Enhed: {enhed}</div>
        </div>
      </div>
    </div>
  );
}
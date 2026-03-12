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

  // plotområde i svg-koordinater
  const plotLeft = 8;
  const plotRight = 154;
  const plotTop = 6;
  const plotBottom = 86;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  function xForYear(aar: number) {
    if (allYears.length <= 1) return plotLeft + plotWidth / 2;
    const index = allYears.indexOf(aar);
    return plotLeft + (index / (allYears.length - 1)) * plotWidth;
  }

  function yForValue(value: number) {
    return plotTop + (1 - (value - minY) / yRange) * plotHeight;
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
        <div className="grid grid-cols-[56px_1fr] gap-2">
          <div className="relative h-[360px]">
            {axisValues.map((tick, idx) => (
              <div
                key={idx}
                className="absolute right-0 -translate-y-1/2 text-[11px] text-slate-500"
                style={{
                  top: `${((plotTop + (idx / (axisTicks - 1)) * plotHeight) / 100) * 100}%`,
                }}
              >
                {formatValue(tick, enhed)}
              </div>
            ))}
          </div>

          <div className="relative h-[360px]">
            <svg viewBox="0 0 160 100" className="relative z-10 h-full w-full overflow-visible">
              {/* baggrundsgitter */}
              {Array.from({ length: 10 }).map((_, i) => {
                const x = plotLeft + (i / 9) * plotWidth;
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={plotTop}
                    x2={x}
                    y2={plotBottom}
                    stroke="rgba(148,163,184,0.14)"
                    strokeWidth="0.25"
                  />
                );
              })}

              {Array.from({ length: 6 }).map((_, i) => {
                const y = plotTop + (i / 5) * plotHeight;
                return (
                  <line
                    key={`h-${i}`}
                    x1={plotLeft}
                    y1={y}
                    x2={plotRight}
                    y2={y}
                    stroke="rgba(148,163,184,0.14)"
                    strokeWidth="0.25"
                  />
                );
              })}

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
                          <circle cx={x} cy={y} r="1.7" fill={color} />
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

              {/* x-akse labels i samme koordinatsystem */}
              {allYears.map((year) => (
                <text
                  key={year}
                  x={xForYear(year)}
                  y={97}
                  textAnchor="middle"
                  fontSize="3"
                  fill="rgb(100 116 139)"
                >
                  {year}
                </text>
              ))}
            </svg>

{hovered && (
  <div
    className="pointer-events-none absolute z-20 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-xl"
    style={{
      left: `${(hovered.x / 160) * 100}%`,
      top: `${hovered.y}%`,
      transform: "translate(10px, -12px)",
    }}
  >
                <div className="font-semibold text-slate-900">{hovered.seriesName}</div>
                <div>År: {hovered.year}</div>
                <div>Værdi: {formatValue(hovered.value, enhed)}</div>
                {hovered.rang != null && <div>Rang: {Math.round(hovered.rang)}</div>}
              </div>
            )}
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
"use client";

import Link from "next/link";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AnalyseBuilderTeaser() {
  return (
      <Link
        href="/analyse"
        className={cn(
          "group relative block overflow-hidden rounded-[28px]",
          "border border-slate-200/80 bg-white/80 backdrop-blur-xl",
          "shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
          "transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
        )}
      >
      <div className="grid gap-8 p-8 lg:grid-cols-2 lg:items-center">

        {/* LEFT SIDE */}
        <div>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
            Analysebygger
          </div>

          <h3 className="mt-4 text-[36px] font-semibold tracking-tight text-slate-950">
            Dyk ned i data
          </h3>

          <p className="mt-4 max-w-xl text-[17px] leading-8 text-slate-600">
            Gå fra overblik til fordybelse. Sammenlign udvikling, benchmark og
            variation på tværs af databaser, hospitaler og afdelinger.
          </p>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition group-hover:bg-sky-700">
              Åbn analysebygger
              <span className="text-lg">→</span>
            </span>
          </div>
        </div>

        {/* RIGHT SIDE – PREVIEW */}
        <div className="relative">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            {/* tabs */}
            <div className="flex gap-2 text-xs mb-4">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700 font-medium">
                Tidsserie
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Benchmark
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Variation
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Tabel
              </span>
            </div>

            {/* chart mockup */}
            <div className="h-[140px] rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden">

              <svg viewBox="0 0 300 120" className="absolute inset-0 w-full h-full">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points="10,90 60,80 110,75 160,50 210,35 260,30"
                />
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points="10,100 60,95 110,85 160,80 210,60 260,55"
                />
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="3"
                  points="10,70 60,65 110,70 160,75 210,85 260,95"
                />
              </svg>

            </div>

            {/* filters */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Akutdatabasen
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                1-års overlevelse
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                2015–2024
              </span>
            </div>

          </div>
        </div>
      </div>
    </Link>
  );
}
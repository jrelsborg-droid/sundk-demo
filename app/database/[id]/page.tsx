import Link from "next/link";
import { loadDatabaseData } from "@/lib/data/loadDatabaseData";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    indikator?: string;
    aar?: string;
  }>;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatUnit(enhed: string) {
  if (enhed === "pct" || enhed === "%") return "%";
  if (enhed === "dage") return " dage";
  if (enhed === "timer") return " timer";
  return "";
}

function formatImprovement(
  value: number,
  enhed: string,
  retning: "lavere_bedre" | "hoejere_bedre"
) {
  if (!Number.isFinite(value)) return "—";
  const absVal = Math.abs(value).toFixed(1);
  if (retning === "lavere_bedre") return `−${absVal}${formatUnit(enhed)}`;
  return `+${absVal}${formatUnit(enhed)}`;
}

function GlassCard({
  className,
  children,
  accent = "slate",
}: {
  className?: string;
  children: React.ReactNode;
  accent?: "amber" | "sky" | "rose" | "emerald" | "slate";
}) {
  const accentBar = {
    amber: "before:bg-amber-300/80",
    sky: "before:bg-sky-300/80",
    rose: "before:bg-rose-300/80",
    emerald: "before:bg-emerald-300/80",
    slate: "before:bg-slate-300/80",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/78 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] before:absolute before:left-0 before:right-0 before:top-0 before:h-[3px]",
        accentBar[accent],
        className
      )}
    >
      {children}
    </div>
  );
}

function CardEyebrow({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "amber" | "sky" | "rose" | "emerald" | "slate";
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {children}
    </div>
  );
}

function scoreNiveau(
  row: { vaerdi: number; retning: "lavere_bedre" | "hoejere_bedre" },
  min: number,
  max: number
) {
  if (max === min) return 50;
  const raw = ((row.vaerdi - min) / (max - min)) * 100;
  return row.retning === "lavere_bedre" ? 100 - raw : raw;
}

function scoreForbedring(v: number, min: number, max: number) {
  if (max === min) return 50;
  return ((v - min) / (max - min)) * 100;
}

function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H5a2 2 0 0 0 2 2" />
      <path d="M17 6h2a2 2 0 0 1-2 2" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </svg>
  );
}

function IconVariation() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 15l3-3 3 2 5-6" />
    </svg>
  );
}

export default async function DatabasePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const selectedYear = resolvedSearchParams?.aar
    ? Number(resolvedSearchParams.aar)
    : undefined;

  const data = loadDatabaseData(id, resolvedSearchParams?.indikator, selectedYear);

  const trendMin = Math.min(...data.trendNational.map((p) => p.vaerdi));
  const trendMax = Math.max(...data.trendNational.map((p) => p.vaerdi));
  const trendRange = trendMax - trendMin || 1;

  const qVals = data.quadrantRows.map((r) => r.vaerdi).filter(Number.isFinite);
  const qImps = data.quadrantRows.map((r) => r.forbedring).filter(Number.isFinite);
  const minVal = qVals.length ? Math.min(...qVals) : 0;
  const maxVal = qVals.length ? Math.max(...qVals) : 0;
  const minImp = qImps.length ? Math.min(...qImps) : 0;
  const maxImp = qImps.length ? Math.max(...qImps) : 0;

  return (
    <main className="relative min-h-screen bg-slate-50/80 text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.85),transparent_30%),radial-gradient(circle_at_top_right,rgba(224,231,255,0.85),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#f5f8fc_45%,#f4f6fb_100%)]" />
        <div className="absolute right-[-80px] top-[-10px] h-[560px] w-[760px] opacity-[0.18]">
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-right-top"
            style={{ backgroundImage: "url('/bg-analyst.png')" }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12">
        <section>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Overblik
              </div>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.94] tracking-tight text-slate-950 sm:text-6xl">
                {data.database.database_navn}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
                {data.database.database_navn} samler og belyser kvalitetsdata på tværs af
                hospitaler og afdelinger. Udforsk indikatorer, variation, udvikling og
                forbedring i databasen.
              </p>
            </div>

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  <form className="flex gap-2">
    <input type="hidden" name="aar" value={data.selectedYear} />
    <select
      name="indikator"
      defaultValue={data.selectedIndikator.indikator_id}
      className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
    >
      {data.indikatorer.map((ind) => (
        <option key={ind.indikator_id} value={ind.indikator_id}>
          {ind.indikator_navn}
        </option>
      ))}
    </select>
    <button
      type="submit"
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      Vis
    </button>
  </form>

  <form className="flex gap-2">
    <input type="hidden" name="indikator" value={data.selectedIndikator.indikator_id} />
    <select
      name="aar"
      defaultValue={String(data.selectedYear)}
      className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
    >
      {data.availableYears.map((aar) => (
        <option key={aar} value={aar}>
          {aar}
        </option>
      ))}
    </select>
    <button
      type="submit"
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      Vis
    </button>
  </form>
</div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <GlassCard accent="amber" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <CardEyebrow tone="amber">Benchmark</CardEyebrow>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <IconTrophy />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium text-slate-600">Bedste niveau</div>
              <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                {data.benchmarkWinner ? `#1 ${data.benchmarkWinner.navn}` : "—"}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {data.selectedIndikator.indikator_navn}
              </div>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4">
              {data.benchmarkTop3.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{`#${r.rang} ${r.navn}`}</span>
                  <span className="font-semibold text-slate-900">
                    {r.vaerdi.toFixed(1)}
                    {formatUnit(data.selectedIndikator.enhed)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard accent="sky" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <CardEyebrow tone="sky">Bevægelse</CardEyebrow>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <IconSpark />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium text-slate-600">Største forbedring</div>
              <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                {data.movementWinner
                  ? formatImprovement(
                      data.movementWinner.forbedring,
                      data.selectedIndikator.enhed,
                      data.selectedIndikator.retning
                    )
                  : "—"}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {data.selectedIndikator.indikator_navn}
              </div>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4">
              {data.movementTop3.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{r.navn}</span>
                  <span className="font-semibold text-slate-900">
                    {formatImprovement(
                      r.forbedring,
                      data.selectedIndikator.enhed,
                      data.selectedIndikator.retning
                    )}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard accent="rose" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <CardEyebrow tone="rose">Variation</CardEyebrow>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                <IconVariation />
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium text-slate-600">Største variation</div>
              <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                {data.variationValue.toFixed(1)}
                {formatUnit(data.selectedIndikator.enhed)}
              </div>
              <div className="mt-2 text-sm text-slate-500">{data.database.database_navn}</div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Indikator</span>
                <span className="font-semibold text-slate-900">
                  {data.selectedIndikator.indikator_navn}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">År</span>
                <span className="font-semibold text-slate-900">{data.selectedYear}</span>
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard accent="sky" className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">
                  Udvikling i indikator over tid
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  National gennemsnitsudvikling for den valgte indikator i databasen.
                </div>
              </div>
              <CardEyebrow tone="sky">Trend</CardEyebrow>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
              <div className="relative h-[320px]">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-slate-100/80" />
                  ))}
                </div>

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="rgb(56 189 248)"
                    strokeWidth="2.4"
                    points={data.trendNational
                      .map((p, index) => {
                        const x =
                          data.trendNational.length === 1
                            ? 50
                            : (index / (data.trendNational.length - 1)) * 100;
                        const y = 100 - ((p.vaerdi - trendMin) / trendRange) * 80 - 10;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </svg>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pt-3 text-xs text-slate-500">
                  {data.trendNational.map((p) => (
                    <span key={p.aar}>{p.aar}</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard accent="sky" className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">
                  Hospital performance og forbedring
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Sammenlign niveau og forbedring for hospitaler i den valgte indikator.
                </div>
              </div>
              <CardEyebrow tone="sky">Performance</CardEyebrow>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
              <div className="relative h-[320px]">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-300" />
                <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-300" />

                <div className="absolute left-2 top-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700">
                  Høj kvalitet
                </div>

                {data.quadrantRows.slice(0, 12).map((p) => {
                  const x = scoreForbedring(p.forbedring, minImp, maxImp);
                  const y = scoreNiveau(p, minVal, maxVal);

                  return (
                    <div
                      key={p.id}
                      className="absolute h-5 w-5 rounded-full border border-sky-500/60 bg-sky-400/75"
                      style={{
                        left: `${x}%`,
                        bottom: `${y}%`,
                        transform: "translate(-50%, 50%)",
                      }}
                      title={`${p.navn}: ${p.vaerdi.toFixed(1)}${formatUnit(p.enhed)}`}
                    />
                  );
                })}

                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                  Forbedring siden baseline
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
                  Nuværende niveau
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard accent="slate" className="p-6">
            <div className="text-2xl font-semibold tracking-tight text-slate-950">
              Hospital performance
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="col-span-1">Rang</div>
                <div className="col-span-4">Hospital</div>
                <div className="col-span-2">Region</div>
                <div className="col-span-2 text-right">Resultat</div>
                <div className="col-span-2 text-right">Forløb</div>
                <div className="col-span-1 text-right">Δ</div>
              </div>

              <div className="divide-y divide-slate-200">
                {data.hospitalPerformanceRows.slice(0, 8).map((row) => (
                  <div key={row.hospital_id} className="grid grid-cols-12 px-4 py-3 text-sm">
                    <div className="col-span-1 font-semibold text-slate-950">{row.rang}</div>
                    <div className="col-span-4 text-slate-950">{row.hospital_navn}</div>
                    <div className="col-span-2 text-slate-600">{row.region}</div>
                    <div className="col-span-2 text-right font-semibold text-slate-950">
                      {row.vaerdi.toFixed(1)}
                      {formatUnit(row.enhed)}
                    </div>
                    <div className="col-span-2 text-right text-slate-700">{row.antal_forloeb}</div>
                    <div className="col-span-1 text-right font-semibold text-slate-950">
                      {formatImprovement(row.forbedring, row.enhed, row.retning)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard accent="rose" className="p-6">
            <div className="text-2xl font-semibold tracking-tight text-slate-950">
              Variation på tværs af afdelinger
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600">
              Eksempler på afdelingsniveau for den valgte indikator i {data.selectedYear}.
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="col-span-5">Afdeling</div>
                <div className="col-span-4">Hospital</div>
                <div className="col-span-3 text-right">Værdi</div>
              </div>

              <div className="divide-y divide-slate-200">
                {data.variationDepartments.slice(0, 8).map((row) => (
                  <div key={row.afdeling_id} className="grid grid-cols-12 px-4 py-3 text-sm">
                    <div className="col-span-5 text-slate-950">{row.afdeling_navn}</div>
                    <div className="col-span-4 text-slate-600">{row.hospital_navn}</div>
                    <div className="col-span-3 text-right font-semibold text-slate-950">
                      {row.vaerdi.toFixed(1)}
                      {formatUnit(data.selectedIndikator.enhed)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm font-medium text-slate-700">
              Variationsspænd: {data.variationMin.toFixed(1)}
              {formatUnit(data.selectedIndikator.enhed)} – {data.variationMax.toFixed(1)}
              {formatUnit(data.selectedIndikator.enhed)}
            </div>
          </GlassCard>
        </section>

        <section className="mt-12">
          <GlassCard accent="slate" className="p-6">
            <div className="text-2xl font-semibold tracking-tight text-slate-950">
              Indikatorer i databasen
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.indikatorCards.map((ind) => {
                const isActive = ind.indikator_id === data.selectedIndikator.indikator_id;

                return (
                  <Link
                    key={ind.indikator_id}
                    href={`/database/${data.database.database_id}?indikator=${ind.indikator_id}&aar=${data.selectedYear}`}
                    className={cn(
                      "rounded-[24px] border p-5 transition-all",
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                    )}
                  >
                    <div className={cn("text-sm font-medium", isActive ? "text-slate-200" : "text-slate-500")}>
                      {ind.indikator_type}
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight">
                      {ind.indikator_navn}
                    </div>
                    <div className={cn("mt-3 text-sm", isActive ? "text-slate-300" : "text-slate-600")}>
                      {ind.retning === "lavere_bedre" ? "Lavere er bedre" : "Højere er bedre"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
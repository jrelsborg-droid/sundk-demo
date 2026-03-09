import Link from "next/link";
import { loadDatabaseData } from "@/lib/data/loadDatabaseData";
import DatabaseFilters from "@/components/database/DatabaseFilters";
import DatabaseQuadrant from "@/components/database/DatabaseQuadrant";

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

const allTrendValues = [
  ...data.trendNational.map((p) => p.vaerdi),
  ...(data.hospitalTrends ?? []).flatMap((series) =>
    series.points.map((p) => p.vaerdi)
  ),
].filter(Number.isFinite);

const rawTrendMin = allTrendValues.length ? Math.min(...allTrendValues) : 0;
const rawTrendMax = allTrendValues.length ? Math.max(...allTrendValues) : 1;

const padding = (rawTrendMax - rawTrendMin) * 0.08 || 1;
const trendMin = Math.floor((rawTrendMin - padding) * 10) / 10;
const trendMax = Math.ceil((rawTrendMax + padding) * 10) / 10;
const trendRange = trendMax - trendMin || 1;

const yAxisTicks = Array.from({ length: 5 }, (_, i) => {
  const value = trendMin + (i * trendRange) / 4;
  return Number(value.toFixed(1));
}).reverse();

  const trendColors = [
    "rgb(56 189 248)",
    "rgb(245 158 11)",
    "rgb(168 85 247)",
    "rgb(244 63 94)",
    "rgb(16 185 129)",
  ];

  const variationScaleMin = Math.min(
    ...data.variationDepartments.map((d) => d.ci_nedre)
  );
  const variationScaleMax = Math.max(
    ...data.variationDepartments.map((d) => d.ci_oevre)
  );
  const variationScaleRange = variationScaleMax - variationScaleMin || 1;

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
  <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.95fr] lg:items-start">
    <div className="max-w-3xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Overblik
      </div>

      <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-tight text-slate-950 sm:text-6xl">
        {data.database.database_navn}
      </h1>

      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
        {data.database.database_navn} giver overblik over kvalitet, variation,
        udvikling og forbedring på tværs af hospitaler og afdelinger.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
          <span className="font-medium text-slate-500">Speciale</span>{" "}
          <span className="font-semibold text-slate-800">
            {data.database.speciale}
          </span>
        </div>
        <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
          <span className="font-medium text-slate-500">Indikatorer</span>{" "}
          <span className="font-semibold text-slate-800">
            {data.indikatorer.length}
          </span>
        </div>
        <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
          <span className="font-medium text-slate-500">Periode</span>{" "}
          <span className="font-semibold text-slate-800">
            {data.periodStart}–{data.periodEnd}
          </span>
        </div>
      </div>
    </div>

    <GlassCard accent="slate" className="p-5 lg:p-6">
      <div className="text-sm font-medium text-slate-500">Visning</div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        Vælg indikator og år
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-600">
        Filtrene opdaterer siden automatisk og styrer både kort, grafer og tabeller.
      </div>

      <div className="mt-5">
        <DatabaseFilters
          indikatorer={data.indikatorer.map((i) => ({
            indikator_id: i.indikator_id,
            indikator_navn: i.indikator_navn,
          }))}
          selectedIndikatorId={data.selectedIndikator.indikator_id}
          availableYears={data.availableYears}
          selectedYear={data.selectedYear}
        />
      </div>
    </GlassCard>
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
              <div className="text-sm font-medium text-slate-600">
                Bedste niveau i {data.selectedYear}
              </div>
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
              <div className="text-sm font-medium text-slate-600">
                Største forbedring siden baseline
              </div>
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
              <div className="text-sm font-medium text-slate-600">
                Spænd mellem hospitaler i {data.selectedYear}
              </div>
              <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                {data.variationValue.toFixed(1)}
                {formatUnit(data.selectedIndikator.enhed)}
              </div>
              <div className="mt-2 text-sm text-slate-500">{data.database.database_navn}</div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Min</span>
                <span className="font-semibold text-slate-900">
                  {data.variationMin.toFixed(1)}
                  {formatUnit(data.selectedIndikator.enhed)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Max</span>
                <span className="font-semibold text-slate-900">
                  {data.variationMax.toFixed(1)}
                  {formatUnit(data.selectedIndikator.enhed)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hospitaler</span>
                <span className="font-semibold text-slate-900">{data.hospitalCount}</span>
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
        Nationalt gennemsnit og udvalgte hospitaler for den valgte indikator.
      </div>
    </div>
    <CardEyebrow tone="sky">Trend</CardEyebrow>
  </div>

  <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-5">
    <div className="grid grid-cols-[56px_1fr] gap-4">
      <div className="relative h-[320px]">
        {yAxisTicks.map((tick, index) => (
          <div
            key={tick}
            className="absolute left-0 right-0 text-right text-xs text-slate-500"
            style={{ top: `${(index / (yAxisTicks.length - 1)) * 100}%`, transform: "translateY(-50%)" }}
          >
            {tick.toFixed(1)}
            {formatUnit(data.selectedIndikator.enhed)}
          </div>
        ))}
      </div>

      <div>
        <div className="relative h-[320px]">
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-5">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="border border-slate-100/70" />
            ))}
          </div>

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {(data.hospitalTrends ?? []).map((series, seriesIndex) => (
              <polyline
                key={series.hospital_id}
                fill="none"
                stroke={trendColors[(seriesIndex + 1) % trendColors.length]}
                strokeWidth="1.5"
                opacity="0.72"
                points={series.points
                  .map((p) => {
                    const x =
                      data.availableYears.length === 1
                        ? 50
                        : ((p.aar - data.periodStart) /
                            (data.periodEnd - data.periodStart || 1)) *
                          100;
                    const y = 100 - ((p.vaerdi - trendMin) / trendRange) * 84 - 8;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            ))}

            <polyline
              fill="none"
              stroke={trendColors[0]}
              strokeWidth="3"
              points={data.trendNational
                .map((p) => {
                  const x =
                    data.availableYears.length === 1
                      ? 50
                      : ((p.aar - data.periodStart) /
                          (data.periodEnd - data.periodStart || 1)) *
                        100;
                  const y = 100 - ((p.vaerdi - trendMin) / trendRange) * 84 - 8;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        </div>

        <div className="mt-3 flex justify-between px-1 text-xs text-slate-500">
          {data.availableYears.map((year, index) =>
            index % 2 === 0 || index === data.availableYears.length - 1 ? (
              <span key={year}>{year}</span>
            ) : (
              <span key={year} />
            )
          )}
        </div>
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-3 text-xs">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: trendColors[0] }}
        />
        <span className="font-medium text-slate-700">Nationalt gennemsnit</span>
      </div>

      {(data.hospitalTrends ?? []).map((series, index) => (
        <div
          key={series.hospital_id}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: trendColors[(index + 1) % trendColors.length] }}
          />
          <span className="font-medium text-slate-700">{series.hospital_navn}</span>
        </div>
      ))}
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

            <div className="mt-6">
              <DatabaseQuadrant
                rows={data.quadrantRows}
                indikatorNavn={data.selectedIndikator.indikator_navn}
              />
            </div>
          </GlassCard>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
 <GlassCard accent="slate" className="p-6">
  <div className="text-2xl font-semibold tracking-tight text-slate-950">
    Hospital performance
  </div>
  <div className="mt-2 text-sm leading-6 text-slate-600">
    Samlet overblik over resultater, aktivitet og udvikling for hospitaler i den valgte indikator.
  </div>

  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
    <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
      <div className="col-span-1">Rang</div>
      <div className="col-span-4">Hospital</div>
      <div className="col-span-2">Region</div>
      <div className="col-span-2 text-right">Resultat</div>
      <div className="col-span-2 text-right">Forløb</div>
      <div className="col-span-1 text-right">Δ</div>
    </div>

    <div className="divide-y divide-slate-200/90">
      {data.hospitalPerformanceRows.slice(0, 8).map((row) => (
        <div key={row.hospital_id} className="grid grid-cols-12 px-5 py-4 text-sm">
          <div className="col-span-1 font-semibold text-slate-950">{row.rang}</div>
          <div className="col-span-4 font-medium text-slate-950">{row.hospital_navn}</div>
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
    Konfidensinterval og observeret værdi for udvalgte afdelinger i {data.selectedYear}.
  </div>

  <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/60 p-5">
    <div className="space-y-5">
      {data.variationDepartments.slice(0, 8).map((row) => {
        const lineLeft =
          ((row.ci_nedre - variationScaleMin) / variationScaleRange) * 100;
        const lineRight =
          ((row.ci_oevre - variationScaleMin) / variationScaleRange) * 100;
        const pointLeft =
          ((row.vaerdi - variationScaleMin) / variationScaleRange) * 100;

        return (
          <div key={row.afdeling_id} className="grid grid-cols-[1.15fr_2fr] gap-5">
            <div>
              <div className="text-sm font-medium text-slate-950">
                {row.afdeling_navn}
              </div>
              <div className="mt-1 text-xs text-slate-500">{row.hospital_navn}</div>
            </div>

            <div className="relative pt-5">
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-200" />

              <div
                className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-slate-400"
                style={{
                  left: `${lineLeft}%`,
                  width: `${Math.max(lineRight - lineLeft, 1)}%`,
                }}
              />

              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-500/70 bg-rose-400 shadow-sm"
                style={{ left: `${pointLeft}%` }}
                title={`${row.vaerdi.toFixed(1)}${formatUnit(data.selectedIndikator.enhed)}`}
              />

              <div className="mt-7 flex justify-between text-[11px] text-slate-500">
                <span>
                  {row.ci_nedre.toFixed(1)}
                  {formatUnit(data.selectedIndikator.enhed)}
                </span>
                <span className="font-semibold text-slate-700">
                  {row.vaerdi.toFixed(1)}
                  {formatUnit(data.selectedIndikator.enhed)}
                </span>
                <span>
                  {row.ci_oevre.toFixed(1)}
                  {formatUnit(data.selectedIndikator.enhed)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700">
    <span className="font-medium">Variationsspænd:</span>{" "}
    {data.variationMin.toFixed(1)}
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
                    <div
                      className={cn(
                        "text-sm font-medium",
                        isActive ? "text-slate-200" : "text-slate-500"
                      )}
                    >
                      {ind.indikator_type}
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight">
                      {ind.indikator_navn}
                    </div>
                    <div
                      className={cn(
                        "mt-3 text-sm",
                        isActive ? "text-slate-300" : "text-slate-600"
                      )}
                    >
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
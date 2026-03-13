import Link from "next/link";
import PageBackground from "@/components/layout/PageBackground";
import TopNav from "@/components/navigation/TopNav";
import HospitalTrendControls from "@/components/hospital/HospitalTrendControls";
import { loadHospitalData } from "@/lib/data/loadHospitalData";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ aar?: string; database?: string; indikator?: string }>;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatSimpleValue(value: number | null, enhed?: string | null) {
  if (value == null) return "–";
  if (enhed === "pct" || enhed === "%") return `${value.toFixed(1)}%`;
  if (enhed === "dage") return `${value.toFixed(1)} dage`;
  if (enhed === "timer") return `${value.toFixed(1)} timer`;
  return value.toFixed(1);
}

function safePct(
  value: number | null,
  min: number,
  max: number,
  invert = false,
  fallback = 50
) {
  if (value == null) return fallback;
  if (max === min) return fallback;
  const raw = ((value - min) / (max - min)) * 100;
  return invert ? 100 - raw : raw;
}

function getTooltipPlacement(x: number, y: number) {
  const horizontal =
    x > 82 ? "right-full mr-3" : x < 18 ? "left-5" : "left-5";
  const vertical = y < 18 ? "top-0" : y > 82 ? "bottom-0" : "top-0";
  return `${horizontal} ${vertical}`;
}

function getPerformanceTone(rank: number | null, populationSize: number) {
  if (rank == null || populationSize <= 1) {
    return {
      card: "border-slate-200 bg-slate-50/70",
      badge: "text-slate-500",
      label: "Uafklaret",
    };
  }

  const percentile = rank / populationSize;

  if (percentile <= 0.25) {
    return {
      card: "border-emerald-100 bg-emerald-50/70",
      badge: "text-emerald-700",
      label: "Står stærkt",
    };
  }

  if (percentile >= 0.75) {
    return {
      card: "border-rose-100 bg-rose-50/70",
      badge: "text-rose-700",
      label: "Kræver opmærksomhed",
    };
  }

  return {
    card: "border-amber-100 bg-amber-50/70",
    badge: "text-amber-700",
    label: "Blandet billede",
  };
}

export default async function HospitalPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await loadHospitalData(id, resolvedSearchParams);

  const validLandscapeX = data.landscapeRows
    .map((r) => r.xForbedring)
    .filter((v): v is number => v != null);

  const validLandscapeY = data.landscapeRows
    .map((r) => r.yScore)
    .filter((v): v is number => v != null);

  const minX = validLandscapeX.length ? Math.min(...validLandscapeX) : -1;
  const maxX = validLandscapeX.length ? Math.max(...validLandscapeX) : 1;
  const minY = validLandscapeY.length ? Math.min(...validLandscapeY) : 0;
  const maxY = validLandscapeY.length ? Math.max(...validLandscapeY) : 1;

  const trendValues = data.trendSeries
    .flatMap((d) => [d.hospitalValue, d.nationalValue, d.bestHospitalValue])
    .filter((v): v is number => v != null);

  const trendMin = trendValues.length ? Math.min(...trendValues) : 0;
  const trendMax = trendValues.length ? Math.max(...trendValues) : 1;

  const trendTicks = 5;
  const trendAxisValues = Array.from({ length: trendTicks }, (_, i) => {
    const ratio = i / (trendTicks - 1);
    return trendMax - ratio * (trendMax - trendMin);
  });

  const trendHospitalPoints = data.trendSeries.map((point) => ({
    x: `${((point.aar - data.periodStart) / Math.max(1, data.periodEnd - data.periodStart)) * 100}%`,
    y: `${safePct(point.hospitalValue, trendMin, trendMax, true)}%`,
    value: point.hospitalValue,
    aar: point.aar,
  }));

  const trendNationalPoints = data.trendSeries.map((point) => ({
    x: `${((point.aar - data.periodStart) / Math.max(1, data.periodEnd - data.periodStart)) * 100}%`,
    y: `${safePct(point.nationalValue, trendMin, trendMax, true)}%`,
    value: point.nationalValue,
    aar: point.aar,
  }));

  const trendBestPoints = data.trendSeries.map((point) => ({
    x: `${((point.aar - data.periodStart) / Math.max(1, data.periodEnd - data.periodStart)) * 100}%`,
    y: `${safePct(point.bestHospitalValue, trendMin, trendMax, true)}%`,
    value: point.bestHospitalValue,
    aar: point.aar,
  }));

  const indicatorOptions = data.selectedDatabaseId
    ? data.indikatorCards.map((item) => ({
        id: item.indikator_id,
        navn: item.indikator_navn,
        type: item.indikator_type,
      }))
    : [];

  const focusedVariationRows =
    data.selectedDatabaseId && data.selectedIndicatorId
      ? data.departmentVariationRows
          .filter(
            (row) =>
              row.database_id === data.selectedDatabaseId &&
              row.indikator_id === data.selectedIndicatorId
          )
          .sort((a, b) => {
            if (a.vaerdi == null && b.vaerdi == null) return 0;
            if (a.vaerdi == null) return 1;
            if (b.vaerdi == null) return -1;
            return a.vaerdi - b.vaerdi;
          })
      : [];

  const variationValues = focusedVariationRows
    .flatMap((d) => [d.ci_nedre, d.vaerdi, d.ci_oevre])
    .filter((v): v is number => v != null);

  const variationMin = variationValues.length ? Math.min(...variationValues) : 0;
  const variationMax = variationValues.length ? Math.max(...variationValues) : 1;

  function variationXPct(value: number | null) {
    return safePct(value, variationMin, variationMax, false, 50);
  }

  const selectedIndicatorMeta =
    data.selectedIndicatorId != null
      ? data.indikatorCards.find((x) => x.indikator_id === data.selectedIndicatorId) ?? null
      : null;

  const benchmarkRows = data.performanceRows.length;
  const cardRows = data.indikatorCards.slice(0, 9).map((card) => {
    const row = data.performanceRows.find((r) => r.indikator_id === card.indikator_id);
    const tone = getPerformanceTone(row?.rang ?? null, Math.max(benchmarkRows, 1));
    return { card, row, tone };
  });

  return (
    <PageBackground>
      <div className="mx-auto max-w-[1440px] px-4 pb-16 md:px-6">
        <TopNav
          databases={data.allDatabases}
          hospitals={data.allHospitals}
          active="hospital"
        />

        {/* Header */}
        <div className="mt-8 rounded-[32px] border border-slate-200/80 bg-white/78 p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Hospital
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {data.hospital.hospital_navn}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Indblik i resultater på tværs af kliniske kvalitetsdatabaser for{" "}
                {data.hospital.hospital_navn}. Siden viser benchmark, udvikling,
                variation og overblik over, hvor hospitalet står stærkt – og hvor der
                er mest at hente.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Periode
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {data.periodStart}–{data.periodEnd}
              </div>
              <div className="mt-1 text-xs text-slate-500">Valgt år: {data.selectedYear}</div>
            </div>
          </div>
        </div>

        {/* Scorecards flyttet op */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[28px] border border-amber-100 bg-amber-50/80 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Benchmark
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {data.benchmarkSummary.value}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {data.benchmarkSummary.description}
            </p>
            <div className="mt-4 space-y-2">
              {data.benchmarkSummary.subRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{row.label}</span>
                  <span className="font-medium text-slate-950">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-sky-100 bg-sky-50/80 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              Bevægelse
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {data.movementSummary.value}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {data.movementSummary.description}
            </p>
            <div className="mt-4 space-y-2">
              {data.movementSummary.subRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{row.label}</span>
                  <span className="font-medium text-slate-950">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-rose-50/80 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">
              Variation
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {data.variationSummary.value}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {data.variationSummary.description}
            </p>
            <div className="mt-4 space-y-2">
              {data.variationSummary.subRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{row.label}</span>
                  <span className="font-medium text-slate-950">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hovedindhold */}
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Landskab */}
          <div className="rounded-[32px] border border-slate-200/80 bg-white/76 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  På tværs af databaser
                </div>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Hvor står hospitalet stærkest?
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  Hver prik viser en database. Placeringen kombinerer gennemsnitlig
                  forbedring siden baseline og gennemsnitlig rangscore på tværs af
                  indikatorer.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
              <div className="relative h-[420px] overflow-hidden rounded-[20px] bg-[linear-gradient(to_right,rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:48px_48px]">
                <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-300" />
                <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-slate-300" />

                <div className="absolute left-6 top-6 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700">
                  Stærke frontløbere
                </div>
                <div className="absolute right-6 top-6 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[12px] font-medium text-sky-700">
                  Forbedrer sig
                </div>
                <div className="absolute bottom-6 left-6 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700">
                  Under udvikling
                </div>
                <div className="absolute bottom-6 right-6 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700">
                  Kræver opmærksomhed
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                  Gennemsnitlig forbedring siden baseline
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
                  Gennemsnitlig rangscore
                </div>

                {data.landscapeRows.map((point) => {
                  const x = safePct(point.xForbedring, minX, maxX, false, 50);
                  const y = safePct(point.yScore, minY, maxY, true, 50);

                  return (
                    <div
                      key={point.id}
                      className="group absolute"
                      style={{
                        left: `calc(${x}% - 8px)`,
                        top: `calc(${y}% - 8px)`,
                      }}
                    >
                      <div className="h-4 w-4 rounded-full border border-sky-500 bg-sky-400 shadow-sm" />

                      <div
                        className={cn(
                          "pointer-events-none absolute z-20 hidden w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-xl group-hover:block",
                          getTooltipPlacement(x, y)
                        )}
                      >
                        <div className="font-semibold text-slate-900">{point.navn}</div>
                        <div className="mt-1 text-slate-600">Speciale: {point.speciale}</div>
                        <div className="text-slate-600">
                          Gns. rang: {point.avgRank == null ? "–" : point.avgRank.toFixed(1)}
                        </div>
                        <div className="text-slate-600">
                          Rangscore: {point.yScore == null ? "–" : point.yScore.toFixed(2)}
                        </div>
                        <div className="text-slate-600">
                          Forbedring:{" "}
                          {point.xForbedring == null ? "–" : point.xForbedring.toFixed(2)}
                        </div>
                        <div className="text-slate-600">Indikatorer: {point.indikatorCount}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trend + filtre samlet */}
          <div className="rounded-[32px] border border-sky-100 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                  Udvikling over tid
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Vælg år, database og indikator for at se udviklingen for hospitalet
                  sammenholdt med nationalt niveau og bedste hospital.
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                Trend
              </span>
            </div>

            <div className="mt-5">
              <HospitalTrendControls
                selectedYear={data.selectedYear}
                availableYears={data.availableYears}
                selectedDatabaseId={data.selectedDatabaseId}
                databases={data.databasesForFilter}
                selectedIndicatorId={data.selectedIndicatorId}
                indicators={indicatorOptions}
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
              {!data.trendMeta.enabled ? (
                <div className="flex h-[320px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center text-sm leading-7 text-slate-500">
                  Vælg først en database i filteret. Derefter kan du også vælge indikator
                  og se udviklingen over tid.
                </div>
              ) : (
                <div className="grid grid-cols-[44px_1fr] gap-3">
                  <div className="relative h-[320px]">
                    {trendAxisValues.map((tick, idx) => {
                      const top = `${(idx / (trendTicks - 1)) * 100}%`;
                      return (
                        <div
                          key={idx}
                          className="absolute right-0 -translate-y-1/2 text-[11px] text-slate-500"
                          style={{ top }}
                        >
                          {formatSimpleValue(tick, data.trendMeta.enhed)}
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative h-[320px]">
                    <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(to_right,rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:48px_48px]" />

                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        fill="none"
                        stroke="rgb(14 165 233)"
                        strokeWidth="0.8"
                        points={trendHospitalPoints
                          .filter((p) => p.value != null)
                          .map((p) => `${parseFloat(p.x)},${parseFloat(p.y)}`)
                          .join(" ")}
                      />
                      <polyline
                        fill="none"
                        stroke="rgb(100 116 139)"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        points={trendNationalPoints
                          .filter((p) => p.value != null)
                          .map((p) => `${parseFloat(p.x)},${parseFloat(p.y)}`)
                          .join(" ")}
                      />
                      <polyline
                        fill="none"
                        stroke="rgb(16 185 129)"
                        strokeWidth="0.8"
                        points={trendBestPoints
                          .filter((p) => p.value != null)
                          .map((p) => `${parseFloat(p.x)},${parseFloat(p.y)}`)
                          .join(" ")}
                      />
                    </svg>

                    {trendHospitalPoints.map((point) =>
                      point.value == null ? null : (
                        <div
                          key={`hospital-${point.aar}`}
                          className="group absolute"
                          style={{
                            left: `calc(${point.x} - 5px)`,
                            top: `calc(${point.y} - 5px)`,
                          }}
                        >
                          <div className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm" />
                          <div className="pointer-events-none absolute left-4 top-0 z-10 hidden w-40 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block">
                            <div className="font-semibold text-slate-900">
                              {data.hospital.hospital_navn}
                            </div>
                            <div className="text-slate-600">{point.aar}</div>
                            <div className="mt-1 text-slate-700">
                              {formatSimpleValue(point.value, data.trendMeta.enhed)}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {trendNationalPoints.map((point) =>
                      point.value == null ? null : (
                        <div
                          key={`national-${point.aar}`}
                          className="group absolute"
                          style={{
                            left: `calc(${point.x} - 4px)`,
                            top: `calc(${point.y} - 4px)`,
                          }}
                        >
                          <div className="h-2 w-2 rounded-full bg-slate-500 shadow-sm" />
                          <div className="pointer-events-none absolute left-4 top-0 z-10 hidden w-32 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block">
                            <div className="font-semibold text-slate-900">Nationalt</div>
                            <div className="text-slate-600">{point.aar}</div>
                            <div className="mt-1 text-slate-700">
                              {formatSimpleValue(point.value, data.trendMeta.enhed)}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {trendBestPoints.map((point) =>
                      point.value == null ? null : (
                        <div
                          key={`best-${point.aar}`}
                          className="group absolute"
                          style={{
                            left: `calc(${point.x} - 4px)`,
                            top: `calc(${point.y} - 4px)`,
                          }}
                        >
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                          <div className="pointer-events-none absolute left-4 top-0 z-10 hidden w-48 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block">
                            <div className="font-semibold text-slate-900">
                              {data.trendMeta.bestHospitalName ?? "Bedste hospital"}
                            </div>
                            <div className="text-slate-600">{point.aar}</div>
                            <div className="mt-1 text-slate-700">
                              {formatSimpleValue(point.value, data.trendMeta.enhed)}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[11px] text-slate-500">
                      {data.trendSeries.map((point) => (
                        <div key={point.aar}>{point.aar}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {data.trendMeta.enabled ? (
              <>
                <div className="mt-4 text-sm text-slate-600">
                  Valgt indikator:{" "}
                  <span className="font-medium text-slate-950">
                    {data.trendMeta.indicatorName}
                  </span>
                  {data.trendMeta.databaseName ? (
                    <>
                      {" "}
                      · Database:{" "}
                      <span className="font-medium text-slate-950">
                        {data.trendMeta.databaseName}
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    {data.hospital.hospital_navn}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    Nationalt niveau
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {data.trendMeta.bestHospitalName ?? "Bedste hospital i aktuelt år"}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Intern variation - model A */}
        <div className="mt-8 rounded-[32px] border border-slate-200/80 bg-white/76 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Afdelingsvariation
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Intern variation
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Hver række viser én afdeling for den valgte indikator i den valgte
                database. Prikken er afdelingens værdi, og den vandrette linje viser
                intervallet omkring målingen.
              </p>
            </div>
          </div>

          {data.selectedDatabaseId && data.selectedIndicatorId && selectedIndicatorMeta ? (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
              <div className="rounded-full bg-slate-100 px-3 py-1.5">
                Database:{" "}
                <span className="font-medium text-slate-900">
                  {data.trendMeta.databaseName ?? "Valgt database"}
                </span>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5">
                Indikator:{" "}
                <span className="font-medium text-slate-900">
                  {selectedIndicatorMeta.indikator_navn}
                </span>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1.5">
                Retning:{" "}
                <span className="font-medium text-slate-900">
                  {selectedIndicatorMeta.retning === "lavere_bedre"
                    ? "Lavere er bedre"
                    : "Højere er bedre"}
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
            {!data.selectedDatabaseId || !data.selectedIndicatorId ? (
              <div className="flex h-[260px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center text-sm leading-6 text-slate-500">
                Vælg først database og indikator i trendkortet for at se intern variation
                mellem afdelinger.
              </div>
            ) : !focusedVariationRows.length ? (
              <div className="flex h-[260px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center text-sm leading-6 text-slate-500">
                Ingen afdelingsdata fundet for det valgte udsnit.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative h-[260px]">
                  <div className="absolute inset-x-[160px] top-1/2 border-t border-dashed border-slate-300" />

                  {focusedVariationRows.map((row, idx) => {
                    const top = 22 + idx * 28;

                    return (
                      <div
                        key={`${row.afdeling_id}-${row.indikator_id}`}
                        className="absolute inset-x-0 group"
                        style={{ top }}
                      >
                        <div className="absolute left-0 w-36 truncate text-xs text-slate-600">
                          {row.afdeling_navn}
                        </div>

                        {row.ci_nedre != null && row.ci_oevre != null ? (
                          <div
                            className="absolute h-[2px] rounded-full bg-slate-300"
                            style={{
                              left: `calc(160px + ${variationXPct(row.ci_nedre) * 0.72}%)`,
                              width: `${Math.max(
                                8,
                                (variationXPct(row.ci_oevre) - variationXPct(row.ci_nedre)) * 0.72
                              )}%`,
                              top: 9,
                            }}
                          />
                        ) : null}

                        {row.vaerdi != null ? (
                          <div
                            className="absolute h-3 w-3 -translate-x-1/2 rounded-full border border-rose-500 bg-rose-400 shadow-sm"
                            style={{
                              left: `calc(160px + ${variationXPct(row.vaerdi) * 0.72}%)`,
                              top: 4,
                            }}
                          />
                        ) : null}

                        <div className="pointer-events-none absolute left-[380px] top-0 z-20 hidden w-56 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block">
                          <div className="font-semibold text-slate-900">{row.afdeling_navn}</div>
                          <div className="mt-1 text-slate-600">
                            {selectedIndicatorMeta?.indikator_navn}
                          </div>
                          <div className="text-slate-600">{row.database_navn}</div>
                          <div className="mt-1 text-slate-700">
                            Værdi: {formatSimpleValue(row.vaerdi, row.enhed)}
                          </div>
                          <div className="text-slate-700">
                            Interval: {formatSimpleValue(row.ci_nedre, row.enhed)} –{" "}
                            {formatSimpleValue(row.ci_oevre, row.enhed)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pl-[160px] text-[11px] text-slate-500">
                  <div>{formatSimpleValue(variationMin, focusedVariationRows[0]?.enhed)}</div>
                  <div>
                    {formatSimpleValue(
                      (variationMin + variationMax) / 2,
                      focusedVariationRows[0]?.enhed
                    )}
                  </div>
                  <div>{formatSimpleValue(variationMax, focusedVariationRows[0]?.enhed)}</div>
                </div>
              </div>
            )}
          </div>

          {focusedVariationRows.length ? (
            <div className="mt-4 space-y-2">
              {focusedVariationRows.slice(0, 8).map((row) => (
                <div
                  key={`meta-${row.afdeling_id}-${row.indikator_id}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-950">{row.afdeling_navn}</div>
                    <div className="text-xs text-slate-500">
                      {selectedIndicatorMeta?.indikator_navn} · {row.database_navn}
                    </div>
                  </div>
                  <div className="font-medium text-slate-900">
                    {formatSimpleValue(row.vaerdi, row.enhed)}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Indikatorkort - farver viser performance */}
        <div className="mt-8 rounded-[32px] border border-slate-200/80 bg-white/76 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Hurtigt overblik
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Indikatorer værd at dykke videre ned i
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Farven på kortene viser det aktuelle performancebillede i det valgte
                udsnit. Grøn betyder, at indikatoren står stærkt relativt til de øvrige,
                amber er mere blandet, og rose peger på noget, der fortjener ekstra
                opmærksomhed.
              </p>
            </div>

            {data.selectedDatabaseId ? (
              <Link
                href={`/database/${data.selectedDatabaseId}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Gå til databasesiden
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cardRows.map(({ card, row, tone }) => (
              <div
                key={card.indikator_id}
                className={cn("rounded-[24px] border p-5", tone.card)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {card.indikator_type || "Indikator"}
                  </div>
                  <div className={cn("text-xs font-medium", tone.badge)}>{tone.label}</div>
                </div>

                <div className="mt-3 text-lg font-semibold leading-7 text-slate-950">
                  {card.indikator_navn}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/70 p-3">
                    <div className="text-xs text-slate-500">Niveau</div>
                    <div className="mt-1 font-medium text-slate-950">
                      {formatSimpleValue(row?.vaerdi ?? null, card.enhed)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-3">
                    <div className="text-xs text-slate-500">Udvikling</div>
                    <div className="mt-1 font-medium text-slate-950">
                      {formatSimpleValue(row?.forbedring ?? null, card.enhed)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {card.retning === "lavere_bedre" ? "Lavere er bedre" : "Højere er bedre"}
                  </span>
                  <span>{row?.rang == null ? "Rang –" : `Rang #${Math.round(row.rang)}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
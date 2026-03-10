import Link from "next/link";
import HospitalFilters from "@/components/hospital/HospitalFilters";
import { loadHospitalData } from "@/lib/data/loadHospitalData";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ aar?: string; database?: string }>;
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
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

  const trendValues = data.trendSeries.flatMap((d) => [d.hospitalValue, d.nationalValue]).filter((v): v is number => v != null);
  const trendMin = trendValues.length ? Math.min(...trendValues) : 0;
  const trendMax = trendValues.length ? Math.max(...trendValues) : 1;

  const variationValues = data.departmentVariationRows.flatMap((d) => [d.ci_nedre, d.vaerdi, d.ci_oevre]).filter((v): v is number => v != null);
  const variationMin = variationValues.length ? Math.min(...variationValues) : 0;
  const variationMax = variationValues.length ? Math.max(...variationValues) : 1;

  function xPct(value: number | null) {
    if (value == null) return 50;
    if (maxX === minX) return 50;
    return ((value - minX) / (maxX - minX)) * 100;
  }

  function yPct(value: number | null) {
    if (value == null) return 50;
    if (maxY === minY) return 50;
    return 100 - ((value - minY) / (maxY - minY)) * 100;
  }

  function trendYPct(value: number | null) {
    if (value == null) return 50;
    if (trendMax === trendMin) return 50;
    return 100 - ((value - trendMin) / (trendMax - trendMin)) * 100;
  }

  function variationPct(value: number | null) {
    if (value == null) return 50;
    if (variationMax === variationMin) return 50;
    return ((value - variationMin) / (variationMax - variationMin)) * 100;
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-10 md:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Hospitalprofilen
            </div>

            <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
              {data.hospital.hospital_navn}
            </h1>

            <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">
              Kvalitetsprofil på tværs af kliniske databaser med fokus på niveau, udvikling og intern variation.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                Region <span className="font-semibold text-slate-900">{data.hospital.region}</span>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                <span className="font-semibold text-slate-900">{data.databaseCount}</span> databaser
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                <span className="font-semibold text-slate-900">{data.indikatorCount}</span> indikatorer
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                Periode <span className="font-semibold text-slate-900">{data.periodStart}–{data.periodEnd}</span>
              </div>
            </div>
          </section>

          <HospitalFilters
            availableYears={data.availableYears}
            selectedYear={data.selectedYear}
            databases={data.databasesForFilter}
            selectedDatabaseId={data.selectedDatabaseId}
          />
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            {
              tone: "amber",
              title: "Benchmark",
              value: data.benchmarkSummary.value,
              description: data.benchmarkSummary.description,
              rows: data.benchmarkSummary.subRows,
            },
            {
              tone: "sky",
              title: "Bevægelse",
              value: data.movementSummary.value,
              description: data.movementSummary.description,
              rows: data.movementSummary.subRows,
            },
            {
              tone: "rose",
              title: "Variation",
              value: data.variationSummary.value,
              description: data.variationSummary.description,
              rows: data.variationSummary.subRows,
            },
          ].map((card) => (
            <div
              key={card.title}
              className={cn(
                "rounded-[28px] border bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur",
                card.tone === "amber" && "border-amber-200",
                card.tone === "sky" && "border-sky-200",
                card.tone === "rose" && "border-rose-200"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    card.tone === "amber" && "bg-amber-50 text-amber-700",
                    card.tone === "sky" && "bg-sky-50 text-sky-700",
                    card.tone === "rose" && "bg-rose-50 text-rose-700"
                  )}
                >
                  {card.title}
                </span>
              </div>

              <div className="mt-6 text-5xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>

              <div className="mt-6 space-y-3 border-t border-slate-200/80 pt-4">
                {card.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-medium text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-sky-100 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                  Hospitalets kvalitetslandskab
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Databaser placeret efter gennemsnitlig udvikling og gennemsnitlig rangscore i det valgte år.
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                Performancekort
              </span>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/60 p-4">
              <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:48px_48px]">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-300" />
                <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-300" />

                <div className="absolute left-4 top-4 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  Stærke databaser
                </div>
                <div className="absolute bottom-4 left-4 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  Under udvikling
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">
                  Kræver opmærksomhed
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                  Gennemsnitlig forbedring siden baseline
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
                  Gennemsnitlig rangscore
                </div>

                {data.landscapeRows.map((point) => (
                  <div
                    key={point.id}
                    className="group absolute"
                    style={{
                      left: `calc(${xPct(point.xForbedring)}% - 8px)`,
                      top: `calc(${yPct(point.yScore)}% - 8px)`,
                    }}
                  >
                    <div className="h-4 w-4 rounded-full border border-sky-500 bg-sky-400 shadow-sm" />
                    <div className="pointer-events-none absolute left-5 top-0 z-10 hidden w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-xl group-hover:block">
                      <div className="font-semibold text-slate-900">{point.navn}</div>
                      <div className="mt-1 text-slate-600">Speciale: {point.speciale}</div>
                      <div className="text-slate-600">
                        Gns. rang: {point.avgRank == null ? "–" : point.avgRank.toFixed(1)}
                      </div>
                      <div className="text-slate-600">
                        Rangscore: {point.yScore == null ? "–" : point.yScore.toFixed(2)}
                      </div>
                      <div className="text-slate-600">
                        Forbedring: {point.xForbedring == null ? "–" : point.xForbedring.toFixed(2)}
                      </div>
                      <div className="text-slate-600">
                        Indikatorer: {point.indikatorCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[32px] border border-sky-100 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                    Udvikling over tid
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {data.trendMeta.enabled
                      ? `Hospitalet sammenholdt med nationalt niveau for ${data.trendMeta.indicatorName} i ${data.trendMeta.databaseName}.`
                      : "Vælg én database for at se en meningsfuld trend over tid."}
                  </p>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                  Trend
                </span>
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/60 p-4">
                {!data.trendMeta.enabled ? (
                  <div className="flex h-[280px] items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50/60 px-6 text-center text-sm leading-6 text-slate-500">
                    Vælg en database i filteret for at vise trend for en konkret indikator over tid.
                  </div>
                ) : (
                  <div className="relative h-[280px]">
                    <div className="absolute inset-0 rounded-[20px] bg-[linear-gradient(to_right,rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:48px_48px]" />

                    <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible">
                      {(() => {
                        const hospitalPoints = data.trendSeries.map((d, i) => {
                          const x =
                            data.trendSeries.length <= 1
                              ? 50
                              : (i / (data.trendSeries.length - 1)) * 100;
                          const y = trendYPct(d.hospitalValue);
                          return `${x},${y}`;
                        });

                        const nationalPoints = data.trendSeries.map((d, i) => {
                          const x =
                            data.trendSeries.length <= 1
                              ? 50
                              : (i / (data.trendSeries.length - 1)) * 100;
                          const y = trendYPct(d.nationalValue);
                          return `${x},${y}`;
                        });

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="rgb(148 163 184)"
                              strokeWidth="1.2"
                              points={nationalPoints.join(" ")}
                            />
                            <polyline
                              fill="none"
                              stroke="rgb(14 165 233)"
                              strokeWidth="1.6"
                              points={hospitalPoints.join(" ")}
                            />

                            {data.trendSeries.map((d, i) => {
                              const x =
                                data.trendSeries.length <= 1
                                  ? 50
                                  : (i / (data.trendSeries.length - 1)) * 100;
                              const y = trendYPct(d.hospitalValue);

                              return (
                                <circle
                                  key={`hospital-${d.aar}`}
                                  cx={x}
                                  cy={y}
                                  r="1.6"
                                  fill="rgb(14 165 233)"
                                />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>

                    <div className="pointer-events-none absolute inset-x-4 bottom-0 flex justify-between text-[11px] text-slate-500">
                      {data.trendSeries.map((point) => (
                        <span key={point.aar}>{point.aar}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.trendMeta.enabled && (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      Hospital
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      Nationalt gennemsnit
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      Enhed: {data.trendMeta.enhed}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-rose-100 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                    Variation på tværs af afdelinger
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Konfidensintervaller og observeret værdi for udvalgte afdelinger.
                  </p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                  Variation
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {data.departmentVariationRows.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/60 p-6 text-sm text-slate-500">
                    Intet variationsgrundlag for det valgte udsnit.
                  </div>
                ) : (
                  data.departmentVariationRows.map((row) => {
                    const left = variationPct(row.ci_nedre);
                    const center = variationPct(row.vaerdi);
                    const right = variationPct(row.ci_oevre);
                    const barLeft = Math.min(left, right);
                    const barWidth = Math.max(Math.abs(right - left), 2);

                    return (
                      <div
                        key={`${row.afdeling_id}-${row.indikator_id}`}
                        className="rounded-[22px] border border-slate-200 bg-white/60 p-4"
                      >
                        <div className="text-sm font-medium text-slate-900">{row.afdeling_navn}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {row.database_navn} · {row.indikator_navn}
                        </div>

                        <div className="mt-4 grid grid-cols-[64px_1fr_64px] items-center gap-3">
                          <div className="text-xs text-slate-500">
                            {formatSimpleValue(row.ci_nedre, row.enhed)}
                          </div>

                          <div className="relative h-8">
                            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-300" />
                            <div
                              className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-slate-400"
                              style={{
                                left: `${clamp01(barLeft / 100) * 100}%`,
                                width: `${clamp01(barWidth / 100) * 100}%`,
                              }}
                            />
                            <div
                              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-500 bg-rose-400"
                              style={{ left: `${center}%` }}
                            />
                          </div>

                          <div className="text-right text-xs text-slate-500">
                            {formatSimpleValue(row.ci_oevre, row.enhed)}
                          </div>
                        </div>

                        <div className="mt-2 text-center text-xs font-medium text-slate-700">
                          {formatSimpleValue(row.vaerdi, row.enhed)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                Indikatorperformance i hospitalets databaser
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ét overblik pr. indikator med niveau, udvikling, aktivitet og placering.
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
              Oversigt
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.7fr_1fr_1fr_110px_100px] bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <div>Database / indikator</div>
              <div>Niveau</div>
              <div>Udvikling</div>
              <div>Forløb</div>
              <div>Rang</div>
            </div>

            <div className="divide-y divide-slate-200/80 bg-white/60">
              {data.performanceRows.map((row) => (
                <Link
                  key={`${row.database_id}-${row.indikator_id}`}
                  href={`/database/${row.database_id}?indikator=${row.indikator_id}&aar=${data.selectedYear}`}
                  className="grid grid-cols-[1.7fr_1fr_1fr_110px_100px] items-center px-5 py-4 text-sm transition hover:bg-white"
                >
                  <div>
                    <div className="font-medium text-slate-900">{row.database_navn}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.indikator_navn}
                    </div>
                  </div>

                  <div className="font-medium text-slate-900">
                    {formatSimpleValue(row.vaerdi, row.enhed)}
                  </div>

                  <div className="font-medium text-slate-900">
                    {formatSimpleValue(row.forbedring, row.enhed)}
                  </div>

                  <div className="font-medium text-slate-900">
                    {row.antal_forloeb == null ? "–" : Math.round(row.antal_forloeb)}
                  </div>

                  <div className="font-medium text-slate-900">
                    {row.rang == null ? "–" : Math.round(row.rang)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
            Indikatorer i hospitalet
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.indikatorCards.map((card) => (
              <div
                key={card.indikator_id}
                className="rounded-[24px] border border-slate-200 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-sm text-slate-500">{card.indikator_type}</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {card.indikator_navn}
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {card.retning === "lavere_bedre" ? "Lavere er bedre" : "Højere er bedre"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
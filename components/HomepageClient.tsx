"use client";

import { useMemo, useState } from "react";
import type {
  DatabaseDimRow,
  HomepageData,
  HospitalDimRow,
} from "@/lib/loadHomepageData";

type LevelRow = {
  id: string;
  navn: string;
  region: string;
  vaerdi: number;
  forbedring: number;
  rang: number;
  enhed: string;
  retning: "lavere_bedre" | "hoejere_bedre";
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatUnit(enhed: string) {
  if (enhed === "pct") return "%";
  if (enhed === "%") return "%";
  if (enhed === "dage") return " dage";
  if (enhed === "timer") return " timer";
  if (enhed === "index_0_100") return "";
  return "";
}

function getDagensDatabase(databases: DatabaseDimRow[]) {
  const today = new Date().toISOString().slice(0, 10);
  const hash = [...today].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return databases[hash % databases.length];
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

function formatImprovement(
  value: number,
  enhed: string,
  retning: "lavere_bedre" | "hoejere_bedre"
) {
  if (!Number.isFinite(value)) return "—";
  const absVal = Math.abs(value).toFixed(1);

  if (retning === "lavere_bedre") {
    return `−${absVal}${formatUnit(enhed)}`;
  }

  return `+${absVal}${formatUnit(enhed)}`;
}

function improvementExplanation(retning: "lavere_bedre" | "hoejere_bedre") {
  return retning === "lavere_bedre"
    ? "Bedre = lavere niveau end i 2018"
    : "Bedre = højere niveau end i 2018";
}

function GlassCard({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/72 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
        hover &&
          "transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] hover:bg-white/90",
        className
      )}
    >
      {children}
    </div>
  );
}

function MenuDatabases({
  databases,
  onSelect,
}: {
  databases: DatabaseDimRow[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative group">
      <button className="text-sm text-slate-700 hover:text-slate-950 transition-colors">
        Databaser
      </button>
      <div className="invisible absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 overflow-auto">
          {databases
            .slice()
            .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
            .map((db) => (
              <button
                key={db.database_id}
                onClick={() => onSelect(db.database_id)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                {db.database_navn}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function MenuHospitals({
  hospitalsByRegion,
}: {
  hospitalsByRegion: Array<[string, HospitalDimRow[]]>;
}) {
  return (
    <div className="relative group">
      <button className="text-sm text-slate-700 hover:text-slate-950 transition-colors">
        Hospitaler
      </button>
      <div className="invisible absolute left-0 top-full z-30 mt-2 w-[340px] rounded-2xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 overflow-auto space-y-3">
          {hospitalsByRegion.map(([region, regionHospitals]) => (
            <div key={region}>
              <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {region}
              </div>
              {regionHospitals.map((h) => (
                <button
                  key={h.hospital_id}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  {h.hospital_navn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuDataOgRapporter({
  databases,
}: {
  databases: DatabaseDimRow[];
}) {
  return (
    <div className="relative group">
      <button className="text-sm text-slate-700 hover:text-slate-950 transition-colors">
        Data og rapporter
      </button>

      <div className="invisible absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <button className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
          Dyk ned i data
        </button>

        <div className="relative group/reports">
          <button className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">
            <span>Årsrapporter</span>
            <span className="text-slate-400">›</span>
          </button>

          <div className="invisible absolute left-full top-0 ml-2 z-40 w-80 rounded-2xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover/reports:visible group-hover/reports:opacity-100">
            <div className="max-h-80 overflow-auto">
              {databases
                .slice()
                .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
                .map((db) => (
                  <button
                    key={db.database_id}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {db.database_navn}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedToggle({
  value,
  onChange,
}: {
  value: "hospital" | "afdeling";
  onChange: (value: "hospital" | "afdeling") => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-1 text-sm shadow-sm">
      <button
        onClick={() => onChange("hospital")}
        className={cn(
          "rounded-lg px-3 py-1.5 transition-colors",
          value === "hospital" ? "bg-slate-900 text-white" : "text-slate-700"
        )}
      >
        Hospitaler
      </button>
      <button
        onClick={() => onChange("afdeling")}
        className={cn(
          "rounded-lg px-3 py-1.5 transition-colors",
          value === "afdeling" ? "bg-slate-900 text-white" : "text-slate-700"
        )}
      >
        Afdelinger
      </button>
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

function MagiskKvadrant({
  rows,
  visning,
  indikatorNavn,
}: {
  rows: LevelRow[];
  visning: "hospital" | "afdeling";
  indikatorNavn: string;
}) {
  const [hovered, setHovered] = useState<{
    point: LevelRow;
    x: number;
    y: number;
  } | null>(null);

  const valid = rows.filter((r) => Number.isFinite(r.vaerdi) && Number.isFinite(r.forbedring));
  const minValue = valid.length ? Math.min(...valid.map((r) => r.vaerdi)) : 0;
  const maxValue = valid.length ? Math.max(...valid.map((r) => r.vaerdi)) : 0;
  const minImp = valid.length ? Math.min(...valid.map((r) => r.forbedring)) : 0;
  const maxImp = valid.length ? Math.max(...valid.map((r) => r.forbedring)) : 0;

  const points = valid.map((r) => ({
    ...r,
    x: scoreForbedring(r.forbedring, minImp, maxImp),
    y: scoreNiveau(r, minValue, maxValue),
  }));

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            Magisk Kvadrant – hvem klarer sig godt og hvem forbedrer sig?
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Øverst = bedre niveau. Mod højre = større forbedring. Hver bobbel er{" "}
            {visning === "hospital" ? "et hospital" : "en afdeling"}.
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white/55 p-4">
        <div className="relative h-[320px] w-full rounded-xl">
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-300" />
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-slate-300" />

          <div className="absolute left-2 top-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] text-emerald-700">
            Stærke frontløbere
          </div>
          <div className="absolute right-2 top-2 rounded-full bg-sky-50 px-3 py-1.5 text-[12px] text-sky-700">
            Forbedrer sig og ligger godt
          </div>
          <div className="absolute left-2 bottom-2 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] text-amber-700">
            Under udvikling
          </div>
          <div className="absolute right-2 bottom-2 rounded-full bg-rose-50 px-3 py-1.5 text-[12px] text-rose-700">
            Kræver opmærksomhed
          </div>

          {points.map((p) => (
            <button
              key={p.id}
              onMouseEnter={() => setHovered({ point: p, x: p.x, y: p.y })}
              onMouseLeave={() => setHovered(null)}
              className="absolute h-4 w-4 rounded-full border border-sky-500/60 bg-sky-400/70 shadow-sm transition-transform hover:scale-125"
              style={{
                left: `${p.x}%`,
                bottom: `${p.y}%`,
                transform: "translate(-50%, 50%)",
              }}
            />
          ))}

          {hovered && (
            <div
              className="pointer-events-none absolute z-20 w-[260px] rounded-2xl border border-slate-200 bg-white/96 px-4 py-3 shadow-2xl backdrop-blur-md"
              style={{
                left: `${hovered.x}%`,
                bottom: hovered.y > 25 ? `${hovered.y - 8}%` : `${hovered.y + 8}%`,
                transform: "translate(-50%, 50%)",
              }}
            >
              <div className="text-sm font-semibold text-slate-900">{hovered.point.navn}</div>
              <div className="text-xs text-slate-500">{hovered.point.region}</div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Niveau</div>
                  <div className="font-medium text-slate-900">
                    {hovered.point.vaerdi.toFixed(1)}
                    {formatUnit(hovered.point.enhed)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Ændring siden 2018</div>
                  <div className="font-medium text-slate-900">
                    {formatImprovement(
                      hovered.point.forbedring,
                      hovered.point.enhed,
                      hovered.point.retning
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">{indikatorNavn}</div>
            </div>
          )}

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-slate-500">
            Forbedring siden 2018 ⟶ bedre
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
            Nuværende niveau ⟶ bedre
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function HomepageClient({
  data,
}: {
  data: HomepageData;
}) {
  const { hospitalLatest, departmentLatest, databases, hospitals, indikators, senesteAar } = data;

  const dagensDatabase = getDagensDatabase(databases);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState(dagensDatabase.database_id);

  const indikatorerForDatabase = useMemo(() => {
    const idsForDatabase = new Set(
      hospitalLatest
        .filter((r) => r.database_id === selectedDatabaseId)
        .map((r) => r.indikator_id)
    );

    return indikators
      .filter((ind) => idsForDatabase.has(ind.indikator_id))
      .sort((a, b) => a.indikator_navn.localeCompare(b.indikator_navn, "da"));
  }, [hospitalLatest, indikators, selectedDatabaseId]);

  const [selectedIndikatorId, setSelectedIndikatorId] = useState(
    indikatorerForDatabase.some((ind) => ind.indikator_id === "mort_30d")
      ? "mort_30d"
      : (indikatorerForDatabase[0]?.indikator_id ?? "")
  );

  const [kvadrantVisning, setKvadrantVisning] = useState<"hospital" | "afdeling">("hospital");

  const selectedDatabase =
    databases.find((d) => d.database_id === selectedDatabaseId) ?? databases[0];

  const selectedIndicator =
    indikators.find((ind) => ind.indikator_id === selectedIndikatorId) ??
    indikatorerForDatabase[0] ??
    null;

  const hospitalView = hospitalLatest.filter(
    (r) => r.database_id === selectedDatabaseId && r.indikator_id === selectedIndikatorId
  );

  const afdelingView = departmentLatest.filter(
    (r) => r.database_id === selectedDatabaseId && r.indikator_id === selectedIndikatorId
  );

  const selectedIndicatorName = selectedIndicator?.indikator_navn ?? selectedIndikatorId;
  const unit = formatUnit(hospitalView[0]?.enhed ?? selectedIndicator?.enhed ?? "");
  const best = [...hospitalView].sort((a, b) => a.rang_hospital - b.rang_hospital)[0];
  const top3 = [...hospitalView].sort((a, b) => a.rang_hospital - b.rang_hospital).slice(0, 3);

  const improved3 = [...hospitalView]
    .sort((a, b) => {
      const aScore =
        a.retning === "lavere_bedre"
          ? -a.forbedring_siden_baseline_hospital
          : a.forbedring_siden_baseline_hospital;
      const bScore =
        b.retning === "lavere_bedre"
          ? -b.forbedring_siden_baseline_hospital
          : b.forbedring_siden_baseline_hospital;
      return bScore - aScore;
    })
    .slice(0, 3);

  const vals = hospitalView.map((r) => r.vaerdi_hospital).filter(Number.isFinite);
  const variation = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;

  const kvadrantRows: LevelRow[] =
    kvadrantVisning === "hospital"
      ? hospitalView.map((r) => ({
          id: r.hospital_id,
          navn: r.hospital_navn,
          region: r.region,
          vaerdi: r.vaerdi_hospital,
          forbedring: r.forbedring_siden_baseline_hospital,
          rang: r.rang_hospital,
          enhed: r.enhed,
          retning: r.retning,
        }))
      : afdelingView.map((r) => ({
          id: r.afdeling_id,
          navn: r.afdeling_navn,
          region: `${r.hospital_navn} · ${r.region}`,
          vaerdi: r.vaerdi,
          forbedring: r.forbedring_siden_baseline,
          rang: r.rang_afdeling,
          enhed: r.enhed,
          retning: r.retning,
        }));

  const hospitalsByRegion = useMemo(() => {
    const map = new Map<string, HospitalDimRow[]>();
    for (const h of hospitals) {
      if (!map.has(h.region)) map.set(h.region, []);
      map.get(h.region)!.push(h);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.hospital_navn.localeCompare(b.hospital_navn, "da"));
    }
    return Array.from(map.entries());
  }, [hospitals]);

  const dbPreview = databases
    .map((db) => {
      const subset = hospitalLatest.filter((r) => r.database_id === db.database_id);
      const indikatorCount = new Set(subset.map((r) => r.indikator_id)).size;
      const drift = subset.find((r) => r.indikator_id === "registreringsfuldkommenhed")?.vaerdi_hospital;
      return {
        ...db,
        indikatorer: indikatorCount,
        opdateret: `År ${senesteAar}`,
        drift: Number.isFinite(drift) ? `${drift!.toFixed(0)}%` : "—",
      };
    })
    .slice(0, 8);

  const handleSelectDatabase = (dbId: string) => {
    setSelectedDatabaseId(dbId);

    const availableIndicatorIds = new Set(
      hospitalLatest
        .filter((r) => r.database_id === dbId)
        .map((r) => r.indikator_id)
    );

    const defaultIndicatorId = availableIndicatorIds.has("mort_30d")
      ? "mort_30d"
      : indikators.find((ind) => availableIndicatorIds.has(ind.indikator_id))?.indikator_id ?? "";

    setSelectedIndikatorId(defaultIndicatorId);
  };

  return (
    <main className="relative min-h-screen bg-slate-50/80 text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.85),transparent_30%),radial-gradient(circle_at_top_right,rgba(224,231,255,0.85),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#f5f8fc_45%,#f4f6fb_100%)]" />

        <div className="absolute right-[-80px] top-[-10px] h-[560px] w-[760px] opacity-[0.22]">
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-right-top"
            style={{ backgroundImage: "url('/bg-analyst.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-50/35 to-slate-50/95" />
          <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black_38%,transparent_85%)] bg-white/30" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <header className="sticky top-0 z-20 flex items-center justify-between py-5 backdrop-blur-md">
          <div className="text-sm font-semibold tracking-tight">SundK Insight</div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-700">
            <MenuDatabases databases={databases} onSelect={handleSelectDatabase} />
            <MenuHospitals hospitalsByRegion={hospitalsByRegion} />
            <MenuDataOgRapporter databases={databases} />
          </nav>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/75 border border-slate-200 px-3 py-2 shadow-sm backdrop-blur">
            <span className="text-slate-400 text-sm">🔎</span>
            <input
              className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Søg"
            />
          </div>
        </header>

        <section className="pt-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[0.95] text-slate-900">
              Kvalitet. Niveau.
              <br />
              Bevægelse.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-700">
              70+ kliniske kvalitetsdatabaser.
              <br />
              Se hvem der ligger bedst – og hvem der forbedrer sig mest.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="rounded-xl bg-white/85 border border-slate-200 px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-white transition-colors">
                Udforsk klinisk database
              </button>
              <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors">
                Start søgning
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-900">
                Nationalt overblik – {selectedDatabase.database_navn}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Viser aktuelt nationalt overblik for den valgte database og indikator.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedDatabaseId}
                onChange={(e) => handleSelectDatabase(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm outline-none"
              >
                {databases
                  .slice()
                  .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
                  .map((db) => (
                    <option key={db.database_id} value={db.database_id}>
                      {db.database_navn}
                    </option>
                  ))}
              </select>

              <select
                value={selectedIndikatorId}
                onChange={(e) => setSelectedIndikatorId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm shadow-sm outline-none"
              >
                {indikatorerForDatabase.map((ind) => (
                  <option key={ind.indikator_id} value={ind.indikator_id}>
                    {ind.indikator_navn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard hover className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <IconTrophy />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">Bedste samlede niveau</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {best ? `#1 ${best.hospital_navn}` : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {selectedIndicatorName} · {selectedDatabase.database_navn}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {top3.map((r) => (
                      <div key={r.hospital_id} className="flex items-center justify-between text-sm text-slate-700">
                        <span>{`#${r.rang_hospital} ${r.hospital_navn}`}</span>
                        <span className="font-medium">
                          {r.vaerdi_hospital.toFixed(1)}
                          {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <IconSpark />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">Mest forbedret siden 2018</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {improved3[0]
                      ? formatImprovement(
                          improved3[0].forbedring_siden_baseline_hospital,
                          improved3[0].enhed,
                          improved3[0].retning
                        )
                      : "—"}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {selectedIndicatorName} · {selectedDatabase.database_navn}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {hospitalView[0] ? improvementExplanation(hospitalView[0].retning) : ""}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {improved3.map((r, idx) => (
                      <div key={r.hospital_id} className="flex items-center justify-between text-sm text-slate-700">
                        <span>{`#${idx + 1} ${r.hospital_navn}`}</span>
                        <span className="font-medium">
                          {formatImprovement(r.forbedring_siden_baseline_hospital, r.enhed, r.retning)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <IconVariation />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">Største variation mellem hospitaler</div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {variation.toFixed(1)}
                    {unit}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{selectedDatabase.database_navn}</div>

                  <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Indikator</span>
                      <span className="font-medium">{selectedIndicatorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>År</span>
                      <span className="font-medium">{senesteAar}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-end">
            <SegmentedToggle value={kvadrantVisning} onChange={setKvadrantVisning} />
          </div>

          <MagiskKvadrant
            rows={kvadrantRows}
            visning={kvadrantVisning}
            indikatorNavn={selectedIndicatorName}
          />
        </section>

        <section className="mt-12">
          <div className="text-2xl font-semibold tracking-tight text-slate-900">Vælg dit perspektiv</div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard hover className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Speciale / Database</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Gå direkte til den kliniske database og se indikatorer, variation og udvikling.
              </div>
              <div className="mt-4 text-xs text-slate-500">Perfekt til klinikere og kvalitetsfolk</div>
            </GlassCard>

            <GlassCard hover className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Hospitaler</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Se dit hospital på tværs: topplaceringer, forbedring, og hvor I halter.
              </div>
              <div className="mt-4 text-xs text-slate-500">Perfekt til ledelse, presse og borgere</div>
            </GlassCard>

            <GlassCard hover className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Dyk ned i data</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Gå helt i dybden med databaser, kvalitetsindikatorer og afdelinger. Du bygger selv dit helt eget overblik og skaber selv indsigten.
              </div>
              <div className="mt-4 text-xs text-slate-500">Perfekt til klinikere og kvalitetsfolk</div>
            </GlassCard>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-900">
                70+ kliniske kvalitetsdatabaser
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Demo-visning på syntetiske data
              </div>
            </div>
          </div>

          <GlassCard className="mt-5 overflow-hidden">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-white/60 px-5 py-3 text-xs font-medium text-slate-700">
              <div className="col-span-5">Database</div>
              <div className="col-span-3">Speciale</div>
              <div className="col-span-2">Indikatorer</div>
              <div className="col-span-1">Opdateret</div>
              <div className="col-span-1 text-right">Registreringskomplethed</div>
            </div>

            <div className="divide-y divide-slate-200">
              {dbPreview.map((r) => (
                <div
                  key={r.database_id}
                  className="grid grid-cols-12 px-5 py-4 text-sm bg-white/40 hover:bg-white/70 transition-colors"
                >
                  <div className="col-span-5 font-medium text-slate-900">{r.database_navn}</div>
                  <div className="col-span-3 text-slate-700">{r.speciale}</div>
                  <div className="col-span-2 text-slate-700">{r.indikatorer}</div>
                  <div className="col-span-1 text-slate-700">{r.opdateret}</div>
                  <div className="col-span-1 text-right font-medium text-slate-900">{r.drift}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
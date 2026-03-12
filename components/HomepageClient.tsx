"use client";

import TopNav from "@/components/navigation/TopNav";
import PageBackground from "@/components/layout/PageBackground";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  DatabaseDimRow,
  HomepageData,
  HospitalDimRow,
} from "@/lib/data/loadHomepageData";

type LevelRow = {
  id: string;
  navn: string;
  region: string;
  vaerdi: number;
  forbedring: number;
  rang: number;
  enhed: string;
  retning: "lavere_bedre" | "hoejere_bedre";
  typeLabel: "Hospital" | "Afdeling";
  antalForloeb?: number;
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

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </div>
      ) : null}
      <div className="mt-2 text-[30px] font-semibold tracking-tight text-slate-950">
        {title}
      </div>
      {text ? <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text}</div> : null}
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

function GlassCard({
  className,
  children,
  hover = false,
  accent = "slate",
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
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
        "relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/76 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] before:absolute before:left-0 before:right-0 before:top-0 before:h-[3px]",
        accentBar[accent],
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] hover:bg-white/90",
        className
      )}
    >
      {children}
    </div>
  );
}

function MenuDatabases({
  databases,
}: {
  databases: DatabaseDimRow[];
}) {
  return (
    <div className="relative group">
      <button className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950">
        Databaser
      </button>
      <div className="invisible absolute left-0 top-full z-30 mt-2 w-80 rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 overflow-auto">
          {databases
            .slice()
            .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
            .map((db) => (
              <Link
                key={db.database_id}
                href={`/database/${db.database_id}`}
                className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                {db.database_navn}
              </Link>
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
      <button className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950">
        Hospitaler
      </button>
      <div className="invisible absolute left-0 top-full z-30 mt-2 w-[340px] rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 overflow-auto space-y-3">
          {hospitalsByRegion.map(([region, regionHospitals]) => (
            <div key={region}>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {region}
              </div>
{regionHospitals.map((h) => (
  <Link
    key={h.hospital_id}
    href={`/hospital/${h.hospital_id}`}
    className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
  >
    {h.hospital_navn}
  </Link>
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
      <button className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950">
        Data og rapporter
      </button>

      <div className="invisible absolute left-0 top-full z-30 mt-2 w-72 rounded-3xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <button className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100">
          Dyk ned i data
        </button>

        <div className="relative group/reports">
          <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100">
            <span>Årsrapporter</span>
            <span className="text-slate-400">›</span>
          </button>

          <div className="invisible absolute left-full top-0 z-40 ml-2 w-80 rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover/reports:visible group-hover/reports:opacity-100">
            <div className="max-h-80 overflow-auto">
              {databases
                .slice()
                .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
                .map((db) => (
                  <button
                    key={db.database_id}
                    className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
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
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white/85 p-1 text-sm shadow-sm backdrop-blur">
      <button
        onClick={() => onChange("hospital")}
        className={cn(
          "rounded-xl px-3.5 py-2 transition-colors",
          value === "hospital"
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-700 hover:text-slate-950"
        )}
      >
        Hospitaler
      </button>
      <button
        onClick={() => onChange("afdeling")}
        className={cn(
          "rounded-xl px-3.5 py-2 transition-colors",
          value === "afdeling"
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-700 hover:text-slate-950"
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

  const valid = rows.filter(
    (r) => Number.isFinite(r.vaerdi) && Number.isFinite(r.forbedring)
  );

  const minValue = valid.length ? Math.min(...valid.map((r) => r.vaerdi)) : 0;
  const maxValue = valid.length ? Math.max(...valid.map((r) => r.vaerdi)) : 0;
  const minImp = valid.length ? Math.min(...valid.map((r) => r.forbedring)) : 0;
  const maxImp = valid.length ? Math.max(...valid.map((r) => r.forbedring)) : 0;

  const maxAntalForloeb = Math.max(
    ...valid.map((r) => r.antalForloeb || 0),
    1
  );

  function getBubbleSize(antalForloeb?: number) {
    const minSize = 14;
    const maxSize = 34;

    if (!antalForloeb || antalForloeb <= 0) return 16;

    return (
      minSize +
      (Math.sqrt(antalForloeb) / Math.sqrt(maxAntalForloeb)) *
        (maxSize - minSize)
    );
  }

  const points = valid.map((r) => ({
    ...r,
    x: scoreForbedring(r.forbedring, minImp, maxImp),
    y: scoreNiveau(r, minValue, maxValue),
  }));

  return (
    <div className="relative h-[440px] rounded-[24px] border border-slate-200 bg-white/60 p-4">
      <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-300" />
      <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-slate-300" />

      <div className="absolute left-6 top-6 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700">
        Stærke frontløbere
      </div>
      <div className="absolute right-6 top-6 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[12px] font-medium text-sky-700">
        Forbedrer sig og ligger godt
      </div>
      <div className="absolute bottom-6 left-6 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700">
        Under udvikling
      </div>
      <div className="absolute bottom-6 right-6 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700">
        Kræver opmærksomhed
      </div>

      {points.map((p) => {
        const size = visning === "hospital" ? getBubbleSize(p.antalForloeb) : 16;

        return (
          <button
            key={p.id}
            onMouseEnter={() => setHovered({ point: p, x: p.x, y: p.y })}
            onMouseLeave={() => setHovered(null)}
            className="absolute rounded-full border border-sky-500/60 bg-sky-400/80 shadow-sm transition-transform hover:scale-110"
            style={{
              left: `${p.x}%`,
              bottom: `${p.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: "translate(-50%, 50%)",
            }}
            aria-label={p.navn}
          />
        );
      })}

      {hovered && (
        <div
          className="pointer-events-none absolute z-20 w-[300px] rounded-[24px] border border-slate-200 bg-white/96 px-4 py-3 shadow-2xl backdrop-blur-xl"
          style={{
            left: `${hovered.x}%`,
            bottom: hovered.y > 25 ? `${hovered.y - 8}%` : `${hovered.y + 8}%`,
            transform: "translate(-50%, 50%)",
          }}
        >
          <div className="text-sm font-semibold text-slate-950">
            {hovered.point.navn}
          </div>
          <div className="text-xs text-slate-500">
            {hovered.point.region} · {hovered.point.typeLabel}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Niveau</div>
              <div className="font-medium text-slate-900">
                {hovered.point.vaerdi.toFixed(1)}
                {formatUnit(hovered.point.enhed)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Ændring</div>
              <div className="font-medium text-slate-900">
                {formatImprovement(
                  hovered.point.forbedring,
                  hovered.point.enhed,
                  hovered.point.retning
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Forløb</div>
              <div className="font-medium text-slate-900">
                {hovered.point.antalForloeb?.toLocaleString("da-DK") ?? "—"}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            {indikatorNavn}
          </div>
        </div>
      )}

      {visning === "hospital" && (
        <div className="absolute right-4 bottom-2 text-xs text-slate-400">
          Boblestørrelse = antal forløb
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">
        Forbedring siden baseline
      </div>

      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
        Nuværende niveau
      </div>
    </div>
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
        typeLabel: "Hospital",
        antalForloeb: r.antal_forloeb_hospital,
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
          typeLabel: "Afdeling",
          antalForloeb: r.antal_forloeb,
        }));

  const activeRows = kvadrantRows;
  const activeTypeLabel = kvadrantVisning === "hospital" ? "hospitaler" : "afdelinger";

  const unit = formatUnit(activeRows[0]?.enhed ?? selectedIndicator?.enhed ?? "");

  const best = [...activeRows].sort((a, b) => a.rang - b.rang)[0];
  const top3 = [...activeRows].sort((a, b) => a.rang - b.rang).slice(0, 3);

  const improved3 = [...activeRows]
    .sort((a, b) => {
      const aScore = a.retning === "lavere_bedre" ? -a.forbedring : a.forbedring;
      const bScore = b.retning === "lavere_bedre" ? -b.forbedring : b.forbedring;
      return bScore - aScore;
    })
    .slice(0, 3);

  const vals = activeRows.map((r) => r.vaerdi).filter(Number.isFinite);
  const variation = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;

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
  <PageBackground>
    <div className="mx-auto max-w-6xl px-5 pb-24">
      
      <TopNav
        databases={databases}
        hospitals={hospitals}
        active="home"
      />

        <section className="pt-8">
          <div className="max-w-4xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              National kvalitetsindsigt
            </div>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-tight text-slate-950 sm:text-6xl">
              Vi har data. Du får indsigt og skaber forandring
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              70+ kliniske kvalitetsdatabaser. Se hvem der ligger bedst, hvem der flytter
              sig mest, og hvor variationen fortsat er størst.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white/88 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-white">
                Udforsk klinisk database
              </button>
              <button className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
                Start søgning
              </button>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionIntro
              eyebrow="Overblik"
              title={`Nationalt overblik – ${selectedDatabase.database_navn}`}
              text="Viser aktuelt nationalt overblik for den valgte database og indikator."
            />

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedDatabaseId}
                onChange={(e) => handleSelectDatabase(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white/85 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
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
                className="rounded-2xl border border-slate-200 bg-white/85 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
              >
                {indikatorerForDatabase.map((ind) => (
                  <option key={ind.indikator_id} value={ind.indikator_id}>
                    {ind.indikator_navn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard hover accent="amber" className="p-6">
              <div className="flex items-start justify-between gap-4">
                <CardEyebrow tone="amber">Benchmark</CardEyebrow>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <IconTrophy />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium text-slate-600">
                  Bedste samlede niveau blandt {activeTypeLabel}
                </div>
                <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                  {best ? `#1 ${best.navn}` : "—"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {selectedIndicatorName} · {selectedDatabase.database_navn}
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4">
                {top3.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{`#${r.rang} ${r.navn}`}</span>
                    <span className="font-semibold text-slate-900">
                      {r.vaerdi.toFixed(1)}
                      {unit}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover accent="sky" className="p-6">
              <div className="flex items-start justify-between gap-4">
                <CardEyebrow tone="sky">Bevægelse</CardEyebrow>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <IconSpark />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium text-slate-600">Mest forbedret siden 2018</div>
                <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                  {improved3[0]
                    ? formatImprovement(improved3[0].forbedring, improved3[0].enhed, improved3[0].retning)
                    : "—"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {selectedIndicatorName} · {selectedDatabase.database_navn}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {activeRows[0] ? improvementExplanation(activeRows[0].retning) : ""}
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4">
                {improved3.map((r, idx) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{`#${idx + 1} ${r.navn}`}</span>
                    <span className="font-semibold text-slate-900">
                      {formatImprovement(r.forbedring, r.enhed, r.retning)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover accent="rose" className="p-6">
              <div className="flex items-start justify-between gap-4">
                <CardEyebrow tone="rose">Variation</CardEyebrow>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                  <IconVariation />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium text-slate-600">
                  Største variation mellem {activeTypeLabel}
                </div>
                <div className="mt-3 text-[2.2rem] font-semibold leading-none tracking-tight text-slate-950">
                  {variation.toFixed(1)}
                  {unit}
                </div>
                <div className="mt-2 text-sm text-slate-500">{selectedDatabase.database_navn}</div>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Indikator</span>
                  <span className="font-semibold text-slate-900">{selectedIndicatorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">År</span>
                  <span className="font-semibold text-slate-900">{senesteAar}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SectionIntro
              eyebrow="Analyse"
              title="Performance på tværs"
              text="Sammenlign niveau og udvikling for hospitaler og afdelinger i den valgte indikator."
            />
            <div className="shrink-0">
              <SegmentedToggle value={kvadrantVisning} onChange={setKvadrantVisning} />
            </div>
          </div>

          <MagiskKvadrant
            rows={kvadrantRows}
            visning={kvadrantVisning}
            indikatorNavn={selectedIndicatorName}
          />
        </section>

        <section className="mt-14">
          <SectionIntro
            eyebrow="Indgange"
            title="Vælg dit perspektiv"
            text="Udforsk data fra forskellige indgange alt efter rolle, behov og spørgsmål."
          />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard hover accent="slate" className="p-6">
              <CardEyebrow tone="slate">Indgang</CardEyebrow>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-950">Speciale / Database</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-600">
                Gå direkte til den kliniske database og se indikatorer, variation og udvikling.
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                Perfekt til klinikere og kvalitetsfolk
              </div>
            </GlassCard>

            <GlassCard hover accent="slate" className="p-6">
              <CardEyebrow tone="slate">Indgang</CardEyebrow>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-950">Hospitaler</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-600">
                Se dit hospital på tværs: topplaceringer, forbedring, og hvor I halter.
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                Perfekt til ledelse, presse og borgere
              </div>
            </GlassCard>

            <GlassCard hover accent="slate" className="p-6">
              <CardEyebrow tone="slate">Indgang</CardEyebrow>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-950">Dyk ned i data</div>
                <div className="text-slate-400">›</div>
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-600">
                Gå helt i dybden med databaser, kvalitetsindikatorer og afdelinger. Byg dit
                eget overblik og skab selv indsigten.
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                Perfekt til klinikere og kvalitetsfolk
              </div>
            </GlassCard>
          </div>
        </section>

<section className="mt-16">
  <SectionIntro
    eyebrow="Inspiration"
    title="Inspiration fra klinikken"
    text="Se hvordan kliniske afdelinger arbejder med kvalitetsforbedringer i praksis — og hvordan data fra kvalitetsdatabaser bruges til at identificere variation, følge udvikling og skabe handling."
  />

  <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">

    {/* FEATURED CASE */}
    <GlassCard hover accent="emerald" className="lg:col-span-2 overflow-hidden">

      <div className="relative h-64 w-full">
        <img
          src="/cases/komplikationer.png"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="p-6">
        <CardEyebrow tone="emerald">Case</CardEyebrow>

        <div className="mt-3 text-xl font-semibold text-slate-950">
          Hurtigere opfølgning på komplikationer
        </div>

        <div className="mt-3 text-base italic text-slate-700">
          “Vi begyndte at bruge data mere aktivt på vores tavlemøder — og det
          ændrede faktisk, hvad vi talte om.”
        </div>

        <div className="mt-3 text-sm leading-6 text-slate-600">
          En kirurgisk afdeling bruger kvalitetsdata til at følge komplikationer
          tættere og identificere mønstre tidligere i forløbet. Casen viser,
          hvordan enkle visninger kan understøtte lokale forbedringstiltag og
          skabe fælles refleksion i teamet.
        </div>

        <div className="mt-4 text-sm font-medium text-slate-900">
          Læs casen →
        </div>
      </div>
    </GlassCard>


    {/* CASE 2 */}
    <GlassCard hover accent="sky" className="overflow-hidden">

      <div className="relative h-40 w-full">
        <img
          src="/cases/genindlaeggelser.png"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <CardEyebrow tone="sky">Case</CardEyebrow>

        <div className="mt-3 text-lg font-semibold text-slate-950">
          Bedre overblik over genindlæggelser
        </div>

        <div className="mt-2 text-sm italic text-slate-700">
          “Det blev nemmere at se, hvor vi skulle sætte ind.”
        </div>

        <div className="mt-3 text-sm leading-6 text-slate-600">
          En medicinsk afdeling kombinerer data om genindlæggelser og
          patientforløb for at skabe fælles overblik mellem klinikere og
          ledelse.
        </div>

        <div className="mt-3 text-sm font-medium text-slate-900">
          Læs casen →
        </div>
      </div>
    </GlassCard>


    {/* CASE 3 */}
    <GlassCard hover accent="amber" className="overflow-hidden">

      <div className="relative h-40 w-full">
        <img
          src="/cases/kvalitetsdata.png"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <CardEyebrow tone="amber">Case</CardEyebrow>

        <div className="mt-3 text-lg font-semibold text-slate-950">
          Kvalitetsdata tættere på hverdagen
        </div>

        <div className="mt-2 text-sm italic text-slate-700">
          “Når data er lette at forstå, bliver de også lettere at handle på.”
        </div>

        <div className="mt-3 text-sm leading-6 text-slate-600">
          En klinisk enhed arbejder med at gøre kvalitetsdata mere
          tilgængelige for medarbejderne i hverdagen.
        </div>

        <div className="mt-3 text-sm font-medium text-slate-900">
          Læs casen →
        </div>
      </div>
    </GlassCard>

  </div>
</section>

        <section className="mt-14">
          <SectionIntro
            eyebrow="Katalog"
            title="70+ kliniske kvalitetsdatabaser"
            text="Demo-visning på syntetiske data."
          />

          <GlassCard accent="slate" className="mt-6 overflow-hidden">
            <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-white/65 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              <div className="col-span-5">Database</div>
              <div className="col-span-3">Speciale</div>
              <div className="col-span-2">Indikatorer</div>
              <div className="col-span-1">Opdateret</div>
              <div className="col-span-1 text-right">Registreringskomplethed</div>
            </div>

<div className="divide-y divide-slate-200/90">
  {dbPreview.map((r) => (
    <Link
      key={r.database_id}
      href={`/database/${r.database_id}`}
      className="grid grid-cols-12 bg-white/40 px-5 py-4 text-sm transition-colors hover:bg-white/70"
    >
      <div className="col-span-5 font-medium text-slate-950">{r.database_navn}</div>
      <div className="col-span-3 text-slate-700">{r.speciale}</div>
      <div className="col-span-2 text-slate-700">{r.indikatorer}</div>
      <div className="col-span-1 text-slate-700">{r.opdateret}</div>
      <div className="col-span-1 text-right font-semibold text-slate-950">{r.drift}</div>
    </Link>
  ))}
</div>
          </GlassCard>
        </section>
      </div>
    </PageBackground>
  );
}
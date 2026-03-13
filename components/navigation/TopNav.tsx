"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DatabaseDimRow = {
  database_id: string;
  database_navn: string;
  speciale: string;
};

type HospitalDimRow = {
  hospital_id: string;
  region: string;
  hospital_navn: string;
};

type ReportLink = {
  title: string;
  href: string;
};

type SearchItem = {
  id: string;
  label: string;
  href: string;
  type: "database" | "hospital" | "rapport" | "side";
  external?: boolean;
  meta?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const AARSRAPPORTER: ReportLink[] = [
  {
    title: "Akutdatabasen",
    href: "https://www.sundk.dk/media/u3qc2scp/dah_aarsrapport-2024.pdf",
  },
  {
    title: "Dansk Apopleksidatabase",
    href: "https://www.sundk.dk/media/c2vlyly0/danstroke_aarsrapport-2024_til-offentliggoerelse_300625.pdf",
  },
  {
    title: "Dansk Brystkræftdatabase",
    href: "https://www.sundk.dk/media/l2rp4h4c/dbcg-a-rsrapport-2024_offentliggjort-version-20250627.pdf",
  },
  {
    title: "Dansk Diabetesdatabase",
    href: "https://www.sundk.dk/media/qytheabl/dansk-diabetes-database-aarsrapport-2024-offentliggjort-version-20250627.pdf",
  },
  {
    title: "Dansk Hjerteinfarktdatabase",
    href: "https://www.sundk.dk/media/znxf22yo/dhreg_aarsrapport-2024_20250627_offentliggjort-version.pdf",
  },
  {
    title: "Dansk Hoftefrakturdatabase",
    href: "https://www.sundk.dk/media/fz0bgm2m/dhr_aarsrapport_2024_udgivet_2025_offentliggjort-version.pdf",
  },
  {
    title: "Dansk Knæalloplastikdatabase",
    href: "https://data-sundk.dk/aarsrapporter/dkr/2024/",
  },
  {
    title: "Dansk Kolorektalcancer Database",
    href: "https://data-sundk.dk/aarsrapporter/dccg/2024/",
  },
  {
    title: "Dansk Lungecancer Database",
    href: "https://www.sundk.dk/media/cadgkmwq/dlcr-aarsrapport-2024-offentliggjort-version-07-08-2025.pdf",
  },
  {
    title: "Dansk Psykiatridatabase",
    href: "https://www.sundk.dk/media/jp2lkqhl/aarsrapport_skizo_2024-25_offentlig_v3.pdf",
  },
  {
    title: "Intensivdatabasen",
    href: "https://www.sundk.dk/media/fiddbcak/did_aarsrapport_2024_endelig-version.pdf",
  },
].sort((a, b) => a.title.localeCompare(b.title, "da"));

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

      <div className="invisible absolute left-0 top-full z-[70] mt-2 w-80 rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 overflow-auto">
          {databases
            .slice()
            .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"))
            .map((db) => (
              <Link
                key={db.database_id}
                href={`/database/${db.database_id}`}
                className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
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

      <div className="invisible absolute left-0 top-full z-[70] mt-2 w-[340px] rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-80 space-y-3 overflow-auto">
          {hospitalsByRegion.map(([region, regionHospitals]) => (
            <div key={region}>
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {region}
              </div>

              {regionHospitals.map((h) => (
                <Link
                  key={h.hospital_id}
                  href={`/hospital/${h.hospital_id}`}
                  className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
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

function MenuDataOgRapporter() {
  return (
    <div className="relative group">
      <button className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950">
        Data og rapporter
      </button>

      <div className="invisible absolute left-0 top-full z-[70] mt-2 w-72 rounded-3xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <Link
          href="/analyse"
          className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          Dyk ned i data
        </Link>

        <div className="relative group/reports">
          <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100">
            <span>Årsrapporter</span>
            <span className="text-slate-400">›</span>
          </button>

          <div className="invisible absolute left-full top-0 z-[80] ml-2 w-[360px] rounded-3xl border border-slate-200 bg-white/95 p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover/reports:visible group-hover/reports:opacity-100">
            <div className="max-h-80 overflow-auto">
              {AARSRAPPORTER.map((report) => (
                <a
                  key={report.title}
                  href={report.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <span className="pr-3">{report.title}</span>
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    PDF
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopNav({
  databases,
  hospitals,
  active,
}: {
  databases: DatabaseDimRow[];
  hospitals: HospitalDimRow[];
  active?: "home" | "database" | "hospital" | "reports" | "analyse";
}) {
  const hospitalsByRegion = Object.entries(
    hospitals.reduce<Record<string, HospitalDimRow[]>>((acc, h) => {
      if (!acc[h.region]) acc[h.region] = [];
      acc[h.region].push(h);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b, "da"))
    .map(
      ([region, regionHospitals]) =>
        [
          region,
          regionHospitals
            .slice()
            .sort((a, b) => a.hospital_navn.localeCompare(b.hospital_navn, "da")),
        ] as [string, HospitalDimRow[]]
    );

const [query, setQuery] = useState("");

const searchItems = useMemo<SearchItem[]>(() => {
  const databaseItems: SearchItem[] = databases.map((db) => ({
    id: `db-${db.database_id}`,
    label: db.database_navn,
    href: `/database/${db.database_id}`,
    type: "database",
    meta: db.speciale,
  }));

  const hospitalItems: SearchItem[] = hospitals.map((h) => ({
    id: `hospital-${h.hospital_id}`,
    label: h.hospital_navn,
    href: `/hospital/${h.hospital_id}`,
    type: "hospital",
    meta: h.region,
  }));

  const reportItems: SearchItem[] = AARSRAPPORTER.map((r) => ({
    id: `rapport-${r.title}`,
    label: r.title,
    href: r.href,
    type: "rapport",
    external: true,
    meta: "Årsrapport",
  }));

  const pageItems: SearchItem[] = [
    {
      id: "side-analyse",
      label: "Dyk ned i data",
      href: "/analyse",
      type: "side",
      meta: "Analysebygger",
    },
    {
      id: "side-inspiration",
      label: "Inspiration fra klinikken",
      href: "/inspiration",
      type: "side",
      meta: "Cases",
    },
  ];

  return [...pageItems, ...databaseItems, ...hospitalItems, ...reportItems];
}, [databases, hospitals]);

const normalizedQuery = query.trim().toLowerCase();

const filteredResults = useMemo(() => {
  if (!normalizedQuery) return [];

  return searchItems
    .filter((item) => {
      const haystack = `${item.label} ${item.meta ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .slice(0, 8);
}, [normalizedQuery, searchItems]);

  return (
    <div className="sticky top-4 z-[60] mx-auto max-w-[1440px] px-4 pt-4 md:px-6">
      <header className="rounded-[28px] border border-slate-200/80 bg-white/76 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm">
              SK
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tight text-slate-950">
                  SundK Insight
                </span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                  Beta
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Offentlig kvalitetsindsigt · demo
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <div
              className={cn(
                "rounded-full transition-colors",
                active === "database" && "bg-slate-100"
              )}
            >
              <MenuDatabases databases={databases} />
            </div>

            <div
              className={cn(
                "rounded-full transition-colors",
                active === "hospital" && "bg-slate-100"
              )}
            >
              <MenuHospitals hospitalsByRegion={hospitalsByRegion} />
            </div>

            <div
              className={cn(
                "rounded-full transition-colors",
                active === "reports" && "bg-slate-100"
              )}
            >
              <MenuDataOgRapporter />
            </div>
          </nav>

<div className="relative min-w-[240px]">
  <div className="flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-sm">
    <span className="mr-2 text-slate-400">🔎</span>
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Søg"
      className="w-full bg-transparent outline-none placeholder:text-slate-400"
    />
  </div>

  {normalizedQuery && (
    <div className="absolute right-0 top-full z-[90] mt-2 w-[380px] overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
      {filteredResults.length > 0 ? (
        <div className="max-h-96 overflow-auto">
          {filteredResults.map((item) =>
            item.external ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-slate-100"
                onClick={() => setQuery("")}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.label}</div>
                  {item.meta ? (
                    <div className="text-xs text-slate-500">{item.meta}</div>
                  ) : null}
                </div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                  {item.type}
                </div>
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-slate-100"
                onClick={() => setQuery("")}
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.label}</div>
                  {item.meta ? (
                    <div className="text-xs text-slate-500">{item.meta}</div>
                  ) : null}
                </div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                  {item.type}
                </div>
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="px-3 py-4 text-sm text-slate-500">Ingen resultater</div>
      )}
    </div>
  )}
</div>
        </div>
      </header>
    </div>
  );
}
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

type Retning = "lavere_bedre" | "hoejere_bedre";

type DatabaseDimRow = {
  database_id: string;
  database_navn: string;
  speciale: string;
};

type IndicatorDimRow = {
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  retning: Retning;
  enhed: string;
};

type HospitalDimRow = {
  hospital_id: string;
  region: string;
  hospital_navn: string;
};

type AfdelingDimRow = {
  afdeling_id: string;
  afdeling_navn: string;
  hospital_id: string;
};

type DatabaseIndicatorOption = {
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  enhed: string;
  retning: Retning;
};

type TrendPoint = {
  aar: number;
  vaerdi: number;
};

type BenchmarkRow = {
  id: string;
  navn: string;
  region: string;
  vaerdi: number;
  rang: number;
};

type MovementRow = {
  id: string;
  navn: string;
  region: string;
  forbedring: number;
  rang: number;
};

type QuadrantRow = {
  id: string;
  navn: string;
  region: string;
  vaerdi: number;
  forbedring: number;
  rang: number;
  enhed: string;
  retning: Retning;
};

type HospitalPerformanceRow = {
  hospital_id: string;
  hospital_navn: string;
  region: string;
  vaerdi: number;
  forbedring: number;
  antal_forloeb: number;
  rang: number;
  enhed: string;
  retning: Retning;
};

type VariationDepartmentRow = {
  afdeling_id: string;
  afdeling_navn: string;
  hospital_navn: string;
  region: string;
  vaerdi: number;
  ci_nedre: number;
  ci_oevre: number;
};

export type DatabasePageData = {
  database: {
    database_id: string;
    database_navn: string;
    speciale: string;
  };
  indikatorer: DatabaseIndicatorOption[];
  selectedIndikator: DatabaseIndicatorOption;
  selectedYear: number;
  availableYears: number[];

  benchmarkTop3: BenchmarkRow[];
  benchmarkWinner: BenchmarkRow | null;

  movementTop3: MovementRow[];
  movementWinner: MovementRow | null;

  variationValue: number;
  variationMin: number;
  variationMax: number;

  trendNational: TrendPoint[];
  quadrantRows: QuadrantRow[];
  hospitalPerformanceRows: HospitalPerformanceRow[];
  variationDepartments: VariationDepartmentRow[];

  indikatorCards: DatabaseIndicatorOption[];
};

function parseNumber(v: unknown): number {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (!s) return NaN;
  return Number(s);
}

function parseBool(v: unknown): boolean {
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function parseRetning(v: unknown): Retning {
  return String(v).trim() === "lavere_bedre" ? "lavere_bedre" : "hoejere_bedre";
}

function readCsv<T extends Record<string, string>>(fileName: string): T[] {
  const filePath = path.join(process.cwd(), "data", fileName);
  const csv = fs.readFileSync(filePath, "utf-8");

  const parsed = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    throw new Error(`${fileName}: ${parsed.errors[0].message}`);
  }

  return parsed.data ?? [];
}

function getText(
  row: Record<string, string>,
  candidates: string[],
  fallback = ""
): string {
  for (const key of candidates) {
    const value = row[key];
    if (value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return fallback;
}

function getNumber(
  row: Record<string, string>,
  candidates: string[],
  fallback = NaN
): number {
  for (const key of candidates) {
    const value = row[key];
    const parsed = parseNumber(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function loadDatabaseData(
  databaseId: string,
  indikatorId?: string,
  year?: number
): DatabasePageData {
  const databaseCsv = readCsv<Record<string, string>>("dim_database.csv");
  const indikatorCsv = readCsv<Record<string, string>>("dim_indikator.csv");
  const hospitalCsv = readCsv<Record<string, string>>("dim_hospital.csv");
  const afdelingCsv = readCsv<Record<string, string>>("dim_afdeling.csv");
  const hospitalAggregatCsv = readCsv<Record<string, string>>("fakt_hospital_aggregat.csv");
  const maalepunktCsv = readCsv<Record<string, string>>("fakt_maalepunkt.csv");

  const databases: DatabaseDimRow[] = databaseCsv.map((r) => ({
    database_id: r.database_id,
    database_navn: r.database_navn,
    speciale: r.speciale,
  }));

  const indikators: IndicatorDimRow[] = indikatorCsv.map((r) => ({
    indikator_id: r.indikator_id,
    indikator_navn: r.indikator_navn,
    indikator_type: r.indikator_type,
    retning: parseRetning(r.retning),
    enhed: r.enhed,
  }));

  const hospitals: HospitalDimRow[] = hospitalCsv.map((r) => ({
    hospital_id: r.hospital_id,
    region: r.region,
    hospital_navn: r.hospital_navn,
  }));

  const afdelinger: AfdelingDimRow[] = afdelingCsv.map((r) => ({
    afdeling_id: r.afdeling_id,
    afdeling_navn: r.afdeling_navn,
    hospital_id: r.hospital_id,
  }));

  const database = databases.find((d) => d.database_id === databaseId);
  if (!database) {
    throw new Error(`Ukendt database_id: ${databaseId}`);
  }

  const hospitalMap = new Map(hospitals.map((h) => [h.hospital_id, h]));
  const afdelingMap = new Map(afdelinger.map((a) => [a.afdeling_id, a]));

  const aggregatRows = hospitalAggregatCsv
    .filter((r) => r.database_id === databaseId)
    .map((r) => ({
      database_id: r.database_id,
      indikator_id: r.indikator_id,
      hospital_id: getText(r, ["hospital_id"]),
      aar: getNumber(r, ["aar"]),
      vaerdi: getNumber(r, ["vaerdi", "vaerdi_hospital"]),
      enhed: getText(r, ["enhed"]),
      retning: parseRetning(getText(r, ["retning"])),
      metodebrud_flag: parseBool(getText(r, ["metodebrud_flag"], "false")),
      antal_forloeb: getNumber(r, ["antal_forloeb", "antal_forloeb_hospital"]),
      ci_nedre: getNumber(r, ["ci_nedre", "ci_nedre_hospital"]),
      ci_oevre: getNumber(r, ["ci_oevre", "ci_oevre_hospital"]),
      vaerdi_baseline: getNumber(r, ["vaerdi_baseline", "vaerdi_baseline_hospital"]),
      forbedring_siden_baseline: getNumber(r, [
        "forbedring_siden_baseline",
        "forbedring_siden_baseline_hospital",
      ]),
      rang_hospital: getNumber(r, ["rang_hospital"]),
    }));

  const departmentRowsRaw = maalepunktCsv
    .filter((r) => r.database_id === databaseId)
    .map((r) => ({
      database_id: r.database_id,
      indikator_id: r.indikator_id,
      hospital_id: getText(r, ["hospital_id"]),
      afdeling_id: getText(r, ["afdeling_id"]),
      aar: getNumber(r, ["aar"]),
      vaerdi: getNumber(r, ["vaerdi"]),
      enhed: getText(r, ["enhed"]),
      retning: parseRetning(getText(r, ["retning"])),
      metodebrud_flag: parseBool(getText(r, ["metodebrud_flag"], "false")),
      antal_forloeb: getNumber(r, ["antal_forloeb"]),
      ci_nedre: getNumber(r, ["ci_nedre"]),
      ci_oevre: getNumber(r, ["ci_oevre"]),
      vaerdi_baseline: getNumber(r, ["vaerdi_baseline"]),
      forbedring_siden_baseline: getNumber(r, ["forbedring_siden_baseline"]),
      rang_afdeling: getNumber(r, ["rang_afdeling"]),
    }));

  const indikatorIds = new Set(aggregatRows.map((r) => r.indikator_id));
  const indikatorer: DatabaseIndicatorOption[] = indikators
    .filter((i) => indikatorIds.has(i.indikator_id))
    .sort((a, b) => a.indikator_navn.localeCompare(b.indikator_navn, "da"))
    .map((i) => ({
      indikator_id: i.indikator_id,
      indikator_navn: i.indikator_navn,
      indikator_type: i.indikator_type,
      enhed: i.enhed,
      retning: i.retning,
    }));

  if (!indikatorer.length) {
    throw new Error(`Ingen indikatorer fundet for database_id: ${databaseId}`);
  }

  const selectedIndikator =
    indikatorer.find((i) => i.indikator_id === indikatorId) ??
    indikatorer.find((i) => i.indikator_id === "mort_30d") ??
    indikatorer[0];

  const rowsForIndicator = aggregatRows.filter(
    (r) => r.indikator_id === selectedIndikator.indikator_id
  );

  const availableYears = Array.from(
    new Set(rowsForIndicator.map((r) => r.aar).filter(Number.isFinite))
  ).sort((a, b) => a - b);

  const selectedYear =
    (year && availableYears.includes(year) ? year : undefined) ??
    availableYears[availableYears.length - 1];

  const latestRows = rowsForIndicator
    .filter((r) => r.aar === selectedYear)
    .map((r) => {
      const hospital = hospitalMap.get(r.hospital_id);
      return {
        ...r,
        hospital_navn: hospital?.hospital_navn ?? r.hospital_id,
        region: hospital?.region ?? "",
      };
    })
    .filter((r) => Number.isFinite(r.vaerdi));

  const benchmarkTop3: BenchmarkRow[] = [...latestRows]
    .sort((a, b) => a.rang_hospital - b.rang_hospital)
    .slice(0, 3)
    .map((r) => ({
      id: r.hospital_id,
      navn: r.hospital_navn,
      region: r.region,
      vaerdi: r.vaerdi,
      rang: r.rang_hospital,
    }));

  const benchmarkWinner = benchmarkTop3[0] ?? null;

  const movementTop3: MovementRow[] = [...latestRows]
    .sort((a, b) => {
      const aScore =
        a.retning === "lavere_bedre"
          ? -a.forbedring_siden_baseline
          : a.forbedring_siden_baseline;
      const bScore =
        b.retning === "lavere_bedre"
          ? -b.forbedring_siden_baseline
          : b.forbedring_siden_baseline;
      return bScore - aScore;
    })
    .slice(0, 3)
    .map((r, index) => ({
      id: r.hospital_id,
      navn: r.hospital_navn,
      region: r.region,
      forbedring: r.forbedring_siden_baseline,
      rang: index + 1,
    }));

  const movementWinner = movementTop3[0] ?? null;

  const valueSeries = latestRows.map((r) => r.vaerdi).filter(Number.isFinite);
  const variationMin = valueSeries.length ? Math.min(...valueSeries) : 0;
  const variationMax = valueSeries.length ? Math.max(...valueSeries) : 0;
  const variationValue = variationMax - variationMin;

  const trendNational: TrendPoint[] = availableYears.map((aar) => {
    const yearRows = rowsForIndicator.filter((r) => r.aar === aar && Number.isFinite(r.vaerdi));
    const avg =
      yearRows.reduce((sum, r) => sum + r.vaerdi, 0) / (yearRows.length || 1);

    return {
      aar,
      vaerdi: avg,
    };
  });

  const quadrantRows: QuadrantRow[] = [...latestRows]
    .sort((a, b) => a.rang_hospital - b.rang_hospital)
    .map((r) => ({
      id: r.hospital_id,
      navn: r.hospital_navn,
      region: r.region,
      vaerdi: r.vaerdi,
      forbedring: r.forbedring_siden_baseline,
      rang: r.rang_hospital,
      enhed: selectedIndikator.enhed,
      retning: selectedIndikator.retning,
    }));

  const hospitalPerformanceRows: HospitalPerformanceRow[] = [...latestRows]
    .sort((a, b) => a.rang_hospital - b.rang_hospital)
    .map((r) => ({
      hospital_id: r.hospital_id,
      hospital_navn: r.hospital_navn,
      region: r.region,
      vaerdi: r.vaerdi,
      forbedring: r.forbedring_siden_baseline,
      antal_forloeb: r.antal_forloeb,
      rang: r.rang_hospital,
      enhed: selectedIndikator.enhed,
      retning: selectedIndikator.retning,
    }));

  const variationDepartments: VariationDepartmentRow[] = departmentRowsRaw
    .filter(
      (r) =>
        r.indikator_id === selectedIndikator.indikator_id &&
        r.aar === selectedYear &&
        Number.isFinite(r.vaerdi)
    )
    .map((r) => {
      const afdeling = afdelingMap.get(r.afdeling_id);
      const hospital = hospitalMap.get(r.hospital_id);
      return {
        afdeling_id: r.afdeling_id,
        afdeling_navn: afdeling?.afdeling_navn ?? r.afdeling_id,
        hospital_navn: hospital?.hospital_navn ?? r.hospital_id,
        region: hospital?.region ?? "",
        vaerdi: r.vaerdi,
        ci_nedre: r.ci_nedre,
        ci_oevre: r.ci_oevre,
      };
    })
    .sort((a, b) => a.vaerdi - b.vaerdi)
    .slice(0, 12);

  return {
    database,
    indikatorer,
    selectedIndikator,
    selectedYear,
    availableYears,
    benchmarkTop3,
    benchmarkWinner,
    movementTop3,
    movementWinner,
    variationValue,
    variationMin,
    variationMax,
    trendNational,
    quadrantRows,
    hospitalPerformanceRows,
    variationDepartments,
    indikatorCards: indikatorer,
  };
}
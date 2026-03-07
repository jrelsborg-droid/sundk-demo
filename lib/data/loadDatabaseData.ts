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

type HospitalAggregatRow = {
  database_id: string;
  indikator_id: string;
  hospital_id: string;
  aar: number;
  vaerdi: number;
  enhed: string;
  retning: Retning;
  metodebrud_flag: boolean;
  antal_forloeb: number;
  ci_nedre: number;
  ci_oevre: number;
  vaerdi_baseline: number;
  forbedring_siden_baseline: number;
  rang_hospital: number;
};

type MaalepunktRow = {
  database_id: string;
  indikator_id: string;
  hospital_id: string;
  afdeling_id: string;
  aar: number;
  vaerdi: number;
  enhed: string;
  retning: Retning;
  metodebrud_flag: boolean;
  antal_forloeb: number;
  ci_nedre: number;
  ci_oevre: number;
  vaerdi_baseline: number;
  forbedring_siden_baseline: number;
  rang_afdeling: number;
};

export type DatabaseIndicatorOption = {
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  enhed: string;
  retning: Retning;
};

export type DatabaseTrendPoint = {
  aar: number;
  vaerdi: number;
};

export type DatabaseHospitalRow = {
  hospital_id: string;
  hospital_navn: string;
  region: string;
  aar: number;
  vaerdi: number;
  forbedring: number;
  antal_forloeb: number;
  rang: number;
  enhed: string;
  retning: Retning;
};

export type DatabaseDepartmentRow = {
  afdeling_id: string;
  afdeling_navn: string;
  hospital_id: string;
  hospital_navn: string;
  region: string;
  aar: number;
  vaerdi: number;
  forbedring: number;
  antal_forloeb: number;
  rang: number;
  enhed: string;
  retning: Retning;
};

export type DatabasePageData = {
  database: {
    database_id: string;
    database_navn: string;
    speciale: string;
  };
  indikatorer: DatabaseIndicatorOption[];
  selectedIndikator: DatabaseIndicatorOption;
  senesteAar: number;
  trend: DatabaseTrendPoint[];
  hospitalRows: DatabaseHospitalRow[];
  departmentRows: DatabaseDepartmentRow[];
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

export function loadDatabaseData(
  databaseId: string,
  indikatorId?: string
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

  const hospitalAggregat: HospitalAggregatRow[] = hospitalAggregatCsv.map((r) => ({
    database_id: r.database_id,
    indikator_id: r.indikator_id,
    hospital_id: r.hospital_id,
    aar: parseNumber(r.aar),
    vaerdi: parseNumber(r.vaerdi),
    enhed: r.enhed,
    retning: parseRetning(r.retning),
    metodebrud_flag: parseBool(r.metodebrud_flag),
    antal_forloeb: parseNumber(r.antal_forloeb),
    ci_nedre: parseNumber(r.ci_nedre),
    ci_oevre: parseNumber(r.ci_oevre),
    vaerdi_baseline: parseNumber(r.vaerdi_baseline),
    forbedring_siden_baseline: parseNumber(r.forbedring_siden_baseline),
    rang_hospital: parseNumber(r.rang_hospital),
  }));

  const maalepunkter: MaalepunktRow[] = maalepunktCsv.map((r) => ({
    database_id: r.database_id,
    indikator_id: r.indikator_id,
    hospital_id: r.hospital_id,
    afdeling_id: r.afdeling_id,
    aar: parseNumber(r.aar),
    vaerdi: parseNumber(r.vaerdi),
    enhed: r.enhed,
    retning: parseRetning(r.retning),
    metodebrud_flag: parseBool(r.metodebrud_flag),
    antal_forloeb: parseNumber(r.antal_forloeb),
    ci_nedre: parseNumber(r.ci_nedre),
    ci_oevre: parseNumber(r.ci_oevre),
    vaerdi_baseline: parseNumber(r.vaerdi_baseline),
    forbedring_siden_baseline: parseNumber(r.forbedring_siden_baseline),
    rang_afdeling: parseNumber(r.rang_afdeling),
  }));

  const database =
    databases.find((d) => d.database_id === databaseId) ?? null;

  if (!database) {
    throw new Error(`Ukendt database_id: ${databaseId}`);
  }

  const indikatorIdsForDatabase = new Set(
    hospitalAggregat
      .filter((r) => r.database_id === databaseId)
      .map((r) => r.indikator_id)
  );

  const indikatorer: DatabaseIndicatorOption[] = indikators
    .filter((i) => indikatorIdsForDatabase.has(i.indikator_id))
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

  const rowsForDatabaseAndIndikator = hospitalAggregat.filter(
    (r) =>
      r.database_id === databaseId &&
      r.indikator_id === selectedIndikator.indikator_id
  );

  const senesteAar = Math.max(
    ...rowsForDatabaseAndIndikator.map((r) => r.aar).filter(Number.isFinite)
  );

  const hospitalMap = new Map(
    hospitals.map((h) => [h.hospital_id, h])
  );

  const afdelingMap = new Map(
    afdelinger.map((a) => [a.afdeling_id, a])
  );

  const trend: DatabaseTrendPoint[] = rowsForDatabaseAndIndikator
    .filter((r) => Number.isFinite(r.aar) && Number.isFinite(r.vaerdi))
    .sort((a, b) => a.aar - b.aar)
    .map((r) => ({
      aar: r.aar,
      vaerdi: r.vaerdi,
    }));

  const hospitalRows: DatabaseHospitalRow[] = rowsForDatabaseAndIndikator
    .filter((r) => r.aar === senesteAar)
    .map((r) => {
      const hospital = hospitalMap.get(r.hospital_id);
      return {
        hospital_id: r.hospital_id,
        hospital_navn: hospital?.hospital_navn ?? r.hospital_id,
        region: hospital?.region ?? "",
        aar: r.aar,
        vaerdi: r.vaerdi,
        forbedring: r.forbedring_siden_baseline,
        antal_forloeb: r.antal_forloeb,
        rang: r.rang_hospital,
        enhed: selectedIndikator.enhed,
        retning: selectedIndikator.retning,
      };
    })
    .sort((a, b) => a.rang - b.rang);

  const departmentRows: DatabaseDepartmentRow[] = maalepunkter
    .filter(
      (r) =>
        r.database_id === databaseId &&
        r.indikator_id === selectedIndikator.indikator_id &&
        r.aar === senesteAar
    )
    .map((r) => {
      const afdeling = afdelingMap.get(r.afdeling_id);
      const hospital = hospitalMap.get(r.hospital_id);
      return {
        afdeling_id: r.afdeling_id,
        afdeling_navn: afdeling?.afdeling_navn ?? r.afdeling_id,
        hospital_id: r.hospital_id,
        hospital_navn: hospital?.hospital_navn ?? r.hospital_id,
        region: hospital?.region ?? "",
        aar: r.aar,
        vaerdi: r.vaerdi,
        forbedring: r.forbedring_siden_baseline,
        antal_forloeb: r.antal_forloeb,
        rang: r.rang_afdeling,
        enhed: selectedIndikator.enhed,
        retning: selectedIndikator.retning,
      };
    })
    .sort((a, b) => a.rang - b.rang);

  return {
    database,
    indikatorer,
    selectedIndikator,
    senesteAar,
    trend,
    hospitalRows,
    departmentRows,
  };
}
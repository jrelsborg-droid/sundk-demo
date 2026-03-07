import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

export type Retning = "lavere_bedre" | "hoejere_bedre";

export type HospitalLatestRow = {
  aar: number;
  database_id: string;
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  hospital_id: string;
  hospital_navn: string;
  region: string;
  enhed: string;
  retning: Retning;
  metodebrud_flag: boolean;
  antal_forloeb_hospital: number;
  vaerdi_hospital: number;
  ci_nedre_hospital: number;
  ci_oevre_hospital: number;
  vaerdi_baseline_hospital: number;
  forbedring_siden_baseline_hospital: number;
  rang_hospital: number;
};

export type DepartmentLatestRow = {
  aar: number;
  database_id: string;
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  afdeling_id: string;
  afdeling_navn: string;
  hospital_id: string;
  hospital_navn: string;
  region: string;
  enhed: string;
  retning: Retning;
  metodebrud_flag: boolean;
  antal_forloeb: number;
  vaerdi: number;
  ci_nedre: number;
  ci_oevre: number;
  vaerdi_baseline: number;
  forbedring_siden_baseline: number;
  rang_afdeling: number;
};

export type DatabaseDimRow = {
  database_id: string;
  database_navn: string;
  speciale: string;
};

export type HospitalDimRow = {
  hospital_id: string;
  region: string;
  hospital_navn: string;
};

export type IndicatorDimRow = {
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  retning: Retning;
  enhed: string;
};

export type HomepageData = {
  hospitalLatest: HospitalLatestRow[];
  departmentLatest: DepartmentLatestRow[];
  databases: DatabaseDimRow[];
  hospitals: HospitalDimRow[];
  indikators: IndicatorDimRow[];
  senesteAar: number;
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

export function loadHomepageData(): HomepageData {
  const hospitalCsv = readCsv<Record<string, string>>("fakt_hospital_seneste_aar.csv");
  const databaseCsv = readCsv<Record<string, string>>("dim_database.csv");
  const hospitalDimCsv = readCsv<Record<string, string>>("dim_hospital.csv");
  const afdelingDimCsv = readCsv<Record<string, string>>("dim_afdeling.csv");
  const indikatorCsv = readCsv<Record<string, string>>("dim_indikator.csv");
  const factMaalepunktCsv = readCsv<Record<string, string>>("fakt_maalepunkt.csv");

  const databases: DatabaseDimRow[] = databaseCsv.map((r) => ({
    database_id: r.database_id,
    database_navn: r.database_navn,
    speciale: r.speciale,
  }));

  const hospitals: HospitalDimRow[] = hospitalDimCsv.map((r) => ({
    hospital_id: r.hospital_id,
    region: r.region,
    hospital_navn: r.hospital_navn,
  }));

  const indikators: IndicatorDimRow[] = indikatorCsv.map((r) => ({
    indikator_id: r.indikator_id,
    indikator_navn: r.indikator_navn,
    indikator_type: r.indikator_type,
    retning: parseRetning(r.retning),
    enhed: r.enhed,
  }));

  const indikatorMap = new Map(
    indikators.map((r) => [
      r.indikator_id,
      {
        indikator_navn: r.indikator_navn,
        indikator_type: r.indikator_type,
        retning: r.retning,
        enhed: r.enhed,
      },
    ])
  );

  const hospitalLatest: HospitalLatestRow[] = hospitalCsv.map((r) => {
    const indikator = indikatorMap.get(r.indikator_id);

    return {
      aar: parseNumber(r.aar),
      database_id: r.database_id,
      indikator_id: r.indikator_id,
      indikator_navn: indikator?.indikator_navn ?? r.indikator_id,
      indikator_type: indikator?.indikator_type ?? "",
      hospital_id: r.hospital_id,
      hospital_navn: r.hospital_navn,
      region: r.region,
      enhed: indikator?.enhed ?? r.enhed,
      retning: indikator?.retning ?? parseRetning(r.retning),
      metodebrud_flag: parseBool(r.metodebrud_flag),
      antal_forloeb_hospital: parseNumber(r.antal_forloeb_hospital),
      vaerdi_hospital: parseNumber(r.vaerdi_hospital),
      ci_nedre_hospital: parseNumber(r.ci_nedre_hospital),
      ci_oevre_hospital: parseNumber(r.ci_oevre_hospital),
      vaerdi_baseline_hospital: parseNumber(r.vaerdi_baseline_hospital),
      forbedring_siden_baseline_hospital: parseNumber(r.forbedring_siden_baseline_hospital),
      rang_hospital: parseNumber(r.rang_hospital),
    };
  });

  const senesteAar = Math.max(...hospitalLatest.map((r) => r.aar).filter(Number.isFinite));

  const afdelingMap = new Map(
    afdelingDimCsv.map((r) => [
      r.afdeling_id,
      {
        afdeling_navn: r.afdeling_navn,
        hospital_id: r.hospital_id,
      },
    ])
  );

  const hospitalMap = new Map(
    hospitalDimCsv.map((r) => [
      r.hospital_id,
      {
        hospital_navn: r.hospital_navn,
        region: r.region,
      },
    ])
  );

  const departmentLatest: DepartmentLatestRow[] = factMaalepunktCsv
    .map((r) => {
      const afdeling = afdelingMap.get(r.afdeling_id);
      const hospital = hospitalMap.get(r.hospital_id || afdeling?.hospital_id || "");
      const indikator = indikatorMap.get(r.indikator_id);

      return {
        aar: parseNumber(r.aar),
        database_id: r.database_id,
        indikator_id: r.indikator_id,
        indikator_navn: indikator?.indikator_navn ?? r.indikator_id,
        indikator_type: indikator?.indikator_type ?? "",
        afdeling_id: r.afdeling_id,
        afdeling_navn: afdeling?.afdeling_navn ?? r.afdeling_id,
        hospital_id: r.hospital_id || afdeling?.hospital_id || "",
        hospital_navn: hospital?.hospital_navn ?? "",
        region: hospital?.region ?? "",
        enhed: indikator?.enhed ?? r.enhed,
        retning: indikator?.retning ?? parseRetning(r.retning),
        metodebrud_flag: parseBool(r.metodebrud_flag),
        antal_forloeb: parseNumber(r.antal_forloeb),
        vaerdi: parseNumber(r.vaerdi),
        ci_nedre: parseNumber(r.ci_nedre),
        ci_oevre: parseNumber(r.ci_oevre),
        vaerdi_baseline: parseNumber(r.vaerdi_baseline),
        forbedring_siden_baseline: parseNumber(r.forbedring_siden_baseline),
        rang_afdeling: parseNumber(r.rang_afdeling),
      };
    })
    .filter((r) => r.aar === senesteAar);

  return {
    hospitalLatest,
    departmentLatest,
    databases,
    hospitals,
    indikators,
    senesteAar,
  };
}
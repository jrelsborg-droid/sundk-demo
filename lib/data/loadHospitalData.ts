import fs from "node:fs/promises";
import path from "node:path";

type Query = {
  aar?: string;
  database?: string;
};

type HospitalDimRow = {
  hospital_id: string;
  region: string;
  hospital_navn: string;
};

type DatabaseDimRow = {
  database_id: string;
  database_navn: string;
  speciale: string;
};

type IndicatorDimRow = {
  indikator_id: string;
  indikator_navn: string;
  indikator_type: string;
  retning: "lavere_bedre" | "hoejere_bedre";
  enhed: string;
};

type DepartmentDimRow = {
  afdeling_id: string;
  afdeling_navn: string;
  hospital_id: string;
};

type HospitalFactRow = {
  aar: number;
  database_id: string;
  indikator_id: string;
  hospital_id: string;
  hospital_navn: string;
  region: string;
  enhed: string;
  retning: "lavere_bedre" | "hoejere_bedre";
  metodebrud_flag: boolean;
  antal_forloeb_hospital: number | null;
  vaerdi_hospital: number | null;
  ci_nedre_hospital: number | null;
  ci_oevre_hospital: number | null;
  vaerdi_baseline_hospital: number | null;
  forbedring_siden_baseline_hospital: number | null;
  rang_hospital: number | null;
};

type MeasurePointRow = {
  database_id: string;
  indikator_id: string;
  hospital_id: string;
  afdeling_id: string;
  aar: number;
  vaerdi: number | null;
  enhed: string;
  retning: "lavere_bedre" | "hoejere_bedre";
  metodebrud_flag: boolean;
  antal_forloeb: number | null;
  ci_nedre: number | null;
  ci_oevre: number | null;
  vaerdi_baseline: number | null;
  forbedring_siden_baseline: number | null;
  rang_afdeling: number | null;
};

export type HospitalPageData = {
  hospital: HospitalDimRow;
  selectedYear: number;
  availableYears: number[];
  selectedDatabaseId: string | null;
  periodStart: number;
  periodEnd: number;

  databaseCount: number;
  indikatorCount: number;
  afdelingCount: number;

  benchmarkSummary: {
    value: string;
    description: string;
    subRows: Array<{ label: string; value: string }>;
  };
  movementSummary: {
    value: string;
    description: string;
    subRows: Array<{ label: string; value: string }>;
  };
  variationSummary: {
    value: string;
    description: string;
    subRows: Array<{ label: string; value: string }>;
  };

  databasesForFilter: Array<{
    id: string;
    navn: string;
  }>;

  allDatabases: Array<{
    database_id: string;
    database_navn: string;
    speciale: string;
  }>;

  allHospitals: Array<{
    hospital_id: string;
    region: string;
    hospital_navn: string;
  }>;

  landscapeRows: Array<{
    id: string;
    navn: string;
    speciale: string;
    xForbedring: number | null;
    yScore: number | null;
    avgRank: number | null;
    indikatorCount: number;
  }>;

  trendSeries: Array<{
    aar: number;
    hospitalValue: number | null;
    nationalValue: number | null;
    bestHospitalValue: number | null;
  }>;
  trendMeta: {
    enabled: boolean;
    databaseName: string | null;
    indicatorName: string | null;
    enhed: string | null;
    retning: "lavere_bedre" | "hoejere_bedre" | null;
    bestHospitalName: string | null;
    bestHospitalId: string | null;
  };

  performanceRows: Array<{
    database_id: string;
    database_navn: string;
    speciale: string;
    indikator_id: string;
    indikator_navn: string;
    indikator_type: string;
    vaerdi: number | null;
    forbedring: number | null;
    rang: number | null;
    antal_forloeb: number | null;
    enhed: string;
    retning: "lavere_bedre" | "hoejere_bedre";
  }>;

  departmentVariationRows: Array<{
    afdeling_id: string;
    afdeling_navn: string;
    database_id: string;
    database_navn: string;
    indikator_id: string;
    indikator_navn: string;
    vaerdi: number | null;
    ci_nedre: number | null;
    ci_oevre: number | null;
    enhed: string;
    retning: "lavere_bedre" | "hoejere_bedre";
  }>;

  indikatorCards: Array<{
    indikator_id: string;
    indikator_navn: string;
    indikator_type: string;
    enhed: string;
    retning: "lavere_bedre" | "hoejere_bedre";
  }>;
};

function parseCsv(text: string): string[][] {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    row.push(current);
    return row.map((cell) => cell.trim());
  });
}

function toObjects<T extends Record<string, unknown>>(rows: string[][]): T[] {
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: Record<string, unknown> = {};
    header.forEach((key, i) => {
      obj[key] = row[i] ?? "";
    });
    return obj as T;
  });
}

async function readCsv<T extends Record<string, unknown>>(fileName: string): Promise<T[]> {
  const filePath = path.join(process.cwd(), "data", fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return toObjects<T>(parseCsv(raw));
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const str = String(value).trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function toBoolean(value: unknown): boolean {
  return String(value).trim().toLowerCase() === "true";
}

function avg(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function min(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return null;
  return Math.min(...valid);
}

function max(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) return null;
  return Math.max(...valid);
}

function formatValue(value: number | null, enhed = ""): string {
  if (value == null) return "–";
  if (enhed === "pct" || enhed === "%") return `${value.toFixed(1)}%`;
  if (enhed === "dage") return `${value.toFixed(1)} dage`;
  if (enhed === "timer") return `${value.toFixed(1)} timer`;
  return value.toFixed(1);
}

function rankScore(rank: number | null, populationSize: number): number | null {
  if (rank == null || populationSize <= 1) return null;
  return 1 - (rank - 1) / (populationSize - 1);
}

function improvementDirectionAdjusted(
  value: number | null,
  retning: "lavere_bedre" | "hoejere_bedre"
): number | null {
  if (value == null) return null;
  return retning === "lavere_bedre" ? -value : value;
}

function uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export async function loadHospitalData(
  hospitalId: string,
  query?: Query
): Promise<HospitalPageData> {
  const [
    hospitalsRaw,
    databasesRaw,
    indicatorsRaw,
    departmentsRaw,
    hospitalFactsRaw,
    measurePointsRaw,
  ] = await Promise.all([
    readCsv<HospitalDimRow>("dim_hospital.csv"),
    readCsv<DatabaseDimRow>("dim_database.csv"),
    readCsv<IndicatorDimRow>("dim_indikator.csv"),
    readCsv<DepartmentDimRow>("dim_afdeling.csv"),
    readCsv<Record<string, unknown>>("fakt_hospital_aggregat.csv"),
    readCsv<Record<string, unknown>>("fakt_maalepunkt.csv"),
  ]);

  const hospitals = hospitalsRaw;
  const databases = databasesRaw;
  const indicators = indicatorsRaw.map((r) => ({
    ...r,
    retning: (r.retning || "hoejere_bedre") as "lavere_bedre" | "hoejere_bedre",
  }));
  const departments = departmentsRaw;

  const databaseMap = new Map(databases.map((d) => [d.database_id, d]));
  const indicatorMap = new Map(indicators.map((i) => [i.indikator_id, i]));
  const departmentMap = new Map(departments.map((d) => [d.afdeling_id, d]));

  const hospitalFacts: HospitalFactRow[] = hospitalFactsRaw.map((r) => ({
    aar: Number(r.aar),
    database_id: String(r.database_id),
    indikator_id: String(r.indikator_id),
    hospital_id: String(r.hospital_id),
    hospital_navn: String(r.hospital_navn ?? ""),
    region: String(r.region ?? ""),
    enhed: String(r.enhed ?? ""),
    retning: String(r.retning ?? "hoejere_bedre") as "lavere_bedre" | "hoejere_bedre",
    metodebrud_flag: toBoolean(r.metodebrud_flag),
    antal_forloeb_hospital: toNumber(r.antal_forloeb_hospital),
    vaerdi_hospital: toNumber(r.vaerdi_hospital),
    ci_nedre_hospital: toNumber(r.ci_nedre_hospital),
    ci_oevre_hospital: toNumber(r.ci_oevre_hospital),
    vaerdi_baseline_hospital: toNumber(r.vaerdi_baseline_hospital),
    forbedring_siden_baseline_hospital: toNumber(r.forbedring_siden_baseline_hospital),
    rang_hospital: toNumber(r.rang_hospital),
  }));

  const measurePoints: MeasurePointRow[] = measurePointsRaw.map((r) => ({
    database_id: String(r.database_id),
    indikator_id: String(r.indikator_id),
    hospital_id: String(r.hospital_id),
    afdeling_id: String(r.afdeling_id),
    aar: Number(r.aar),
    vaerdi: toNumber(r.vaerdi),
    enhed: String(r.enhed ?? ""),
    retning: String(r.retning ?? "hoejere_bedre") as "lavere_bedre" | "hoejere_bedre",
    metodebrud_flag: toBoolean(r.metodebrud_flag),
    antal_forloeb: toNumber(r.antal_forloeb),
    ci_nedre: toNumber(r.ci_nedre),
    ci_oevre: toNumber(r.ci_oevre),
    vaerdi_baseline: toNumber(r.vaerdi_baseline),
    forbedring_siden_baseline: toNumber(r.forbedring_siden_baseline),
    rang_afdeling: toNumber(r.rang_afdeling),
  }));

  const hospital = hospitals.find((h) => h.hospital_id === hospitalId);
  if (!hospital) throw new Error(`Hospital not found: ${hospitalId}`);

  const hospitalRowsAllYears = hospitalFacts.filter((r) => r.hospital_id === hospitalId);
  if (!hospitalRowsAllYears.length) {
    throw new Error(`No fact rows found for hospital: ${hospitalId}`);
  }

  const availableYears = [...new Set(hospitalRowsAllYears.map((r) => r.aar))]
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => a - b);

  const selectedYear =
    query?.aar && availableYears.includes(Number(query.aar))
      ? Number(query.aar)
      : availableYears[availableYears.length - 1];

  const allHospitalDatabaseIds = [...new Set(hospitalRowsAllYears.map((r) => r.database_id))].sort();
  const selectedDatabaseId =
    query?.database && allHospitalDatabaseIds.includes(query.database)
      ? query.database
      : null;

  const rowsSelectedYear = hospitalRowsAllYears.filter(
    (r) => r.aar === selectedYear && (!selectedDatabaseId || r.database_id === selectedDatabaseId)
  );

  const rowsSelectedYearNoMetodebrud = rowsSelectedYear.filter((r) => !r.metodebrud_flag);

  const periodStart = availableYears[0];
  const periodEnd = availableYears[availableYears.length - 1];

  const databaseCount = new Set(rowsSelectedYear.map((r) => r.database_id)).size;
  const indikatorCount = new Set(rowsSelectedYear.map((r) => r.indikator_id)).size;
  const afdelingCount = departments.filter((d) => d.hospital_id === hospitalId).length;

  const databasesForFilter = allHospitalDatabaseIds.map((databaseId) => ({
    id: databaseId,
    navn: databaseMap.get(databaseId)?.database_navn ?? databaseId,
  }));

  const performanceRows = rowsSelectedYearNoMetodebrud
    .map((row) => {
      const db = databaseMap.get(row.database_id);
      const indikator = indicatorMap.get(row.indikator_id);

      return {
        database_id: row.database_id,
        database_navn: db?.database_navn ?? row.database_id,
        speciale: db?.speciale ?? "",
        indikator_id: row.indikator_id,
        indikator_navn: indikator?.indikator_navn ?? row.indikator_id,
        indikator_type: indikator?.indikator_type ?? "",
        vaerdi: row.vaerdi_hospital,
        forbedring: row.forbedring_siden_baseline_hospital,
        rang: row.rang_hospital,
        antal_forloeb: row.antal_forloeb_hospital,
        enhed: indikator?.enhed ?? row.enhed ?? "",
        retning: indikator?.retning ?? row.retning,
      };
    })
    .sort((a, b) => {
      if (a.rang == null && b.rang == null) return 0;
      if (a.rang == null) return 1;
      if (b.rang == null) return -1;
      return a.rang - b.rang;
    });

  const hospitalPopulationSize =
    new Set(hospitalFacts.filter((r) => r.aar === selectedYear).map((r) => r.hospital_id)).size || 18;

  const topQuartileCount = performanceRows.filter(
    (r) => r.rang != null && r.rang <= Math.ceil(hospitalPopulationSize * 0.25)
  ).length;

  const positiveMovementCount = performanceRows.filter((r) => {
    const adjusted = improvementDirectionAdjusted(r.forbedring, r.retning);
    return adjusted != null && adjusted > 0;
  }).length;

  const groupedByDatabase = new Map<string, typeof performanceRows>();
  for (const row of performanceRows) {
    if (!groupedByDatabase.has(row.database_id)) {
      groupedByDatabase.set(row.database_id, []);
    }
    groupedByDatabase.get(row.database_id)!.push(row);
  }

  const landscapeRows = [...groupedByDatabase.entries()]
    .map(([databaseId, rows]) => {
      const db = databaseMap.get(databaseId);

      const avgAdjustedImprovement = avg(
        rows.map((r) => improvementDirectionAdjusted(r.forbedring, r.retning))
      );

      const avgRankScore = avg(rows.map((r) => rankScore(r.rang, hospitalPopulationSize)));
      const avgRank = avg(rows.map((r) => r.rang));

      return {
        id: databaseId,
        navn: db?.database_navn ?? databaseId,
        speciale: db?.speciale ?? "",
        xForbedring: avgAdjustedImprovement,
        yScore: avgRankScore,
        avgRank,
        indikatorCount: rows.length,
      };
    })
    .sort((a, b) => a.navn.localeCompare(b.navn, "da"));

  const bestSinglePerformance = performanceRows[0] ?? null;

  const bestSingleMovement =
    [...performanceRows]
      .map((r) => ({
        ...r,
        adjusted: improvementDirectionAdjusted(r.forbedring, r.retning),
      }))
      .filter((r) => r.adjusted != null)
      .sort((a, b) => b.adjusted! - a.adjusted!)[0] ?? null;

  const measureRowsSelectedYear = measurePoints.filter(
    (r) =>
      r.hospital_id === hospitalId &&
      r.aar === selectedYear &&
      (!selectedDatabaseId || r.database_id === selectedDatabaseId) &&
      !r.metodebrud_flag
  );

  const departmentVariationRows = measureRowsSelectedYear
    .map((row) => {
      const afdeling = departmentMap.get(row.afdeling_id);
      const db = databaseMap.get(row.database_id);
      const indikator = indicatorMap.get(row.indikator_id);

      return {
        afdeling_id: row.afdeling_id,
        afdeling_navn: afdeling?.afdeling_navn ?? row.afdeling_id,
        database_id: row.database_id,
        database_navn: db?.database_navn ?? row.database_id,
        indikator_id: row.indikator_id,
        indikator_navn: indikator?.indikator_navn ?? row.indikator_id,
        vaerdi: row.vaerdi,
        ci_nedre: row.ci_nedre,
        ci_oevre: row.ci_oevre,
        enhed: indikator?.enhed ?? row.enhed ?? "",
        retning: indikator?.retning ?? row.retning,
      };
    })
    .sort((a, b) => {
      if (a.vaerdi == null && b.vaerdi == null) return 0;
      if (a.vaerdi == null) return 1;
      if (b.vaerdi == null) return -1;
      return a.vaerdi - b.vaerdi;
    });

  const widestVariation =
    departmentVariationRows
      .map((r) => ({
        ...r,
        spread:
          r.ci_nedre != null && r.ci_oevre != null ? r.ci_oevre - r.ci_nedre : null,
      }))
      .filter((r) => r.spread != null)
      .sort((a, b) => b.spread! - a.spread!)[0] ?? null;

  const variationRowsForDisplay = departmentVariationRows.slice(0, 8);

  let trendSeries: Array<{
    aar: number;
    hospitalValue: number | null;
    nationalValue: number | null;
    bestHospitalValue: number | null;
  }> = [];

  let trendMeta: HospitalPageData["trendMeta"] = {
    enabled: false,
    databaseName: null,
    indicatorName: null,
    enhed: null,
    retning: null,
    bestHospitalName: null,
    bestHospitalId: null,
  };

  if (selectedDatabaseId) {
    const dbRowsCurrentYear = performanceRows.filter((r) => r.database_id === selectedDatabaseId);

    const anchorRow =
      [...dbRowsCurrentYear].sort((a, b) => {
        if (a.rang == null && b.rang == null) return 0;
        if (a.rang == null) return 1;
        if (b.rang == null) return -1;
        return a.rang - b.rang;
      })[0] ?? null;

    if (anchorRow) {
      const bestHospitalCurrentYearRow = hospitalFacts
        .filter(
          (r) =>
            r.aar === selectedYear &&
            r.database_id === selectedDatabaseId &&
            r.indikator_id === anchorRow.indikator_id &&
            !r.metodebrud_flag
        )
        .sort((a, b) => {
          if (a.rang_hospital == null && b.rang_hospital == null) return 0;
          if (a.rang_hospital == null) return 1;
          if (b.rang_hospital == null) return -1;
          return a.rang_hospital - b.rang_hospital;
        })[0] ?? null;

      trendMeta = {
        enabled: true,
        databaseName: anchorRow.database_navn,
        indicatorName: anchorRow.indikator_navn,
        enhed: anchorRow.enhed,
        retning: anchorRow.retning,
        bestHospitalName: bestHospitalCurrentYearRow?.hospital_navn ?? null,
        bestHospitalId: bestHospitalCurrentYearRow?.hospital_id ?? null,
      };

      trendSeries = availableYears.map((aar) => {
        const hospitalRow = hospitalFacts.find(
          (r) =>
            r.hospital_id === hospitalId &&
            r.aar === aar &&
            r.database_id === selectedDatabaseId &&
            r.indikator_id === anchorRow.indikator_id &&
            !r.metodebrud_flag
        );

        const allHospitalsSameIndicator = hospitalFacts.filter(
          (r) =>
            r.aar === aar &&
            r.database_id === selectedDatabaseId &&
            r.indikator_id === anchorRow.indikator_id &&
            !r.metodebrud_flag
        );

        const bestHospitalTrendRow =
          bestHospitalCurrentYearRow == null
            ? null
            : hospitalFacts.find(
                (r) =>
                  r.hospital_id === bestHospitalCurrentYearRow.hospital_id &&
                  r.aar === aar &&
                  r.database_id === selectedDatabaseId &&
                  r.indikator_id === anchorRow.indikator_id &&
                  !r.metodebrud_flag
              ) ?? null;

        return {
          aar,
          hospitalValue: hospitalRow?.vaerdi_hospital ?? null,
          nationalValue: avg(allHospitalsSameIndicator.map((r) => r.vaerdi_hospital)),
          bestHospitalValue: bestHospitalTrendRow?.vaerdi_hospital ?? null,
        };
      });
    }
  }

  const indikatorCards = uniqueBy(
    performanceRows.map((row) => ({
      indikator_id: row.indikator_id,
      indikator_navn: row.indikator_navn,
      indikator_type: row.indikator_type,
      enhed: row.enhed,
      retning: row.retning,
    })),
    (x) => x.indikator_id
  ).sort((a, b) => a.indikator_navn.localeCompare(b.indikator_navn, "da"));

  const allDatabasesMode = selectedDatabaseId == null;

  const benchmarkSummary = allDatabasesMode
    ? {
        value: `${Math.round((topQuartileCount / Math.max(performanceRows.length, 1)) * 100)}%`,
        description: "Andel indikatorer i top 25 % blandt hospitalerne",
        subRows: [
          { label: "Top 25 %", value: `${topQuartileCount} af ${performanceRows.length}` },
          {
            label: "Gns. rang",
            value:
              avg(performanceRows.map((r) => r.rang)) == null
                ? "–"
                : avg(performanceRows.map((r) => r.rang))!.toFixed(1),
          },
        ],
      }
    : {
        value: bestSinglePerformance?.rang == null ? "–" : `#${Math.round(bestSinglePerformance.rang)}`,
        description: bestSinglePerformance
          ? `${bestSinglePerformance.indikator_navn} · ${bestSinglePerformance.database_navn}`
          : "Intet datagrundlag",
        subRows: bestSinglePerformance
          ? [
              {
                label: "Niveau",
                value: formatValue(bestSinglePerformance.vaerdi, bestSinglePerformance.enhed),
              },
              {
                label: "Forløb",
                value:
                  bestSinglePerformance.antal_forloeb == null
                    ? "–"
                    : String(Math.round(bestSinglePerformance.antal_forloeb)),
              },
            ]
          : [],
      };

  const movementSummary = allDatabasesMode
    ? {
        value: `${Math.round((positiveMovementCount / Math.max(performanceRows.length, 1)) * 100)}%`,
        description: "Andel indikatorer med positiv retningstilpasset udvikling",
        subRows: [
          {
            label: "Positiv udvikling",
            value: `${positiveMovementCount} af ${performanceRows.length}`,
          },
          {
            label: "Største forbedringsområde",
            value: bestSingleMovement?.database_navn ?? "–",
          },
        ],
      }
    : {
        value: bestSingleMovement
          ? formatValue(bestSingleMovement.forbedring, bestSingleMovement.enhed)
          : "–",
        description: bestSingleMovement
          ? `${bestSingleMovement.indikator_navn} · ${bestSingleMovement.database_navn}`
          : "Intet datagrundlag",
        subRows: bestSingleMovement
          ? [
              {
                label: "Udvikling siden baseline",
                value: formatValue(bestSingleMovement.forbedring, bestSingleMovement.enhed),
              },
              {
                label: "Retning",
                value:
                  bestSingleMovement.retning === "lavere_bedre"
                    ? "Lavere er bedre"
                    : "Højere er bedre",
              },
            ]
          : [],
      };

  const variationSummary = allDatabasesMode
    ? {
        value: widestVariation?.spread == null ? "–" : formatValue(widestVariation.spread, widestVariation.enhed),
        description: widestVariation
          ? `Største interne spænd · ${widestVariation.database_navn}`
          : "Intet variationsgrundlag",
        subRows: widestVariation
          ? [
              { label: "Indikator", value: widestVariation.indikator_navn },
              {
                label: "Afdeling",
                value: widestVariation.afdeling_navn,
              },
            ]
          : [],
      }
    : {
        value:
          widestVariation?.spread == null ? "–" : formatValue(widestVariation.spread, widestVariation.enhed),
        description:
          selectedDatabaseId && databaseMap.get(selectedDatabaseId)
            ? `Intern variation · ${databaseMap.get(selectedDatabaseId)?.database_navn}`
            : "Vælg en database for mere præcis variation",
        subRows: widestVariation
          ? [
              { label: "Min", value: formatValue(min(variationRowsForDisplay.map((r) => r.vaerdi)), widestVariation.enhed) },
              { label: "Max", value: formatValue(max(variationRowsForDisplay.map((r) => r.vaerdi)), widestVariation.enhed) },
            ]
          : [],
      };

  return {
    hospital,
    selectedYear,
    availableYears,
    selectedDatabaseId,
    periodStart,
    periodEnd,
    databaseCount,
    indikatorCount,
    afdelingCount,
    benchmarkSummary,
    movementSummary,
    variationSummary,
    databasesForFilter,
    allDatabases: databases,
    allHospitals: hospitals,
    landscapeRows,
    trendSeries,
    trendMeta,
    performanceRows,
    departmentVariationRows: variationRowsForDisplay,
    indikatorCards,
  };
}
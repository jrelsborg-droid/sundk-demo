import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

type Retning = "lavere_bedre" | "hoejere_bedre";
type Niveau = "national" | "hospital" | "afdeling";
type VisType = "tidsserie" | "bar" | "tabel";

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

type AnalyseQuery = {
  vis?: string;
  database?: string;
  indikator?: string;
  niveau?: string;
  entities?: string;
  from?: string;
  to?: string;
};

type TrendPoint = {
  aar: number;
  vaerdi: number;
  rang?: number | null;
};

type LineSeries = {
  id: string;
  navn: string;
  sublabel?: string;
  points: TrendPoint[];
};

type BarRow = {
  id: string;
  navn: string;
  sublabel?: string;
  vaerdi: number;
  enhed: string;
  rang?: number | null;
};

type TableRow = {
  navn: string;
  sublabel?: string;
  aar: number;
  vaerdi: number;
  enhed: string;
  rang?: number | null;
};

type EntityOption = {
  id: string;
  navn: string;
  sublabel?: string;
};

export type AnalysePageData = {
  allDatabases: DatabaseDimRow[];
  allHospitals: HospitalDimRow[];

  state: {
    vis: VisType;
    databaseId: string;
    indikatorId: string;
    niveau: Niveau;
    entityIds: string[];
    fromYear: number;
    toYear: number;
  };

  selectedDatabase: DatabaseDimRow;
  selectedIndikator: {
    indikator_id: string;
    indikator_navn: string;
    indikator_type: string;
    enhed: string;
    retning: Retning;
  };

  availableDatabases: DatabaseDimRow[];
  availableIndicators: Array<{
    indikator_id: string;
    indikator_navn: string;
    indikator_type: string;
    enhed: string;
    retning: Retning;
  }>;
  availableLevels: Array<{ id: Niveau; label: string }>;
  availableEntities: EntityOption[];
  availableYears: number[];
  availableVisualizations: Array<{ id: VisType; label: string }>;

  chartTitle: string;
  chartSubtitle: string;
  interpretationTitle: string;
  interpretationText: string;

  lineSeries: LineSeries[];
  barRows: BarRow[];
  tableRows: TableRow[];
};

function parseNumber(v: unknown): number {
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim();
  if (!s) return NaN;
  return Number(s);
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

function uniq<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function avg(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
}

function parseVis(v?: string): VisType {
  return v === "bar" || v === "tabel" ? v : "tidsserie";
}

function parseNiveau(v?: string): Niveau {
  return v === "national" || v === "afdeling" ? v : "hospital";
}

function parseEntities(v?: string): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function niveauLabel(niveau: Niveau) {
  if (niveau === "national") return "nationalt niveau";
  if (niveau === "hospital") return "hospitaler";
  return "afdelinger";
}

function buildChartTitle(indikatorNavn: string, niveau: Niveau, vis: VisType) {
  if (vis === "tabel") {
    return `${indikatorNavn} i tabelvisning`;
  }
  if (vis === "bar") {
    return `${indikatorNavn} på tværs af ${niveauLabel(niveau)}`;
  }
  return `Udvikling i ${indikatorNavn} på tværs af ${niveauLabel(niveau)}`;
}

function buildInterpretation(retning: Retning, niveau: Niveau, enhed: string) {
  const directionText =
    retning === "lavere_bedre" ? "Lavere værdier er bedre." : "Højere værdier er bedre.";

  const levelText =
    niveau === "national"
      ? "Visningen sammenfatter udviklingen nationalt eller viser nationale sammenligninger."
      : niveau === "hospital"
        ? "Visningen sammenligner udvalgte hospitaler."
        : "Visningen sammenligner udvalgte afdelinger.";

  return {
    title: "Sådan læses analysen",
    text: `${directionText} ${levelText} Enhed: ${enhed}.`,
  };
}

export function getAnalyseData(query?: AnalyseQuery): AnalysePageData {
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

  const hospitalMap = new Map(hospitals.map((h) => [h.hospital_id, h]));
  const afdelingMap = new Map(afdelinger.map((a) => [a.afdeling_id, a]));
  const indikatorMap = new Map(indikators.map((i) => [i.indikator_id, i]));

  const hospitalRows = hospitalAggregatCsv
    .map((r) => ({
      database_id: r.database_id,
      indikator_id: r.indikator_id,
      hospital_id: r.hospital_id,
      aar: parseNumber(r.aar),
      vaerdi: parseNumber(r.vaerdi_hospital || r.vaerdi),
      rang: parseNumber(r.rang_hospital),
      antal_forloeb: parseNumber(r.antal_forloeb_hospital || r.antal_forloeb),
    }))
    .filter(
      (r) =>
        r.database_id &&
        r.indikator_id &&
        r.hospital_id &&
        Number.isFinite(r.aar) &&
        Number.isFinite(r.vaerdi)
    );

  const afdelingRows = maalepunktCsv
    .map((r) => ({
      database_id: r.database_id,
      indikator_id: r.indikator_id,
      hospital_id: r.hospital_id,
      afdeling_id: r.afdeling_id,
      aar: parseNumber(r.aar),
      vaerdi: parseNumber(r.vaerdi),
      rang: parseNumber(r.rang_afdeling),
    }))
    .filter(
      (r) =>
        r.database_id &&
        r.indikator_id &&
        r.afdeling_id &&
        Number.isFinite(r.aar) &&
        Number.isFinite(r.vaerdi)
    );

  const availableDatabases = databases
    .filter((db) => hospitalRows.some((r) => r.database_id === db.database_id))
    .sort((a, b) => a.database_navn.localeCompare(b.database_navn, "da"));

  const selectedDatabase =
    availableDatabases.find((d) => d.database_id === query?.database) ?? availableDatabases[0];

  if (!selectedDatabase) {
    throw new Error("Ingen databaser tilgængelige");
  }

  const availableIndicators = indikators
    .filter((i) =>
      hospitalRows.some(
        (r) =>
          r.database_id === selectedDatabase.database_id &&
          r.indikator_id === i.indikator_id
      )
    )
    .sort((a, b) => a.indikator_navn.localeCompare(b.indikator_navn, "da"))
    .map((i) => ({
      indikator_id: i.indikator_id,
      indikator_navn: i.indikator_navn,
      indikator_type: i.indikator_type,
      enhed: i.enhed,
      retning: i.retning,
    }));

  const selectedIndikator =
    availableIndicators.find((i) => i.indikator_id === query?.indikator) ??
    availableIndicators[0];

  if (!selectedIndikator) {
    throw new Error("Ingen indikatorer tilgængelige");
  }

  const niveau = parseNiveau(query?.niveau);

  const availableLevels: Array<{ id: Niveau; label: string }> = [
    { id: "national", label: "Nationalt" },
    { id: "hospital", label: "Hospitaler" },
    { id: "afdeling", label: "Afdelinger" },
  ];

  const baseHospitalRows = hospitalRows.filter(
    (r) =>
      r.database_id === selectedDatabase.database_id &&
      r.indikator_id === selectedIndikator.indikator_id
  );

  const baseAfdelingRows = afdelingRows.filter(
    (r) =>
      r.database_id === selectedDatabase.database_id &&
      r.indikator_id === selectedIndikator.indikator_id
  );

  const availableYears = uniq(
    (niveau === "afdeling" ? baseAfdelingRows : baseHospitalRows)
      .map((r) => r.aar)
      .filter(Number.isFinite)
  ).sort((a, b) => a - b);

  const fromYearCandidate = parseNumber(query?.from);
  const toYearCandidate = parseNumber(query?.to);

  const fromYear =
    Number.isFinite(fromYearCandidate) && availableYears.includes(fromYearCandidate)
      ? fromYearCandidate
      : availableYears[0];

  const toYear =
    Number.isFinite(toYearCandidate) && availableYears.includes(toYearCandidate)
      ? toYearCandidate
      : availableYears[availableYears.length - 1];

  let availableEntities: EntityOption[] = [];

  if (niveau === "hospital") {
    availableEntities = uniq(baseHospitalRows.map((r) => r.hospital_id))
      .map((id) => {
        const h = hospitalMap.get(id);
        return {
          id,
          navn: h?.hospital_navn ?? id,
          sublabel: h?.region ?? "",
        };
      })
      .sort((a, b) => a.navn.localeCompare(b.navn, "da"));
  }

  if (niveau === "afdeling") {
    availableEntities = uniq(baseAfdelingRows.map((r) => r.afdeling_id))
      .map((id) => {
        const a = afdelingMap.get(id);
        const h = a ? hospitalMap.get(a.hospital_id) : null;
        return {
          id,
          navn: a?.afdeling_navn ?? id,
          sublabel: h?.hospital_navn ?? "",
        };
      })
      .sort((a, b) => a.navn.localeCompare(b.navn, "da"));
  }

  const requestedEntityIds = parseEntities(query?.entities);
  const hadExplicitEntities = requestedEntityIds.length > 0;

  let entityIds = requestedEntityIds.filter((id) =>
    availableEntities.some((e) => e.id === id)
  );

  if (!hadExplicitEntities && niveau === "hospital" && entityIds.length === 0) {
    entityIds = availableEntities.slice(0, 3).map((e) => e.id);
  }

  if (!hadExplicitEntities && niveau === "afdeling" && entityIds.length === 0) {
    entityIds = availableEntities.slice(0, 5).map((e) => e.id);
  }

  const vis = parseVis(query?.vis);

  const availableVisualizations: Array<{ id: VisType; label: string }> = [
    { id: "tidsserie", label: "Tidsserie" },
    { id: "bar", label: "Søjlediagram" },
    { id: "tabel", label: "Tabel" },
  ];

  const lineSeries: LineSeries[] = [];
  const barRows: BarRow[] = [];
  const tableRows: TableRow[] = [];

  if (niveau === "national") {
    const nationalSeries = availableYears
      .filter((aar) => aar >= fromYear && aar <= toYear)
      .map((aar) => {
        const rows = baseHospitalRows.filter((r) => r.aar === aar);
        return {
          aar,
          vaerdi: avg(rows.map((r) => r.vaerdi)),
          rang: null,
        };
      });

    lineSeries.push({
      id: "national",
      navn: "Nationalt gennemsnit",
      points: nationalSeries,
    });

    const rowsAtToYear = baseHospitalRows
      .filter((r) => r.aar === toYear)
      .map((r) => {
        const h = hospitalMap.get(r.hospital_id);
        return {
          id: r.hospital_id,
          navn: h?.hospital_navn ?? r.hospital_id,
          sublabel: h?.region ?? "",
          vaerdi: r.vaerdi,
          enhed: selectedIndikator.enhed,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        };
      })
      .sort((a, b) => {
        if (selectedIndikator.retning === "lavere_bedre") return a.vaerdi - b.vaerdi;
        return b.vaerdi - a.vaerdi;
      })
      .slice(0, 12);

    barRows.push(...rowsAtToYear);

    for (const aar of availableYears.filter((y) => y >= fromYear && y <= toYear)) {
      const rows = baseHospitalRows.filter((r) => r.aar === aar);
      for (const r of rows) {
        const h = hospitalMap.get(r.hospital_id);
        tableRows.push({
          navn: h?.hospital_navn ?? r.hospital_id,
          sublabel: h?.region ?? "",
          aar,
          vaerdi: r.vaerdi,
          enhed: selectedIndikator.enhed,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        });
      }
    }
  }

  if (niveau === "hospital") {
    const selectedHospitalRows = baseHospitalRows.filter((r) =>
      entityIds.includes(r.hospital_id)
    );

    for (const entityId of entityIds) {
      const h = hospitalMap.get(entityId);
      const points = selectedHospitalRows
        .filter((r) => r.hospital_id === entityId && r.aar >= fromYear && r.aar <= toYear)
        .sort((a, b) => a.aar - b.aar)
        .map((r) => ({
          aar: r.aar,
          vaerdi: r.vaerdi,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        }));

      if (points.length) {
        lineSeries.push({
          id: entityId,
          navn: h?.hospital_navn ?? entityId,
          sublabel: h?.region ?? "",
          points,
        });
      }
    }

    const rowsAtToYear = baseHospitalRows
      .filter((r) => r.aar === toYear)
      .filter((r) => (entityIds.length ? entityIds.includes(r.hospital_id) : true))
      .map((r) => {
        const h = hospitalMap.get(r.hospital_id);
        return {
          id: r.hospital_id,
          navn: h?.hospital_navn ?? r.hospital_id,
          sublabel: h?.region ?? "",
          vaerdi: r.vaerdi,
          enhed: selectedIndikator.enhed,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        };
      })
      .sort((a, b) => {
        if (selectedIndikator.retning === "lavere_bedre") return a.vaerdi - b.vaerdi;
        return b.vaerdi - a.vaerdi;
      });

    barRows.push(...rowsAtToYear);

    for (const r of selectedHospitalRows
      .filter((r) => r.aar >= fromYear && r.aar <= toYear)
      .sort((a, b) => a.aar - b.aar)) {
      const h = hospitalMap.get(r.hospital_id);
      tableRows.push({
        navn: h?.hospital_navn ?? r.hospital_id,
        sublabel: h?.region ?? "",
        aar: r.aar,
        vaerdi: r.vaerdi,
        enhed: selectedIndikator.enhed,
        rang: Number.isFinite(r.rang) ? r.rang : null,
      });
    }
  }

  if (niveau === "afdeling") {
    const selectedAfdelingRows = baseAfdelingRows.filter((r) =>
      entityIds.includes(r.afdeling_id)
    );

    for (const entityId of entityIds) {
      const a = afdelingMap.get(entityId);
      const h = a ? hospitalMap.get(a.hospital_id) : null;

      const points = selectedAfdelingRows
        .filter((r) => r.afdeling_id === entityId && r.aar >= fromYear && r.aar <= toYear)
        .sort((a, b) => a.aar - b.aar)
        .map((r) => ({
          aar: r.aar,
          vaerdi: r.vaerdi,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        }));

      if (points.length) {
        lineSeries.push({
          id: entityId,
          navn: a?.afdeling_navn ?? entityId,
          sublabel: h?.hospital_navn ?? "",
          points,
        });
      }
    }

    const rowsAtToYear = baseAfdelingRows
      .filter((r) => r.aar === toYear)
      .filter((r) => (entityIds.length ? entityIds.includes(r.afdeling_id) : true))
      .map((r) => {
        const a = afdelingMap.get(r.afdeling_id);
        const h = a ? hospitalMap.get(a.hospital_id) : null;
        return {
          id: r.afdeling_id,
          navn: a?.afdeling_navn ?? r.afdeling_id,
          sublabel: h?.hospital_navn ?? "",
          vaerdi: r.vaerdi,
          enhed: selectedIndikator.enhed,
          rang: Number.isFinite(r.rang) ? r.rang : null,
        };
      })
      .sort((a, b) => {
        if (selectedIndikator.retning === "lavere_bedre") return a.vaerdi - b.vaerdi;
        return b.vaerdi - a.vaerdi;
      });

    barRows.push(...rowsAtToYear);

    for (const r of selectedAfdelingRows
      .filter((r) => r.aar >= fromYear && r.aar <= toYear)
      .sort((a, b) => a.aar - b.aar)) {
      const a = afdelingMap.get(r.afdeling_id);
      const h = a ? hospitalMap.get(a.hospital_id) : null;
      tableRows.push({
        navn: a?.afdeling_navn ?? r.afdeling_id,
        sublabel: h?.hospital_navn ?? "",
        aar: r.aar,
        vaerdi: r.vaerdi,
        enhed: selectedIndikator.enhed,
        rang: Number.isFinite(r.rang) ? r.rang : null,
      });
    }
  }

  const chartTitle = buildChartTitle(
    selectedIndikator.indikator_navn,
    niveau,
    vis
  );

  const chartSubtitle = `${selectedDatabase.database_navn} · ${selectedIndikator.indikator_type} · ${selectedIndikator.enhed} · ${fromYear}–${toYear}`;

  const interpretation = buildInterpretation(
    selectedIndikator.retning,
    niveau,
    selectedIndikator.enhed
  );

  return {
    allDatabases: databases,
    allHospitals: hospitals,

    state: {
      vis,
      databaseId: selectedDatabase.database_id,
      indikatorId: selectedIndikator.indikator_id,
      niveau,
      entityIds,
      fromYear,
      toYear,
    },

    selectedDatabase,
    selectedIndikator,

    availableDatabases,
    availableIndicators,
    availableLevels,
    availableEntities,
    availableYears,
    availableVisualizations,

    chartTitle,
    chartSubtitle,
    interpretationTitle: interpretation.title,
    interpretationText: interpretation.text,

    lineSeries,
    barRows,
    tableRows,
  };
}
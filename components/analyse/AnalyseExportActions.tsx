"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

type TableRow = {
  navn: string;
  sublabel?: string;
  aar: number;
  vaerdi: number;
  enhed: string;
  rang?: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeCsv(value: string | number | null | undefined) {
  const stringValue = value == null ? "" : String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default function AnalyseExportActions({
  chartElementId,
  title,
  databaseName,
  indicatorName,
  visType,
  tableRows,
}: {
  chartElementId: string;
  title: string;
  databaseName: string;
  indicatorName: string;
  visType: string;
  tableRows: TableRow[];
}) {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const baseFileName = slugify(`${databaseName}-${indicatorName}-${visType}`);

  async function downloadImage() {
    const node = document.getElementById(chartElementId);
    if (!node) return;

    try {
      setIsExportingImage(true);

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${baseFileName}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExportingImage(false);
    }
  }

  function downloadCsv() {
    try {
      setIsExportingCsv(true);

      const header = ["navn", "sublabel", "aar", "vaerdi", "enhed", "rang"];
      const lines = [
        header.join(","),
        ...tableRows.map((row) =>
          [
            escapeCsv(row.navn),
            escapeCsv(row.sublabel ?? ""),
            escapeCsv(row.aar),
            escapeCsv(row.vaerdi),
            escapeCsv(row.enhed),
            escapeCsv(row.rang ?? ""),
          ].join(",")
        ),
      ];

      const blob = new Blob([lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingCsv(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/76 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">Eksport</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Hent den aktuelle visualisering som billede eller download det viste analyseudsnit som CSV.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadImage}
            disabled={isExportingImage}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-60"
          >
            {isExportingImage ? "Eksporterer billede..." : "Download billede"}
          </button>

          <button
            onClick={downloadCsv}
            disabled={isExportingCsv || tableRows.length === 0}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-60"
          >
            {isExportingCsv ? "Eksporterer CSV..." : "Download data (CSV)"}
          </button>
        </div>
      </div>
    </div>
  );
}
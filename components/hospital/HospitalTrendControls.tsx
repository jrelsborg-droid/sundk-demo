"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DatabaseOption = {
  id: string;
  navn: string;
};

type IndicatorOption = {
  id: string;
  navn: string;
  type?: string;
};

type Props = {
  selectedYear: number;
  availableYears: number[];
  selectedDatabaseId: string | null;
  databases: DatabaseOption[];
  selectedIndicatorId: string | null;
  indicators: IndicatorOption[];
};

export default function HospitalTrendControls({
  selectedYear,
  availableYears,
  selectedDatabaseId,
  databases,
  selectedIndicatorId,
  indicators,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const databaseOptions = useMemo(
    () => [{ id: "", navn: "Alle databaser" }, ...databases],
    [databases]
  );

  const indicatorOptions = useMemo(
    () => [{ id: "", navn: "Vælg indikator" }, ...indicators],
    [indicators]
  );

  function updateParams(next: { aar?: string; database?: string; indikator?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.aar !== undefined) {
      if (next.aar) params.set("aar", next.aar);
      else params.delete("aar");
    }

    if (next.database !== undefined) {
      if (next.database) {
        params.set("database", next.database);
      } else {
        params.delete("database");
      }
      params.delete("indikator");
    }

    if (next.indikator !== undefined) {
      if (next.indikator) params.set("indikator", next.indikator);
      else params.delete("indikator");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          År
        </div>
        <select
          value={String(selectedYear)}
          onChange={(e) => updateParams({ aar: e.target.value })}
          disabled={isPending}
          className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-200"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Database
        </div>
        <select
          value={selectedDatabaseId ?? ""}
          onChange={(e) => updateParams({ database: e.target.value })}
          disabled={isPending}
          className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-200"
        >
          {databaseOptions.map((db) => (
            <option key={db.id || "all"} value={db.id}>
              {db.navn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Indikator
        </div>
        <select
          value={selectedIndicatorId ?? ""}
          onChange={(e) => updateParams({ indikator: e.target.value })}
          disabled={!selectedDatabaseId || isPending}
          className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-200 disabled:bg-slate-50 disabled:text-slate-400"
        >
          {indicatorOptions.map((item) => (
            <option key={item.id || "none"} value={item.id}>
              {item.type ? `${item.navn} · ${item.type}` : item.navn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
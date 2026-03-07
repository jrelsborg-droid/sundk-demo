"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type IndicatorOption = {
  indikator_id: string;
  indikator_navn: string;
};

type DatabaseFiltersProps = {
  indikatorer: IndicatorOption[];
  selectedIndikatorId: string;
  availableYears: number[];
  selectedYear: number;
};

export default function DatabaseFilters({
  indikatorer,
  selectedIndikatorId,
  availableYears,
  selectedYear,
}: DatabaseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: "indikator" | "aar", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    if (key === "indikator" && !params.get("aar")) {
      params.set("aar", String(selectedYear));
    }

    if (key === "aar" && !params.get("indikator")) {
      params.set("indikator", selectedIndikatorId);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <select
        value={selectedIndikatorId}
        onChange={(e) => updateParam("indikator", e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
      >
        {indikatorer.map((ind) => (
          <option key={ind.indikator_id} value={ind.indikator_id}>
            {ind.indikator_navn}
          </option>
        ))}
      </select>

      <select
        value={String(selectedYear)}
        onChange={(e) => updateParam("aar", e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none backdrop-blur"
      >
        {availableYears.map((aar) => (
          <option key={aar} value={aar}>
            {aar}
          </option>
        ))}
      </select>
    </div>
  );
}
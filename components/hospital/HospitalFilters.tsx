"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  availableYears: number[];
  selectedYear: number;
  databases: Array<{ id: string; navn: string }>;
  selectedDatabaseId: string | null;
};

export default function HospitalFilters({
  availableYears,
  selectedYear,
  databases,
  selectedDatabaseId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/70 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-5">
        <div className="text-sm font-medium text-slate-500">Visning</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Vælg år og database
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Filtrene opdaterer siden automatisk og styrer kort, trend, variation og tabeller.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={selectedDatabaseId ?? ""}
          onChange={(e) => updateParam("database", e.target.value)}
          className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
        >
          <option value="">Alle databaser</option>
          {databases.map((db) => (
            <option key={db.id} value={db.id}>
              {db.navn}
            </option>
          ))}
        </select>

        <select
          value={String(selectedYear)}
          onChange={(e) => updateParam("aar", e.target.value)}
          className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type IndicatorOption = {
  id: string;
  navn: string;
  type?: string;
};

type Props = {
  hospitalId: string;
  selectedYear: number;
  selectedDatabaseId: string;
  selectedIndicatorId: string | null;
  indicators: IndicatorOption[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HospitalTrendIndicatorFilter({
  selectedYear,
  selectedDatabaseId,
  selectedIndicatorId,
  indicators,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const selectedOption =
    indicators.find((item) => item.id === selectedIndicatorId) ?? indicators[0] ?? null;

  const filteredIndicators = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return indicators;

    return indicators.filter((item) => {
      const haystack = `${item.navn} ${item.type ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [indicators, search]);

  function handleSelect(indikatorId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("aar", String(selectedYear));
    params.set("database", selectedDatabaseId);
    params.set("indikator", indikatorId);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });

    setOpen(false);
  }

  if (!selectedDatabaseId || !indicators.length) return null;

  return (
    <div className="relative">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Indikator
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left shadow-sm transition",
          "border-slate-200 bg-white/90 hover:bg-white",
          open && "border-sky-200 ring-2 ring-sky-100",
          isPending && "opacity-70"
        )}
      >
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-950">
            {selectedOption?.navn ?? "Vælg indikator"}
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-500">
            {selectedOption?.type || "Trend for valgt database"}
          </div>
        </div>

        <div className="ml-4 shrink-0 text-slate-400">{open ? "▴" : "▾"}</div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[24px] border border-slate-200 bg-white/96 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-slate-100 p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søg indikator"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-200 focus:bg-white"
            />
          </div>

          <div className="max-h-72 overflow-auto p-2">
            {filteredIndicators.length ? (
              filteredIndicators.map((item) => {
                const active = item.id === selectedIndicatorId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors",
                      active ? "bg-sky-50 text-sky-900" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{item.navn}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {item.type || "Indikator"}
                      </div>
                    </div>

                    {active ? (
                      <div className="ml-3 shrink-0 text-xs font-semibold uppercase tracking-wide text-sky-700">
                        Valgt
                      </div>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-slate-500">Ingen indikatorer fundet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AnalysePresetBar({
  databaseId,
  indikatorId,
}: {
  databaseId: string;
  indikatorId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyPreset(updates: Record<string, string | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  }

  const presets = [
    {
      id: "trend",
      label: "Udvikling over tid",
      updates: {
        vis: "tidsserie",
        niveau: "hospital",
        database: databaseId,
        indikator: indikatorId,
      },
    },
    {
      id: "benchmark",
      label: "Benchmark i valgt år",
      updates: {
        vis: "bar",
        niveau: "hospital",
        database: databaseId,
        indikator: indikatorId,
      },
    },
    {
      id: "variation",
      label: "Variation mellem afdelinger",
      updates: {
        vis: "tidsserie",
        niveau: "afdeling",
        database: databaseId,
        indikator: indikatorId,
      },
    },
    {
      id: "table",
      label: "Tabelvisning",
      updates: {
        vis: "tabel",
        database: databaseId,
        indikator: indikatorId,
      },
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-3 text-sm font-medium text-slate-500">Hurtigvalg</div>
      <div className="flex flex-wrap gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.updates)}
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
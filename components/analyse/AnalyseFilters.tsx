"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type VisType = "tidsserie" | "bar" | "tabel";
type Niveau = "national" | "hospital" | "afdeling";

type EntityOption = {
  id: string;
  navn: string;
  sublabel?: string;
};

export default function AnalyseFilters({
  state,
  availableDatabases,
  availableIndicators,
  availableLevels,
  availableEntities,
  availableYears,
  availableVisualizations,
}: {
  state: {
    vis: VisType;
    databaseId: string;
    indikatorId: string;
    niveau: Niveau;
    entityIds: string[];
    fromYear: number;
    toYear: number;
  };
  availableDatabases: Array<{
    database_id: string;
    database_navn: string;
    speciale: string;
  }>;
  availableIndicators: Array<{
    indikator_id: string;
    indikator_navn: string;
    indikator_type: string;
    enhed: string;
    retning: "lavere_bedre" | "hoejere_bedre";
  }>;
  availableLevels: Array<{ id: Niveau; label: string }>;
  availableEntities: EntityOption[];
  availableYears: number[];
  availableVisualizations: Array<{ id: VisType; label: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
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

  function toggleEntity(entityId: string) {
    const current = new Set(state.entityIds);
    if (current.has(entityId)) {
      current.delete(entityId);
    } else {
      current.add(entityId);
    }

    const next = Array.from(current);
    updateParams({
      entities: next.length ? next.join(",") : null,
    });
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/76 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-5">
        <div className="text-sm font-medium text-slate-500">Analysebygger</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Dyk ned i data
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sammensæt din egen visning. Valg gemmes automatisk i URL’en, så analyser kan deles direkte.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Visualisering
          </label>
          <select
            value={state.vis}
            onChange={(e) =>
              updateParams({
                vis: e.target.value,
              })
            }
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {availableVisualizations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Database
          </label>
          <select
            value={state.databaseId}
            onChange={(e) =>
              updateParams({
                database: e.target.value,
                indikator: null,
                entities: null,
              })
            }
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {availableDatabases.map((db) => (
              <option key={db.database_id} value={db.database_id}>
                {db.database_navn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Indikator
          </label>
          <select
            value={state.indikatorId}
            onChange={(e) =>
              updateParams({
                indikator: e.target.value,
                entities: null,
              })
            }
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {availableIndicators.map((i) => (
              <option key={i.indikator_id} value={i.indikator_id}>
                {i.indikator_navn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Niveau
          </label>
          <select
            value={state.niveau}
            onChange={(e) =>
              updateParams({
                niveau: e.target.value,
                entities: null,
              })
            }
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {availableLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fra år
            </label>
            <select
              value={state.fromYear}
              onChange={(e) => updateParams({ from: e.target.value })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Til år
            </label>
            <select
              value={state.toYear}
              onChange={(e) => updateParams({ to: e.target.value })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {state.niveau !== "national" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                {state.niveau === "hospital" ? "Hospitaler" : "Afdelinger"}
              </label>

              <button
                type="button"
                onClick={() => updateParams({ entities: null })}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Nulstil
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
              {availableEntities.map((entity) => {
                const checked = state.entityIds.includes(entity.id);

                return (
                  <label
                    key={entity.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl px-2 py-2 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEntity(entity.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {entity.navn}
                      </div>
                      {entity.sublabel && (
                        <div className="text-xs text-slate-500">{entity.sublabel}</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
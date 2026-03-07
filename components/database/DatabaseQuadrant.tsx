"use client";

import { useMemo, useState } from "react";

type QuadrantRow = {
  id: string;
  navn: string;
  region: string;
  vaerdi: number;
  forbedring: number;
  rang: number;
  enhed: string;
  retning: "lavere_bedre" | "hoejere_bedre";
};

type DatabaseQuadrantProps = {
  rows: QuadrantRow[];
  indikatorNavn: string;
};

function formatUnit(enhed: string) {
  if (enhed === "pct" || enhed === "%") return "%";
  if (enhed === "dage") return " dage";
  if (enhed === "timer") return " timer";
  return "";
}

function formatImprovement(
  value: number,
  enhed: string,
  retning: "lavere_bedre" | "hoejere_bedre"
) {
  if (!Number.isFinite(value)) return "—";
  const absVal = Math.abs(value).toFixed(1);
  if (retning === "lavere_bedre") return `−${absVal}${formatUnit(enhed)}`;
  return `+${absVal}${formatUnit(enhed)}`;
}

function scoreNiveau(
  row: { vaerdi: number; retning: "lavere_bedre" | "hoejere_bedre" },
  min: number,
  max: number
) {
  if (max === min) return 50;
  const raw = ((row.vaerdi - min) / (max - min)) * 100;
  return row.retning === "lavere_bedre" ? 100 - raw : raw;
}

function scoreForbedring(v: number, min: number, max: number) {
  if (max === min) return 50;
  return ((v - min) / (max - min)) * 100;
}

export default function DatabaseQuadrant({
  rows,
  indikatorNavn,
}: DatabaseQuadrantProps) {
  const [hovered, setHovered] = useState<{
    point: QuadrantRow;
    x: number;
    y: number;
  } | null>(null);

  const points = useMemo(() => {
    const valid = rows.filter((r) => Number.isFinite(r.vaerdi) && Number.isFinite(r.forbedring));
    const minVal = valid.length ? Math.min(...valid.map((r) => r.vaerdi)) : 0;
    const maxVal = valid.length ? Math.max(...valid.map((r) => r.vaerdi)) : 0;
    const minImp = valid.length ? Math.min(...valid.map((r) => r.forbedring)) : 0;
    const maxImp = valid.length ? Math.max(...valid.map((r) => r.forbedring)) : 0;

    return valid.map((r) => ({
      ...r,
      x: scoreForbedring(r.forbedring, minImp, maxImp),
      y: scoreNiveau(r, minVal, maxVal),
    }));
  }, [rows]);

  return (
    <div className="relative h-[320px] rounded-[24px] border border-slate-200 bg-white/60 p-4">
      <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-300" />
      <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-slate-300" />

      <div className="absolute left-6 top-6 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700">
        Høj kvalitet
      </div>
      <div className="absolute right-6 top-6 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[12px] font-medium text-sky-700">
        Forbedrer sig
      </div>
      <div className="absolute bottom-6 left-6 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700">
        Under udvikling
      </div>
      <div className="absolute bottom-6 right-6 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700">
        Kræver opmærksomhed
      </div>

      {points.map((p) => (
        <button
          key={p.id}
          onMouseEnter={() => setHovered({ point: p, x: p.x, y: p.y })}
          onMouseLeave={() => setHovered(null)}
          className="absolute h-4 w-4 rounded-full border border-sky-500/60 bg-sky-400/80 shadow-sm transition-transform hover:scale-125"
          style={{
            left: `${p.x}%`,
            bottom: `${p.y}%`,
            transform: "translate(-50%, 50%)",
          }}
          aria-label={p.navn}
        />
      ))}

      {hovered && (
        <div
          className="pointer-events-none absolute z-20 w-[260px] rounded-[24px] border border-slate-200 bg-white/96 px-4 py-3 shadow-2xl backdrop-blur-xl"
          style={{
            left: `${hovered.x}%`,
            bottom: hovered.y > 25 ? `${hovered.y - 8}%` : `${hovered.y + 8}%`,
            transform: "translate(-50%, 50%)",
          }}
        >
          <div className="text-sm font-semibold text-slate-950">{hovered.point.navn}</div>
          <div className="text-xs text-slate-500">{hovered.point.region}</div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Niveau</div>
              <div className="font-medium text-slate-900">
                {hovered.point.vaerdi.toFixed(1)}
                {formatUnit(hovered.point.enhed)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Ændring</div>
              <div className="font-medium text-slate-900">
                {formatImprovement(
                  hovered.point.forbedring,
                  hovered.point.enhed,
                  hovered.point.retning
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            {indikatorNavn}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500">
        Forbedring siden baseline
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
        Nuværende niveau
      </div>
    </div>
  );
}
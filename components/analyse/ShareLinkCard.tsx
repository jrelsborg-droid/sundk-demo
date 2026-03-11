"use client";

import { useState } from "react";

export default function ShareLinkCard({
  shareUrl,
}: {
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      const fullUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${shareUrl}`
          : shareUrl;

      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/76 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">Del analyse</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Linket gemmer database, indikator, niveau, valgte enheder og periode.
          </p>
        </div>

        <button
          onClick={copyLink}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
        >
          {copied ? "Kopieret" : "Kopiér link"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 break-all">
        {shareUrl}
      </div>
    </div>
  );
}
import PageBackground from "@/components/layout/PageBackground";
import TopNav from "@/components/navigation/TopNav";
import { loadHomepageData } from "@/lib/data/loadHomepageData";

export default async function RapporterPage() {
  const data = loadHomepageData();

  return (
    <PageBackground>
      <TopNav
        databases={data.databases}
        hospitals={data.hospitals}
        active="reports"
      />

      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-12 md:px-8 lg:px-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Data og rapporter
        </div>

        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          Årsrapporter
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-7 text-slate-600">
          Her samles årsrapporter og publikationer fra de kliniske kvalitetsdatabaser.
          Rapporterne giver et samlet overblik over kvaliteten i behandlingen
          på tværs af hospitaler og regioner.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="text-sm font-medium text-slate-500">
              Eksempel
            </div>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Årsrapport – Dansk Hjerteinfarktregister
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              National opgørelse af behandling og kvalitet for patienter
              med akut hjerteinfarkt.
            </p>

            <a
              href="#"
              className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Åbn rapport →
            </a>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="text-sm font-medium text-slate-500">
              Eksempel
            </div>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Årsrapport – Dansk Apopleksiregister
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              National rapport om behandling, resultater og variation
              i apopleksibehandling.
            </p>

            <a
              href="#"
              className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Åbn rapport →
            </a>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
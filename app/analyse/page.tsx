import PageBackground from "@/components/layout/PageBackground";
import TopNav from "@/components/navigation/TopNav";
import AnalyseFilters from "@/components/analyse/AnalyseFilters";
import TimeSeriesChart from "@/components/analyse/charts/TimeSeriesChart";
import BarChart from "@/components/analyse/charts/BarChart";
import TableView from "@/components/analyse/charts/TableView";
import { getAnalyseData } from "@/lib/analyse/getAnalyseData";

type PageProps = {
  searchParams?: Promise<{
    vis?: string;
    database?: string;
    indikator?: string;
    niveau?: string;
    entities?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function AnalysePage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = getAnalyseData(resolvedSearchParams);

  const shareUrl = `/analyse?vis=${data.state.vis}&database=${data.state.databaseId}&indikator=${data.state.indikatorId}&niveau=${data.state.niveau}&entities=${data.state.entityIds.join(",")}&from=${data.state.fromYear}&to=${data.state.toYear}`;

  return (
    <PageBackground>
      <TopNav
        databases={data.allDatabases}
        hospitals={data.allHospitals}
        active="analyse"
      />

      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-10 md:px-8 lg:px-10">
        <section className="mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Analysebygger
          </div>
          <h1 className="mt-3 max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
            Dyk ned i data
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">
            Byg dine egne visninger af kvalitetsdata på tværs af databaser, hospitaler og afdelinger.
            Alle valg gemmes i URL’en, så analyser kan deles direkte.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <AnalyseFilters
              state={data.state}
              availableDatabases={data.availableDatabases}
              availableIndicators={data.availableIndicators}
              availableLevels={data.availableLevels}
              availableEntities={data.availableEntities}
              availableYears={data.availableYears}
              availableVisualizations={data.availableVisualizations}
            />

            <div className="mt-5 rounded-[28px] border border-slate-200/80 bg-white/76 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="text-sm font-medium text-slate-500">Del analyse</div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 break-all">
                {shareUrl}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {data.state.vis === "tidsserie" && (
              <TimeSeriesChart
                title={data.chartTitle}
                subtitle={data.chartSubtitle}
                enhed={data.selectedIndikator.enhed}
                series={data.lineSeries}
              />
            )}

            {data.state.vis === "bar" && (
              <BarChart
                title={data.chartTitle}
                subtitle={`${data.chartSubtitle} · ${data.state.toYear}`}
                rows={data.barRows}
              />
            )}

            {data.state.vis === "tabel" && (
              <TableView
                title={data.chartTitle}
                subtitle={data.chartSubtitle}
                rows={data.tableRows}
              />
            )}

            <div className="rounded-[28px] border border-slate-200/80 bg-white/76 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="text-sm font-medium text-slate-500">Aktuel analyse</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                  Database <span className="font-semibold text-slate-950">{data.selectedDatabase.database_navn}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                  Indikator <span className="font-semibold text-slate-950">{data.selectedIndikator.indikator_navn}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                  Niveau <span className="font-semibold text-slate-950">{data.state.niveau}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                  Periode <span className="font-semibold text-slate-950">{data.state.fromYear}–{data.state.toYear}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                  Visualisering <span className="font-semibold text-slate-950">{data.state.vis}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageBackground>
  );
}
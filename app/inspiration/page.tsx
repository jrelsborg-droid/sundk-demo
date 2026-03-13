import Link from "next/link";
import TopNav from "@/components/navigation/TopNav";
import PageBackground from "@/components/layout/PageBackground";
import { loadHomepageData } from "@/lib/data/loadHomepageData";

type CaseItem = {
  id: string;
  tone: "emerald" | "sky" | "amber";
  title: string;
  quote: string;
  shortIntro: string;
  imageSrc: string;
  imageAlt: string;
  situation: string[];
  greb: string[];
  resultater: string[];
  laering: string[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </div>
      ) : null}
      <div className="mt-2 text-[30px] font-semibold tracking-tight text-slate-950">
        {title}
      </div>
      {text ? (
        <div className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{text}</div>
      ) : null}
    </div>
  );
}

function CardEyebrow({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "amber" | "sky" | "rose" | "emerald" | "slate";
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {children}
    </div>
  );
}

function GlassCard({
  className,
  children,
  accent = "slate",
}: {
  className?: string;
  children: React.ReactNode;
  accent?: "amber" | "sky" | "rose" | "emerald" | "slate";
}) {
  const accentBar = {
    amber: "before:bg-amber-300/80",
    sky: "before:bg-sky-300/80",
    rose: "before:bg-rose-300/80",
    emerald: "before:bg-emerald-300/80",
    slate: "before:bg-slate-300/80",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/76 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl before:absolute before:left-0 before:right-0 before:top-0 before:h-[3px]",
        accentBar[accent],
        className
      )}
    >
      {children}
    </div>
  );
}

const CASES: CaseItem[] = [
  {
    id: "komplikationer",
    tone: "emerald",
    title: "Hurtigere opfølgning på komplikationer",
    quote:
      "Vi begyndte at bruge data mere aktivt på vores tavlemøder — og det ændrede faktisk, hvad vi talte om.",
    shortIntro:
      "En kirurgisk afdeling ønskede tidligere overblik over komplikationer og en mere fælles måde at reagere på, når udviklingen begyndte at gå i den forkerte retning.",
    imageSrc: "/cases/komplikationer.png",
    imageAlt: "Klinikere i samtale om kvalitetsdata",
    situation: [
      "Afdelingen havde adgang til kvalitetsdata, men de blev primært brugt bagudskuende og i forbindelse med rapportering.",
      "Ledere og klinikere oplevede, at der gik for lang tid fra et mønster opstod, til det blev genstand for fælles opmærksomhed.",
      "Samtalerne på tavlemøder var ofte præget af enkeltsager frem for et samlet billede af udviklingen.",
    ],
    greb: [
      "Afdelingen udvalgte få indikatorer, som blev vist i en enkel ugentlig visning med niveau, udvikling og sammenligning med egen baseline.",
      "Komplikationer blev ikke kun vist som samlet tal, men også fordelt på relevante patientgrupper og forløbstyper.",
      "Visningen blev gjort fast til punkt på tavlemødet, så data blev en del af driften og ikke kun noget, man kiggede på en gang imellem.",
    ],
    resultater: [
      "Afdelingen fik hurtigere øje på udsving, som ellers ville være druknet i den løbende kliniske drift.",
      "Dialogen blev mere konkret: Hvor ser vi bevægelse? Hvad ved vi allerede? Hvad skal undersøges nærmere?",
      "Der opstod større fælles ejerskab, fordi både ledelse og medarbejdere kiggede på samme billede og kunne handle på det samme grundlag.",
    ],
    laering: [
      "Start med få indikatorer, der opleves som klinisk meningsfulde.",
      "Kobl altid data til en fast arbejdsgang, fx tavlemøder eller driftsmøder.",
      "Brug data til at stille bedre spørgsmål først — ikke til at levere alle svar på én gang.",
    ],
  },
  {
    id: "genindlaeggelser",
    tone: "sky",
    title: "Bedre overblik over genindlæggelser",
    quote: "Det blev nemmere at se, hvor vi skulle sætte ind.",
    shortIntro:
      "En medicinsk afdeling havde brug for et mere sammenhængende billede af genindlæggelser på tværs af patientforløb, enheder og ledelsesniveauer.",
    imageSrc: "/cases/genindlaeggelser.png",
    imageAlt: "Læger ser på skærm med kurver og nøgletal",
    situation: [
      "Genindlæggelser blev fulgt flere steder, men tallene blev oplevet forskelligt afhængigt af, om man sad i klinikken, i kvalitetsfunktionen eller i ledelsen.",
      "Det gjorde det svært at afgøre, hvor der var tale om almindelig variation, og hvor der faktisk burde reageres.",
      "Afdelingen ønskede ét fælles overblik, som både kunne bruges til refleksion i hverdagen og til prioritering i ledelsen.",
    ],
    greb: [
      "Der blev lavet en samlet visning, hvor genindlæggelser kunne ses over tid, sammenholdes med patientvolumen og brydes ned på relevante delgrupper.",
      "Afdelingen koblede udviklingen til konkrete forløbstyper, så samtalen ikke kun handlede om procenttal, men om hvor i patientrejsen presset opstod.",
      "Visningen blev brugt både i ledelsesmæssige opfølgningsmøder og i faglige fora, så der opstod en fælles forståelse af prioriteringerne.",
    ],
    resultater: [
      "Det blev lettere at se, om en stigning skulle tolkes som et reelt signal eller som et udsving i et lille datagrundlag.",
      "Klinikere og ledelse fik et mere fælles sprog for, hvor indsatsen skulle sættes ind først.",
      "Afdelingen kunne hurtigere pege på områder, hvor det gav mening at gå tættere på arbejdsgange, udskrivelse eller opfølgning.",
    ],
    laering: [
      "Når flere grupper skal handle på de samme data, skal de også se de samme data.",
      "Vis både niveau og kontekst — især volumen og udvikling over tid.",
      "Et godt overblik reducerer ikke kompleksitet væk, men gør den håndterbar.",
    ],
  },
  {
    id: "kvalitetsdata",
    tone: "amber",
    title: "Kvalitetsdata tættere på hverdagen",
    quote: "Når data er lette at forstå, bliver de også lettere at handle på.",
    shortIntro:
      "En klinisk enhed ønskede at gøre kvalitetsdata mere nærværende i hverdagen, så flere medarbejdere kunne bruge dem uden at være specialister i rapportering eller analyse.",
    imageSrc: "/cases/kvalitetsdata.png",
    imageAlt: "Kliniker portræt med fokus på nærhed og daglig anvendelse",
    situation: [
      "Mange medarbejdere oplevede kvalitetsdata som noget, der fandtes i rapporter og præsentationer, men ikke som et aktivt arbejdsredskab i hverdagen.",
      "Selv relevante tal blev ofte kun set af få personer, og derfor blev potentialet for lokal handling ikke fuldt ud udnyttet.",
      "Enheden ville have data tættere på drift, læring og dialog i teamet.",
    ],
    greb: [
      "Data blev omsat til enkle, faste visninger med få begreber, tydelige farver og korte forklaringer.",
      "I stedet for at vise alt på én gang blev der fokuseret på det, medarbejderne faktisk kunne påvirke i den daglige praksis.",
      "Visningerne blev brugt som samtalestartere i teammøder og faglige refleksioner frem for som kontrolværktøj.",
    ],
    resultater: [
      "Flere medarbejdere begyndte at engagere sig i tallene, fordi de kunne forstå dem uden ekstra oversættelse.",
      "Data blev i højere grad brugt til at opdage mønstre, dele erfaringer og aftale små forbedringstiltag.",
      "Enheden kom tættere på en kultur, hvor kvalitetsdata understøtter praksis i stedet for at leve ved siden af den.",
    ],
    laering: [
      "Tilgængelighed er ikke kun et spørgsmål om adgang, men om forståelighed.",
      "Små, stabile visninger er ofte mere virkningsfulde end store rapportpakker.",
      "Når data opleves som relevante i hverdagen, øges chancen for reel handling.",
    ],
  },
];

function BulletList({
  items,
  dotClassName,
}: {
  items: string[];
  dotClassName: string;
}) {
  return (
    <ul className="space-y-4 text-[15px] leading-8 text-slate-700">
      {items.map((line) => (
        <li key={line} className="flex gap-3">
          <span className={cn("mt-[14px] h-1.5 w-1.5 shrink-0 rounded-full", dotClassName)} />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function CaseSection({ item }: { item: CaseItem }) {
  return (
    <section id={item.id} className="scroll-mt-28">
      <GlassCard accent={item.tone}>
        <div className="overflow-hidden">
          <div className="relative h-[220px] sm:h-[280px] lg:h-[360px]">
            <img
              src={item.imageSrc}
              alt={item.imageAlt}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
          </div>

          <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <CardEyebrow tone={item.tone}>Case</CardEyebrow>

            <h2 className="mt-5 text-[34px] font-semibold tracking-tight text-slate-950 sm:text-[42px]">
              {item.title}
            </h2>

            <p className="mt-6 text-[24px] italic leading-10 text-slate-700">
              “{item.quote}”
            </p>

            <p className="mt-6 text-[17px] leading-9 text-slate-600">{item.shortIntro}</p>

            <div className="mt-10 space-y-10">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Situation
                </h3>
                <div className="mt-4">
                  <BulletList items={item.situation} dotClassName="bg-slate-300" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Hvad afdelingen gjorde
                </h3>
                <div className="mt-4">
                  <BulletList items={item.greb} dotClassName="bg-sky-300" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Hvad det gav
                </h3>
                <div className="mt-4">
                  <BulletList items={item.resultater} dotClassName="bg-emerald-300" />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6 sm:p-7">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Hvad man kan tage med
                </h3>
                <div className="mt-4">
                  <BulletList items={item.laering} dotClassName="bg-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export default async function InspirationPage() {
  const data = await loadHomepageData();

  return (
    <PageBackground>
      <div className="mx-auto max-w-6xl px-5 pb-24">
        <TopNav databases={data.databases} hospitals={data.hospitals} active="reports" />

        <section className="pt-8">
          <SectionIntro
            eyebrow="Inspiration"
            title="Hvordan data bliver til handling i klinikken"
            text="Tre korte eksempler på, hvordan kvalitetsdata kan bruges mere aktivt i praksis. Casene er skrevet som realistiske illustrationscases og viser, hvordan enkle visninger kan skabe bedre dialog, hurtigere opfølgning og mere målrettede forbedringstiltag."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {CASES.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-white"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-10">
          {CASES.map((item) => (
            <CaseSection key={item.id} item={item} />
          ))}
        </div>
      </div>
    </PageBackground>
  );
}
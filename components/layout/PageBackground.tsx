import type { ReactNode } from "react";

export default function PageBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-slate-50/80 text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.85),transparent_30%),radial-gradient(circle_at_top_right,rgba(224,231,255,0.85),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#f5f8fc_45%,#f4f6fb_100%)]" />

        <div className="absolute right-[-80px] top-[-10px] h-[560px] w-[760px] opacity-[0.22]">
          <div
            className="absolute inset-0 bg-contain bg-no-repeat bg-right-top"
            style={{ backgroundImage: "url('/bg-analyst.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-50/35 to-slate-50/95" />
          <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black_38%,transparent_85%)] bg-white/30" />
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </main>
  );
}
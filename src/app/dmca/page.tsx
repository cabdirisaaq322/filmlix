import { Metadata } from 'next';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'DMCA Policy for FilmFlix.',
};

export default function DMCA() {
  return (
    <div className="nf-row-pad w-full max-w-4xl py-10 pt-28 md:pt-32">
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]"><Scale className="h-3.5 w-3.5" /> Legal</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">DMCA Policy</h1>
        <p className="text-zinc-400">Last updated: 2026</p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Copyright Notice</h2>
          <p>FilmFlix respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA). We do not host any media files on our servers. All content is provided by third-party sources.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Takedown Requests</h2>
          <p className="mb-3">If you believe that content on FilmFlix infringes your copyright, please submit a DMCA takedown notice with:</p>
          <ul className="list-disc space-y-1 pl-5 text-zinc-400">
            <li>Your physical or electronic signature</li>
            <li>Identification of the copyrighted work</li>
            <li>Identification of the infringing material and its location</li>
            <li>Your contact information</li>
            <li>A good-faith belief statement</li>
            <li>An accuracy statement under penalty of perjury</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Counter-Notice</h2>
          <p>If you believe your content was removed in error, you may file a counter-notice with the same contact information.</p>
        </section>
      </div>
    </div>
  );
}

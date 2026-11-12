import { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FilmFlix.',
};

export default function Privacy() {
  return (
    <div className="nf-row-pad w-full max-w-4xl py-10 pt-28 md:pt-32">
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]"><Shield className="h-3.5 w-3.5" /> Privacy</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Privacy Policy</h1>
        <p className="text-zinc-400">Last updated: 2026</p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Data Collection</h2>
          <p>FilmFlix does not collect personal information directly. We use third-party APIs (TMDB) for metadata and third-party video embeds for streaming. These services may collect data subject to their own privacy policies.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Cookies</h2>
          <p>We may use essential cookies for site functionality and analytics tools that do not personally identify you.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Third-Party Links</h2>
          <p>Our site contains links to third-party websites. We are not responsible for the privacy practices or content of these sites.</p>
        </section>
      </div>
    </div>
  );
}

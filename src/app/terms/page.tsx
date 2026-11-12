import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FilmFlix.',
};

export default function Terms() {
  return (
    <div className="nf-row-pad w-full max-w-4xl py-10 pt-28 md:pt-32">
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]"><FileText className="h-3.5 w-3.5" /> Terms</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Terms of Service</h1>
        <p className="text-zinc-400">Last updated: 2026</p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Acceptance of Terms</h2>
          <p>By accessing FilmFlix, you agree to these Terms of Service. If you do not agree, please do not use this site.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Use of Service</h2>
          <p className="mb-2">FilmFlix provides access to third-party streaming content. You agree to use this service only for lawful purposes and in accordance with applicable laws and regulations.</p>
          <p>Streaming copyrighted content may be illegal in your jurisdiction. Please check your local laws.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Disclaimer</h2>
          <p>FilmFlix does not host any media files on its servers. All content is provided by third-party sources. We make no warranties about availability or quality of streams.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Limitation of Liability</h2>
          <p>We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of this service.</p>
        </section>
      </div>
    </div>
  );
}

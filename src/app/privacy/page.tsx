import { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for FilmFlix. Information about data collection and usage.',
};

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <header className="flex items-center gap-4 mb-8">
          <Shield className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-slate-400">Last updated: 2026</p>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Data Collection</h2>
            <p className="text-slate-300 leading-relaxed">
              FilmFlix does not collect personal information. We use third-party APIs (TMDB) for metadata and third-party video embeds (VidSrc) for streaming.
              These services may collect their own data subject to their respective privacy policies.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Cookies</h2>
            <p className="text-slate-300 leading-relaxed">
              We may use essential cookies for site functionality and analytics tools that don't personally identify you.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Links</h2>
            <p className="text-slate-300 leading-relaxed">
              Our site contains links to third-party websites. We are not responsible for the privacy practices or content of these sites.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
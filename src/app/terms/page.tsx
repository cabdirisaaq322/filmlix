import { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for FilmFlix. Usage terms and conditions.',
};

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <header className="flex items-center gap-4 mb-8">
          <FileText className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-slate-400">Last updated: 2026</p>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing FilmFlix, you agree to these Terms of Service. If you do not agree, please do not use this site.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Use of Service</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              FilmFlix provides access to third-party streaming content. You agree to use this service only for lawful purposes and in accordance with applicable laws and regulations.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Streaming copyrighted content may be illegal in your jurisdiction. Please check your local laws.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed">
              FilmFlix does not host any media files on its servers. All content is provided by third-party sources. We make no warranties about the availability or quality of streams.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of this service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
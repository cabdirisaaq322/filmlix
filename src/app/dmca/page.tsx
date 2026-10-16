import { Metadata } from 'next';
import { Scale, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'DMCA Policy for FilmFlix. Information about copyright and takedown requests.',
};

export default function DMCA() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <header className="flex items-center gap-4 mb-8">
          <Scale className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">DMCA Policy</h1>
            <p className="text-slate-400">Last updated: 2026</p>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Copyright Notice</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              FilmFlix respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA).
              We do not host any media files on our servers. All content is provided by third-party sources.
            </p>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Takedown Requests</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you believe that content on FilmFlix infringes your copyright, please submit a DMCA takedown notice to our designated agent with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Your physical or electronic signature</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing and where it is located</li>
              <li>Your contact information (address, telephone number, and email)</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner</li>
              <li>A statement that the information in the notice is accurate and under penalty of perjury</li>
            </ul>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Counter-Notice</h2>
            <p className="text-slate-300 leading-relaxed">
              If you believe your content was removed in error, you may file a counter-notice with the same contact information above.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
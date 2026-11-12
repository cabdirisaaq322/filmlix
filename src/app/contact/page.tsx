import { Metadata } from 'next';
import { Mail, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact FilmFlix support.',
};

export default function Contact() {
  return (
    <div className="nf-row-pad w-full max-w-4xl py-10 pt-28 md:pt-32">
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]"><Mail className="h-3.5 w-3.5" /> Contact</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Contact Us</h1>
        <p className="text-zinc-400">Get in touch with the FilmFlix team.</p>
      </header>

      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Contact Information</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#e5e5e5]"><Send className="h-4 w-4" /></span>
              <div>
                <p className="font-medium text-white">Telegram</p>
                <a href="https://t.me/deidrasom3" target="_blank" rel="noopener noreferrer" className="text-[#e50914] hover:text-[#e5e5e5]">@deidrasom3</a>
              </div>
            </div>
            <div>
              <p className="font-medium text-white">DMCA Requests</p>
              <p className="text-zinc-400">Please use our DMCA page for copyright-related inquiries.</p>
            </div>
            <div>
              <p className="font-medium text-white">General Inquiries</p>
              <p className="text-zinc-400">Reach out through our official channels above.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-2 text-lg font-semibold text-white">Response Time</h2>
          <p className="text-sm leading-relaxed text-zinc-400">We aim to respond to all legitimate inquiries as quickly as possible. DMCA requests are processed in accordance with applicable laws.</p>
        </section>
      </div>
    </div>
  );
}

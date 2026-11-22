import { Metadata } from 'next';
import { Mail, Send, ShieldAlert, Clock, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Support — FilmFlix',
  description: 'Get in touch with the FilmFlix support team.',
};

export default function Contact() {
  return (
    <div className="nf-row-pad w-full max-w-4xl py-10 pt-24 pb-20 md:pt-28">
      <header className="mb-10 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 backdrop-blur-md">
            <Mail className="h-3.5 w-3.5 text-red-400" /> Support Desk
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          Contact Us
        </h1>
        <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
          Have a question, feedback, or need assistance? Reach out to our community operations team.
        </p>
      </header>

      <div className="space-y-6">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[#e50914]" />
            Official Communication Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telegram Channel Card */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-sky-500/20 bg-sky-500/[0.05] p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <Send className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Direct Telegram Channel</p>
                <p className="text-xs text-slate-400">Join our community for updates and direct support.</p>
                <a
                  href="https://t.me/filmflixoffi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nf-focus inline-block pt-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  @filmflixoffi →
                </a>
              </div>
            </div>

            {/* DMCA Inquiry Card */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Copyright & DMCA</p>
                <p className="text-xs text-slate-400">Notice and takedown procedure inquiries.</p>
                <a
                  href="/dmca"
                  className="nf-focus inline-block pt-1 text-xs font-bold text-[#e50914] hover:text-[#ff3b47] transition-colors"
                >
                  Visit DMCA Portal →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400">
              <Clock className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Turnaround Time</h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Our support team reviews queries regularly. DMCA requests are handled in full compliance with international copyright statutes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

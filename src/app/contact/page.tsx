import { Metadata } from 'next';
import { Mail, MessageCircle, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact FilmFlix. Get in touch with our support team.',
};

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <header className="flex items-center gap-4 mb-8">
          <Mail className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Contact Us</h1>
            <p className="text-slate-400">Get in touch with us</p>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-slate-300 font-medium">Telegram</p>
                  <a
                    href="https://t.me/deidrasom1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    @deidrasom1
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-slate-300 font-medium">DMCA Requests</p>
                  <p className="text-slate-400 text-sm">Please use our DMCA page for copyright-related inquiries.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-slate-300 font-medium">General Inquiries</p>
                  <p className="text-slate-400 text-sm">For general questions, please reach out through our official channels.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Response Time</h2>
            <p className="text-slate-300 leading-relaxed">
              We aim to respond to all legitimate inquiries as quickly as possible. Please note that DMCA requests will be processed in accordance with applicable laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
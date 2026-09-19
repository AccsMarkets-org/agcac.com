import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import MobileBottomBar from './MobileBottomBar';

interface TocItem { id: string; title: string }

interface Props {
  title: string;
  lastUpdated: string;
  version?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, version = '1.0', toc, children }: Props) {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-navy-950 to-gray-900 py-12 text-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/80">{title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="bg-white/10 px-3 py-1 rounded-full text-white/70">Last updated: {lastUpdated}</span>
              <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">Version {version}</span>
            </div>
            <p className="mt-3 text-xs text-white/40 italic max-w-2xl">
              Note: These pages are business templates and should be reviewed by a qualified UAE legal/privacy advisor before final publication.
            </p>
          </div>
        </section>

        {/* Content area */}
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex gap-10">
            {/* TOC sidebar — desktop only */}
            {toc && toc.length > 0 && (
              <aside className="hidden lg:block w-60 shrink-0">
                <div className="sticky top-28">
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contents</h2>
                    <nav className="space-y-1">
                      {toc.map(item => (
                        <a key={item.id} href={`#${item.id}`}
                          className="block text-sm text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all py-0.5 truncate">
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">Questions?</p>
                    <p className="text-xs text-red-700 mb-2">Contact us about your data or service enquiry</p>
                    <a href="mailto:info@alghawasac.com" className="text-xs text-red-600 hover:text-red-700 font-medium underline">
                      info@alghawasac.com
                    </a>
                    <br />
                    <a href="tel:+971506725808" className="text-xs text-red-600 hover:text-red-700 font-medium">
                      +971-50-672-5808
                    </a>
                  </div>
                </div>
              </aside>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-xl prose-h3:text-base prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-red-600 max-w-none">
                {children}
              </div>

              {/* Contact card */}
              <div className="mt-12 bg-gradient-to-r from-navy-950 to-gray-900 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-1">Contact Al Ghawas A/C</h3>
                <p className="text-white/60 text-sm mb-4">For any questions about this policy or your data rights</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-white/40 text-xs mb-0.5">Email</div>
                    <a href="mailto:info@alghawasac.com" className="text-amber-400 hover:text-amber-300 font-medium">info@alghawasac.com</a>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-0.5">Phone / WhatsApp</div>
                    <a href="tel:+971506725808" className="text-amber-400 hover:text-amber-300 font-medium">+971-50-672-5808</a>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-0.5">Address</div>
                    <span className="text-white/70">Building 238, MBZ City, Abu Dhabi, UAE</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="mailto:info@alghawasac.com"
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    Contact Us About Your Data
                  </a>
                  <Link href="/data-request"
                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    Submit Data Request →
                  </Link>
                </div>
              </div>

              {/* Legal footer links */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
                {[
                  { href: '/privacy-policy', label: 'Privacy Policy' },
                  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
                  { href: '/cookie-policy', label: 'Cookie Policy' },
                  { href: '/data-request', label: 'Data Request' },
                  { href: '/refund-cancellation-policy', label: 'Refund & Cancellation' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="hover:text-red-600 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}

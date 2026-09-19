import Link from 'next/link';
import LogoImage from './LogoImage';
import { Phone, Mail, MapPin, MessageCircle, ExternalLink } from 'lucide-react';

const servicesCol1 = [
  { label: 'AC Installation', href: '/services/ac-installation' },
  { label: 'AC Maintenance', href: '/services/ac-maintenance' },
  { label: 'AC Repair', href: '/services/ac-repair' },
  { label: 'Duct Fabrication', href: '/services/duct-fabrication' },
  { label: 'Ventilation Works', href: '/services/ventilation' },
  { label: 'Refrigeration', href: '/services/refrigeration' },
];

const servicesCol2 = [
  { label: 'VRF Systems', href: '/services/vrf-systems' },
  { label: 'Chilled Water', href: '/services/chilled-water' },
  { label: 'Plumbing Works', href: '/services/plumbing' },
  { label: 'AMC Contracts', href: '/services/amc' },
  { label: 'Cold Store Services', href: '/services/refrigeration' },
  { label: 'HVAC Consultancy', href: '/services' },
];

const quickLinks = [
  { label: 'Free Quote', href: '/quote' },
  { label: 'BTU Calculator', href: '/btu-calculator' },
  { label: 'AMC Plans', href: '/services/amc' },
  { label: 'Emergency Repair', href: '/emergency' },
  { label: 'Careers', href: '/careers' },
  { label: 'Company Profile', href: '/company-profile' },
  { label: 'Certificates', href: '/certificates' },
  { label: 'Quality & Safety', href: '/quality-safety' },
  { label: 'Our Projects', href: '/projects' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Refund Policy', href: '/refund-cancellation-policy' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* ── Column 1: Brand ── */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            {/* AGC Logo */}
            <Link href="/" className="inline-block mb-5 w-fit">
              <LogoImage size="lg" />
            </Link>

            <p className="text-white/55 text-sm leading-relaxed mb-5">
              Trusted HVAC &amp; refrigeration contracting in Abu Dhabi since 2005. Residential, commercial &amp; industrial.
            </p>

            <div className="flex gap-3 mb-5">
              <a href="https://wa.me/971506725808" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="tel:+971506725808"
                className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors" aria-label="Phone">
                <Phone className="w-4 h-4" />
              </a>
              <a href="mailto:info@alghawasac.com"
                className="w-9 h-9 rounded-lg bg-navy-700 hover:bg-navy-600 flex items-center justify-center transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="text-white/30 text-xs space-y-0.5">
              <div>Est. 2005 · Abu Dhabi, UAE</div>
              <div>Mechanical Contractor License</div>
            </div>
          </div>

          {/* ── Column 2: Our Services ── */}
          <div>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">Our Services</h3>
            <ul className="space-y-2">
              {servicesCol1.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="text-white/25 group-hover:text-amber-400 transition-colors">›</span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: More Services ── */}
          <div>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">More Services</h3>
            <ul className="space-y-2">
              {servicesCol2.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="text-white/25 group-hover:text-amber-400 transition-colors">›</span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Quick Links ── */}
          <div>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="text-white/25 group-hover:text-amber-400 transition-colors">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 5: Contact ── */}
          <div>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-white/60 text-sm leading-relaxed">
                  Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="tel:+971506725808" className="text-white/60 hover:text-white text-sm transition-colors">
                  +971-50-672-5808
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <a href="https://wa.me/971506725808" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors">
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="mailto:info@alghawasac.com" className="text-white/60 hover:text-white text-sm transition-colors">
                  info@alghawasac.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="https://www.alghawasac.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors">
                  www.alghawasac.com
                </a>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-red-600/10 border border-red-500/25">
              <p className="text-red-400 font-semibold text-xs mb-1.5">🚨 Emergency HVAC Support</p>
              <a href="tel:+971506725808" className="text-white font-bold text-base block">+971-50-672-5808</a>
              <p className="text-white/40 text-[11px] mt-1">Available for urgent AC breakdowns</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Al Ghawas A/C Refrigeration Contracting LLC. All rights reserved. Abu Dhabi, UAE.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/35 hover:text-white/70 text-xs transition-colors">
                {l.label}
              </Link>
            ))}
            <span className="text-white/20 text-xs hidden sm:inline">|</span>
            <span className="text-white/35 text-xs">Est. 2005</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

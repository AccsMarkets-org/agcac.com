'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LogoImage from './LogoImage';
import { usePathname } from 'next/navigation';
import { Phone, Menu, X, ChevronDown, MessageCircle, Zap, Home, Info, Wrench, FolderOpen, ClipboardList, Calculator, AlertTriangle, Mail, Briefcase } from 'lucide-react';

const PHONE = '+971-50-672-5808';
const WA_URL = 'https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service%20in%20Abu%20Dhabi.';

const servicesMenu = [
  { label: 'AC Installation', href: '/services/ac-installation', desc: 'New split, ducted & central AC' },
  { label: 'AC Repair', href: '/services/ac-repair', desc: 'Fast diagnosis & repair' },
  { label: 'AC Maintenance', href: '/services/ac-maintenance', desc: 'Regular servicing & tune-up' },
  { label: 'Duct Fabrication', href: '/services/duct-fabrication', desc: 'Custom GI ductwork & installation' },
  { label: 'VRF Systems', href: '/services/vrf-systems', desc: 'Multi-zone VRF design & install' },
  { label: 'Chilled Water', href: '/services/chilled-water', desc: 'Chiller, piping & AHU works' },
  { label: 'Refrigeration', href: '/services/refrigeration', desc: 'Cold stores & refrigeration units' },
  { label: 'Plumbing', href: '/services/plumbing', desc: 'Full plumbing works & repairs' },
  { label: 'Ventilation', href: '/services/ventilation', desc: 'Fresh air, exhaust & IAQ systems' },
  { label: 'AMC Contracts', href: '/services/amc', desc: 'Annual maintenance agreements' },
];

const projectsMenu = [
  { label: 'Commercial Buildings', href: '/projects/commercial-buildings' },
  { label: 'Private Villas', href: '/projects/private-villas' },
  { label: 'VRF Projects', href: '/projects/vrf-systems' },
  { label: 'Chiller Projects', href: '/projects/chiller-installation' },
  { label: 'Ducting Projects', href: '/projects/ducting' },
  { label: 'Maintenance Projects', href: '/projects/maintenance' },
  { label: 'Hotels / Schools / Factories', href: '/projects/hotels-schools-factories' },
  { label: 'Government Projects', href: '/projects/government-buildings' },
];

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  lgHidden?: boolean;
  children?: { label: string; href: string; desc?: string }[];
}

const companyMenu = [
  { label: 'About Us', href: '/about', desc: 'Our story, team & values' },
  { label: 'Company Profile', href: '/company-profile', desc: 'Full company overview & services' },
  { label: 'Licenses & Certifications', href: '/certificates', desc: 'DED, ADM & safety approvals' },
  { label: 'Quality & Safety', href: '/quality-safety', desc: 'Our QA process & safety standards' },
];

const mainNav: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home className="w-3.5 h-3.5" /> },
  { label: 'Company', href: '/about', icon: <Info className="w-3.5 h-3.5" />, children: companyMenu },
  { label: 'Services', href: '/services', icon: <Wrench className="w-3.5 h-3.5" />, children: servicesMenu },
  { label: 'Projects', href: '/projects', icon: <FolderOpen className="w-3.5 h-3.5" />, children: projectsMenu },
  { label: 'AMC Plans', href: '/services/amc', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { label: 'BTU Calc', href: '/btu-calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
  { label: 'Careers', href: '/careers', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { label: 'Emergency', href: '/emergency', icon: <Zap className="w-3.5 h-3.5" />, highlight: true },
  { label: 'Contact', href: '/contact', icon: <Mail className="w-3.5 h-3.5" />, lgHidden: true },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileDropdown(null);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.10)]' : 'border-b border-gray-200'
      }`}
    >
      {/* Top info bar */}
      <div className="hidden lg:block bg-navy-900 text-white/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <span>📍 Building No.238 — Mohamed Bin Zayed City, Abu Dhabi, UAE</span>
          <div className="flex items-center gap-6">
            <a href={`tel:${PHONE}`} className="hover:text-white flex items-center gap-1 transition-colors">
              <Phone className="w-3 h-3" /> {PHONE}
            </a>
            <a href="mailto:info@alghawasac.com" className="hover:text-white transition-colors">
              info@alghawasac.com
            </a>
            <span className="text-white/50">Mon–Sat 7AM–8PM</span>
          </div>
        </div>
      </div>

      {/* Main header bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <LogoImage size="sm" />
            <div className="hidden sm:flex flex-col">
              <span className="text-navy-900 font-bold text-[15px] leading-tight">Al Ghawas A/C</span>
              <span className="text-amber-500 text-[11px] font-semibold leading-tight">Refrigeration Contracting</span>
            </div>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden lg:flex items-center gap-0 xl:gap-0.5 flex-nowrap">
            {mainNav.map((item) =>
              item.children ? (
                /* Dropdown item */
                <div key={item.href} className={`relative group${item.lgHidden ? ' hidden xl:block' : ''}`}>
                  <Link
                    href={item.href}
                    className={`whitespace-nowrap flex items-center gap-1 px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-[12px] xl:text-[13.5px] font-medium transition-colors select-none ${
                      isActive(item.href)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-gray-400 group-hover:text-red-500 group-hover:rotate-180 transition-transform duration-150" />
                  </Link>

                  {/* Dropdown panel */}
                  <div className="absolute top-[calc(100%+4px)] left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                    <Link
                      href={item.href}
                      className="flex items-center justify-between mx-2 px-3 py-2 rounded-xl text-[13px] font-bold text-navy-900 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      <span>View All {item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400" />
                    </Link>
                    <div className="h-px bg-gray-100 mx-3 my-1" />
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block mx-2 px-3 py-2 rounded-xl transition-colors ${
                          pathname === child.href
                            ? 'text-red-600 bg-red-50 font-semibold'
                            : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-[13px] font-medium">{child.label}</div>
                        {'desc' in child && child.desc && (
                          <div className="text-[11px] text-gray-400 mt-0.5">{child.desc}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                /* Regular link */
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-[12px] xl:text-[13.5px] font-medium transition-colors${item.lgHidden ? ' hidden xl:inline-flex' : ''} ${
                    item.highlight
                      ? isActive(item.href)
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'text-red-600 font-semibold hover:bg-red-50'
                      : isActive(item.href)
                      ? 'text-red-600 bg-red-50 font-semibold'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <a
              href={`tel:${PHONE}`}
              className="hidden xl:flex items-center gap-1.5 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              {PHONE}
            </a>
            <a
              href={`tel:${PHONE}`}
              className="xl:hidden flex items-center gap-1.5 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-[13px] font-semibold transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <Link
              href="/quote"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Free Quote
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[calc(100vh-76px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {mainNav.map((item) =>
              item.children ? (
                <div key={item.href}>
                  <button
                    onClick={() =>
                      setMobileDropdown(mobileDropdown === item.label ? null : item.label)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'text-red-600 bg-red-50' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        mobileDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileDropdown === item.label && (
                    <div className="ml-4 pl-4 border-l-2 border-red-100 my-1 space-y-0.5">
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-sm font-bold text-navy-900 hover:text-red-600 transition-colors"
                      >
                        View All {item.label}
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 text-sm transition-colors rounded-lg ${
                            pathname === child.href
                              ? 'text-red-600 font-semibold bg-red-50'
                              : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    item.highlight
                      ? 'text-red-600 font-semibold'
                      : isActive(item.href)
                      ? 'text-red-600 bg-red-50 font-semibold'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.highlight && <Zap className="w-3.5 h-3.5 ml-auto" />}
                </Link>
              )
            )}

            {/* Mobile CTA row */}
            <div className="flex gap-2 pt-3 pb-2 border-t border-gray-100 mt-2">
              <a
                href={`tel:${PHONE}`}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-800 py-3 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <Link
                href="/quote"
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
              >
                Free Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

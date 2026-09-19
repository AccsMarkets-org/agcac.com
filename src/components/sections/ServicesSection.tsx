'use client';
import { MessageCircle, FileText } from 'lucide-react';
import { fireWhatsAppClick } from '@/lib/tracking';

const WA_BASE = 'https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20';

function Icon3D({ id, from, to, shadow, children }: {
  id: string; from: string; to: string; shadow: string; children: React.ReactNode;
}) {
  return (
    <div style={{ width: 64, height: 64, flexShrink: 0, filter: `drop-shadow(0 5px 8px ${shadow}99)` }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`gi${id}`} x1="0" y1="0" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor={from}/>
            <stop offset="1" stopColor={to}/>
          </linearGradient>
          <linearGradient id={`gh${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <rect x="6" y="7" width="52" height="52" rx="15" fill={`url(#gi${id})`}/>
        <rect x="6" y="7" width="52" height="26" rx="15" fill={`url(#gh${id})`}/>
        {children}
      </svg>
    </div>
  );
}

const services = [
  {
    id: 'ac1',
    title: 'AC Installation',
    desc: 'Professional installation of split, ducted, and package AC units for villas, offices, buildings, and industrial facilities.',
    from: '#60a5fa', to: '#1d4ed8', shadow: '#1e40af',
    border: 'border-blue-200',
    bg: 'from-blue-50 to-blue-100/50',
    service: 'AC Installation',
    icon: (
      <Icon3D id="ac1" from="#60a5fa" to="#1d4ed8" shadow="#1e40af">
        <rect x="15" y="21" width="34" height="17" rx="3.5" fill="white" opacity="0.95"/>
        <rect x="15" y="21" width="34" height="7" rx="3.5" fill="white"/>
        <line x1="19" y1="31" x2="45" y2="31" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="19" y1="34" x2="45" y2="34" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="42" cy="25" r="2.5" fill="#34d399"/>
        <path d="M20 42 Q20 48 25 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
        <path d="M32 42 L32 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <path d="M44 42 Q44 48 39 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac2',
    title: 'AC Maintenance',
    desc: 'Scheduled preventive maintenance to extend AC lifespan, improve efficiency, and prevent costly breakdowns.',
    from: '#4ade80', to: '#15803d', shadow: '#166534',
    border: 'border-green-200',
    bg: 'from-green-50 to-green-100/50',
    service: 'AC Maintenance',
    icon: (
      <Icon3D id="ac2" from="#4ade80" to="#15803d" shadow="#166534">
        <path d="M32 18 L34.5 25.5 L42 24 L37 30 L42 36 L34.5 34.5 L32 42 L29.5 34.5 L22 36 L27 30 L22 24 L29.5 25.5 Z" fill="white" opacity="0.95"/>
        <circle cx="32" cy="30" r="5" fill="#4ade80"/>
        <path d="M40 42 L46 48 M44 44 L48 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac3',
    title: 'AC Repair',
    desc: 'Fast diagnosis and repair of AC faults — refrigerant leaks, compressor issues, electrical faults, PCB failures.',
    from: '#fbbf24', to: '#d97706', shadow: '#92400e',
    border: 'border-yellow-200',
    bg: 'from-yellow-50 to-amber-100/50',
    service: 'AC Repair',
    icon: (
      <Icon3D id="ac3" from="#fbbf24" to="#d97706" shadow="#92400e">
        <path d="M32 16 L35 26 L43 26 L37 33 L39 43 L32 38 L25 43 L27 33 L21 26 L29 26 Z" fill="white" opacity="0.9"/>
        <path d="M42 40 Q46 36 47 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
        <circle cx="43" cy="42" r="3" fill="white" opacity="0.8"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac4',
    title: 'Duct Fabrication & Installation',
    desc: 'Custom GI sheet ductwork fabrication and installation for commercial, industrial, and residential projects.',
    from: '#c084fc', to: '#7e22ce', shadow: '#581c87',
    border: 'border-purple-200',
    bg: 'from-purple-50 to-purple-100/50',
    service: 'Duct Fabrication',
    icon: (
      <Icon3D id="ac4" from="#c084fc" to="#7e22ce" shadow="#581c87">
        <rect x="14" y="23" width="36" height="14" rx="3" fill="white" opacity="0.9"/>
        <rect x="14" y="23" width="8" height="14" rx="2" fill="white"/>
        <rect x="42" y="23" width="8" height="14" rx="2" fill="white"/>
        <line x1="22" y1="26" x2="42" y2="26" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22" y1="30" x2="42" y2="30" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22" y1="34" x2="42" y2="34" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="26" y="37" width="12" height="10" rx="2" fill="white" opacity="0.6"/>
        <circle cx="14" cy="30" r="4" fill="white" opacity="0.5"/>
        <circle cx="50" cy="30" r="4" fill="white" opacity="0.5"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac5',
    title: 'Ventilation Works',
    desc: 'Supply and exhaust ventilation systems, fresh air handling, mechanical ventilation for kitchens, car parks, and server rooms.',
    from: '#22d3ee', to: '#0e7490', shadow: '#155e75',
    border: 'border-cyan-200',
    bg: 'from-cyan-50 to-cyan-100/50',
    service: 'Ventilation Works',
    icon: (
      <Icon3D id="ac5" from="#22d3ee" to="#0e7490" shadow="#155e75">
        <circle cx="32" cy="30" r="13" fill="white" opacity="0.15"/>
        <circle cx="32" cy="30" r="4.5" fill="white" opacity="0.95"/>
        <path d="M32 16 C35 20 38 24 36 28 C34 32 28 30 28 26 C28 22 30 18 32 16Z" fill="white" opacity="0.85"/>
        <path d="M46 30 C42 33 38 36 34.5 34 C31 32 31.5 26 35 25 C38.5 24 43 27 46 30Z" fill="white" opacity="0.85"/>
        <path d="M18 30 C22 27 26 24 29.5 26 C33 28 32.5 34 29 35 C25.5 36 21 33 18 30Z" fill="white" opacity="0.85"/>
        <path d="M38 44 Q42 46 44 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M20 44 Q22 46 26 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac6',
    title: 'Refrigeration Services',
    desc: 'Commercial and industrial refrigeration installation, maintenance, and repair for stores, restaurants, and factories.',
    from: '#818cf8', to: '#3730a3', shadow: '#312e81',
    border: 'border-indigo-200',
    bg: 'from-indigo-50 to-indigo-100/50',
    service: 'Refrigeration Services',
    icon: (
      <Icon3D id="ac6" from="#818cf8" to="#3730a3" shadow="#312e81">
        <line x1="32" y1="16" x2="32" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
        <line x1="18" y1="24" x2="46" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
        <line x1="18" y1="36" x2="46" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
        <circle cx="32" cy="30" r="5" fill="white"/>
        <circle cx="32" cy="16" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="32" cy="44" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="18" cy="24" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="46" cy="36" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="18" cy="36" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="46" cy="24" r="2.5" fill="white" opacity="0.8"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac7',
    title: 'Cold Store Services',
    desc: 'Cold room design, installation, and maintenance. Walk-in freezers, blast chillers, and cold storage solutions.',
    from: '#7dd3fc', to: '#0369a1', shadow: '#075985',
    border: 'border-sky-200',
    bg: 'from-sky-50 to-sky-100/50',
    service: 'Cold Store Services',
    icon: (
      <Icon3D id="ac7" from="#7dd3fc" to="#0369a1" shadow="#075985">
        <rect x="16" y="20" width="28" height="26" rx="3" fill="white" opacity="0.9"/>
        <rect x="16" y="20" width="28" height="8" rx="3" fill="white"/>
        <line x1="32" y1="20" x2="32" y2="46" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="28" x2="44" y2="28" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M23 34 L23 40 M20 37 L26 37" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="41" cy="23" r="2" fill="#38bdf8"/>
        <path d="M35 35 Q38 38 41 35 Q44 32 47 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac8',
    title: 'Chilled Water Pipe Works',
    desc: 'Design, supply, and installation of chilled water pipework systems for large commercial and industrial buildings.',
    from: '#2dd4bf', to: '#0f766e', shadow: '#134e4a',
    border: 'border-teal-200',
    bg: 'from-teal-50 to-teal-100/50',
    service: 'Chilled Water Works',
    icon: (
      <Icon3D id="ac8" from="#2dd4bf" to="#0f766e" shadow="#134e4a">
        <rect x="13" y="27" width="38" height="8" rx="4" fill="white" opacity="0.9"/>
        <circle cx="32" cy="31" r="2.5" fill="#2dd4bf"/>
        <circle cx="22" cy="31" r="2.5" fill="#2dd4bf"/>
        <circle cx="42" cy="31" r="2.5" fill="#2dd4bf"/>
        <path d="M27 20 Q30 16 33 20 Q36 24 39 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
        <path d="M24 42 Q27 46 30 42 Q33 38 36 42 Q39 46 42 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
        <rect x="14" y="22" width="6" height="18" rx="3" fill="white" opacity="0.6"/>
        <rect x="44" y="22" width="6" height="18" rx="3" fill="white" opacity="0.6"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac9',
    title: 'VRF System Installation',
    desc: 'Variable Refrigerant Flow (VRF/VRV) multi-zone systems for offices, hotels, and multi-use commercial buildings.',
    from: '#fb923c', to: '#c2410c', shadow: '#7c2d12',
    border: 'border-orange-200',
    bg: 'from-orange-50 to-orange-100/50',
    service: 'VRF System Installation',
    icon: (
      <Icon3D id="ac9" from="#fb923c" to="#c2410c" shadow="#7c2d12">
        <rect x="20" y="14" width="24" height="10" rx="3" fill="white" opacity="0.9"/>
        <line x1="32" y1="24" x2="32" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        <line x1="32" y1="32" x2="20" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <line x1="32" y1="32" x2="32" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <line x1="32" y1="32" x2="44" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <rect x="14" y="36" width="12" height="8" rx="2.5" fill="white" opacity="0.85"/>
        <rect x="26" y="38" width="12" height="8" rx="2.5" fill="white" opacity="0.85"/>
        <rect x="38" y="36" width="12" height="8" rx="2.5" fill="white" opacity="0.85"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac10',
    title: 'Ducted Split Installation',
    desc: 'Concealed ducted split AC systems for premium villas, apartments, and boutique offices requiring clean aesthetics.',
    from: '#fb7185', to: '#be123c', shadow: '#881337',
    border: 'border-rose-200',
    bg: 'from-rose-50 to-rose-100/50',
    service: 'Ducted Split Installation',
    icon: (
      <Icon3D id="ac10" from="#fb7185" to="#be123c" shadow="#881337">
        <rect x="14" y="17" width="36" height="13" rx="3" fill="white" opacity="0.9"/>
        <rect x="18" y="20" width="28" height="7" rx="2" fill="#fb7185" opacity="0.3"/>
        <line x1="22" y1="23" x2="42" y2="23" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        <line x1="22" y1="26" x2="42" y2="26" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        <path d="M21 30 L21 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M32 30 L32 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <path d="M43 30 L43 40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <rect x="16" y="40" width="10" height="7" rx="2" fill="white" opacity="0.7"/>
        <rect x="27" y="44" width="10" height="7" rx="2" fill="white" opacity="0.7"/>
        <rect x="38" y="40" width="10" height="7" rx="2" fill="white" opacity="0.7"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac11',
    title: 'AHU / FCU / Chiller Replacement',
    desc: 'Replacement and upgrade of existing Air Handling Units, Fan Coil Units, and Chiller systems with energy-efficient models.',
    from: '#a78bfa', to: '#6d28d9', shadow: '#4c1d95',
    border: 'border-violet-200',
    bg: 'from-violet-50 to-violet-100/50',
    service: 'AHU/FCU/Chiller Replacement',
    icon: (
      <Icon3D id="ac11" from="#a78bfa" to="#6d28d9" shadow="#4c1d95">
        <rect x="13" y="19" width="38" height="24" rx="4" fill="white" opacity="0.9"/>
        <circle cx="22" cy="31" r="6" fill="#a78bfa" opacity="0.4"/>
        <circle cx="22" cy="31" r="3.5" fill="white" opacity="0.9"/>
        <circle cx="42" cy="31" r="6" fill="#a78bfa" opacity="0.4"/>
        <circle cx="42" cy="31" r="3.5" fill="white" opacity="0.9"/>
        <rect x="30" y="24" width="6" height="14" rx="2" fill="white"/>
        <path d="M13 43 Q11 47 14 49" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M51 43 Q53 47 50 49" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac12',
    title: 'Plumbing Works',
    desc: 'General plumbing, drainage, water supply, and sanitary works for residential, commercial, and industrial projects.',
    from: '#93c5fd', to: '#2563eb', shadow: '#1e40af',
    border: 'border-blue-200',
    bg: 'from-blue-50 to-blue-100/50',
    service: 'Plumbing Works',
    icon: (
      <Icon3D id="ac12" from="#93c5fd" to="#2563eb" shadow="#1e40af">
        <rect x="14" y="28" width="14" height="8" rx="4" fill="white" opacity="0.9"/>
        <rect x="28" y="28" width="22" height="8" rx="4" fill="white" opacity="0.7"/>
        <rect x="28" y="17" width="8" height="19" rx="4" fill="white" opacity="0.9"/>
        <circle cx="28" cy="28" r="5" fill="white" opacity="0.4"/>
        <circle cx="28" cy="28" r="3" fill="white"/>
        <path d="M34 42 Q36 46 38 44 Q40 42 42 46" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
        <circle cx="28" cy="17" r="3" fill="#93c5fd" opacity="0.6"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac13',
    title: 'Retrofit HVAC Works',
    desc: 'Upgrade and retrofit existing HVAC systems for better energy efficiency, improved capacity, and code compliance.',
    from: '#34d399', to: '#065f46', shadow: '#064e3b',
    border: 'border-emerald-200',
    bg: 'from-emerald-50 to-emerald-100/50',
    service: 'Retrofit HVAC Works',
    icon: (
      <Icon3D id="ac13" from="#34d399" to="#065f46" shadow="#064e3b">
        <path d="M32 42 L26 36 L30 36 L30 26 L26 26 L32 18 L38 26 L34 26 L34 36 L38 36 Z" fill="white" opacity="0.9"/>
        <path d="M22 46 Q16 40 18 30 Q20 22 28 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
        <path d="M42 46 Q48 40 46 30 Q44 22 36 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
        <circle cx="22" cy="46" r="2.5" fill="white" opacity="0.8"/>
        <circle cx="42" cy="46" r="2.5" fill="white" opacity="0.8"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac14',
    title: 'CAD Drafting & As-Built Drawings',
    desc: 'Professional HVAC as-built drawings, CAD drafting, and shop drawings for contracting and consultant approvals.',
    from: '#9ca3af', to: '#374151', shadow: '#1f2937',
    border: 'border-gray-200',
    bg: 'from-gray-50 to-gray-100/50',
    service: 'CAD Drafting',
    icon: (
      <Icon3D id="ac14" from="#9ca3af" to="#374151" shadow="#1f2937">
        <rect x="15" y="17" width="34" height="28" rx="3" fill="white" opacity="0.9"/>
        <line x1="19" y1="22" x2="45" y2="22" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
        <line x1="19" y1="27" x2="45" y2="27" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
        <line x1="19" y1="32" x2="35" y2="32" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
        <line x1="19" y1="37" x2="30" y2="37" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
        <line x1="19" y1="17" x2="19" y2="45" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <rect x="37" y="30" width="10" height="10" rx="2" fill="#9ca3af" opacity="0.4"/>
        <path d="M39 44 L37 48 M47 44 L49 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac15',
    title: 'Annual Maintenance Contract (AMC)',
    desc: 'Structured annual maintenance plans for complete peace of mind. Priority support, regular service, and detailed reports.',
    from: '#fcd34d', to: '#b45309', shadow: '#78350f',
    border: 'border-amber-200',
    bg: 'from-amber-50 to-yellow-100/50',
    service: 'Annual Maintenance Contract',
    icon: (
      <Icon3D id="ac15" from="#fcd34d" to="#b45309" shadow="#78350f">
        <rect x="16" y="18" width="32" height="28" rx="4" fill="white" opacity="0.9"/>
        <rect x="16" y="18" width="32" height="9" rx="4" fill="white"/>
        <rect x="22" y="14" width="5" height="8" rx="2.5" fill="#fcd34d" opacity="0.8"/>
        <rect x="37" y="14" width="5" height="8" rx="2.5" fill="#fcd34d" opacity="0.8"/>
        <line x1="20" y1="33" x2="44" y2="33" stroke="#fcd34d" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M22 38 L26 42 L34 34" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      </Icon3D>
    ),
  },
  {
    id: 'ac16',
    title: 'HVAC Consultancy',
    desc: 'Technical consultation, feasibility studies, system design review, and project management support for HVAC projects.',
    from: '#f87171', to: '#b91c1c', shadow: '#7f1d1d',
    border: 'border-red-200',
    bg: 'from-red-50 to-red-100/50',
    service: 'HVAC Consultancy',
    icon: (
      <Icon3D id="ac16" from="#f87171" to="#b91c1c" shadow="#7f1d1d">
        <path d="M32 14 C24 14 18 20 18 28 C18 33 21 37 25 40 L25 44 L39 44 L39 40 C43 37 46 33 46 28 C46 20 40 14 32 14Z" fill="white" opacity="0.9"/>
        <rect x="25" y="44" width="14" height="3" rx="1.5" fill="white" opacity="0.7"/>
        <rect x="27" y="47" width="10" height="3" rx="1.5" fill="white" opacity="0.6"/>
        <line x1="32" y1="22" x2="32" y2="32" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="32" cy="35" r="2" fill="#f87171"/>
      </Icon3D>
    ),
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            What We Do
          </div>
          <h2 className="section-heading">
            Complete HVAC & Refrigeration Services
          </h2>
          <p className="section-subheading mx-auto mt-3">
            From AC installation to chiller replacement — we cover every aspect of HVAC and refrigeration
            for residential, commercial, and industrial clients across Abu Dhabi.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((svc) => (
            <div
              key={svc.title}
              className={`card bg-gradient-to-br ${svc.bg} border ${svc.border} p-6 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300`}
            >
              <div className="mb-4 w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                {svc.icon}
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2 group-hover:text-brand-red transition-colors">
                {svc.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{svc.desc}</p>
              <div className="flex gap-2 mt-auto">
                <a
                  href="#quote-calculator"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-brand-red text-white text-xs font-semibold py-2.5 rounded-lg transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Quote
                </a>
                <a
                  href={`${WA_BASE}${encodeURIComponent(svc.service)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fireWhatsAppClick(`service-card-${svc.service}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 rounded-lg transition-all duration-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-gray-500 mb-5">Don&apos;t see your requirement? We handle all HVAC and mechanical works.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#quote-calculator" className="btn-primary">
              <FileText className="w-5 h-5" />
              Request Custom Quote
            </a>
            <a
              href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => fireWhatsAppClick('services-bottom-cta')}
              className="btn-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

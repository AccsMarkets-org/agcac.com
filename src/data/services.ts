export interface ServiceData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  benefits: string[];
  image: string;
  icon: string;
  color: string;
  faqs: { q: string; a: string }[];
}

export const servicesData: ServiceData[] = [
  {
    slug: 'ac-installation',
    name: 'AC Installation',
    tagline: 'Professional AC Installation in Abu Dhabi',
    description: 'We install all types of air conditioning systems — split units, cassette ACs, central AC, ducted systems, and multi-zone setups. Our certified engineers size the right system for your space and ensure a clean, professional installation.',
    features: ['Split AC (wall & cassette)', 'Ducted central AC', 'Multi-zone systems', 'Commercial AHUs', 'Concealed units', 'All major brands'],
    benefits: ['Factory-trained technicians', 'Manufacturer warranty maintained', 'Clean installation & tidy cabling', 'Post-installation testing & handover', 'AMC available from day one'],
    image: 'https://images.unsplash.com/photo-1631545806609-e5e9e5e9f3db?auto=format&fit=crop&w=1200&q=80',
    icon: '❄️',
    color: 'from-blue-600 to-blue-800',
    faqs: [
      { q: 'How long does AC installation take?', a: 'A standard split AC takes 2–4 hours. Ducted systems may take 1–3 days depending on scope.' },
      { q: 'Do you supply the AC unit as well?', a: 'Yes, we can supply and install all major brands. Or we can install a unit you have purchased.' },
      { q: 'Is post-installation support included?', a: 'Yes, we provide 12-month warranty on workmanship and offer AMC plans for ongoing maintenance.' },
    ],
  },
  {
    slug: 'ac-repair',
    name: 'AC Repair',
    tagline: 'Fast AC Repair & Diagnosis in Abu Dhabi',
    description: 'AC not cooling? Making noise? Leaking water? Our certified technicians diagnose and repair all AC faults quickly. We carry common spare parts and can handle most repairs in a single visit.',
    features: ['Gas top-up & leak detection', 'PCB & sensor replacement', 'Fan motor & compressor repair', 'Drainage & waterproofing', 'Remote control repair', 'All brands covered'],
    benefits: ['Same-day service available', 'Transparent pricing', 'Genuine spare parts', 'Warranty on repairs', 'Emergency callout available'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    icon: '🔧',
    color: 'from-red-600 to-red-800',
    faqs: [
      { q: 'My AC is not cooling — what could be the cause?', a: 'Low refrigerant gas, dirty filters, faulty thermostat, or compressor issues are the most common causes. Our tech will diagnose on site.' },
      { q: 'Can you repair all AC brands?', a: 'Yes — we repair all major brands including Samsung, LG, Daikin, Mitsubishi, Carrier, Midea, Gree, Panasonic, and more.' },
      { q: 'How soon can a technician come?', a: 'We offer same-day and next-day appointments. Emergency callout is also available.' },
    ],
  },
  {
    slug: 'ac-maintenance',
    name: 'AC Maintenance',
    tagline: 'Regular AC Servicing & Tune-Up Abu Dhabi',
    description: 'Regular maintenance extends AC life and keeps energy costs low. Our maintenance service includes deep cleaning, refrigerant check, electrical inspection, and full system testing. Ideal for villas, apartments, and commercial properties.',
    features: ['Deep coil & filter cleaning', 'Refrigerant level check', 'Electrical connections check', 'Drainage flush', 'Fan & motor inspection', 'Performance testing'],
    benefits: ['Extends equipment life', 'Reduces electricity bills', 'Prevents costly breakdowns', 'Improves air quality', 'Documented service report'],
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    icon: '🛠️',
    color: 'from-green-600 to-green-800',
    faqs: [
      { q: 'How often should AC be serviced?', a: 'Ideally every 3–6 months in Abu Dhabi due to the dusty environment and heavy cooling load.' },
      { q: 'What is included in a maintenance visit?', a: 'Coil cleaning, filter wash, drainage check, refrigerant inspection, electrical check, and full performance test.' },
      { q: 'Do you offer AMC contracts for regular servicing?', a: 'Yes — our AMC plans cover scheduled visits at a fixed annual price. Ask us for a quote.' },
    ],
  },
  {
    slug: 'duct-fabrication',
    name: 'Duct Fabrication',
    tagline: 'Custom GI Ductwork & Installation Abu Dhabi',
    description: 'We design, fabricate, and install galvanised iron (GI) ductwork for commercial and residential HVAC systems. From fresh air intake to exhaust, our duct systems are built for efficiency and longevity.',
    features: ['Custom GI duct fabrication', 'Flexible duct installation', 'Insulated supply & return ducts', 'Diffusers & grilles', 'Fire dampers & VAV boxes', 'Duct leakage testing'],
    benefits: ['In-house fabrication workshop', 'Precise sizing to ASHRAE standards', 'Clean finish & professional installation', 'Noise-optimised design', 'Suitable for new builds & retrofits'],
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    icon: '🏗️',
    color: 'from-gray-600 to-gray-800',
    faqs: [
      { q: 'Can you fabricate ducts for an existing building?', a: 'Yes — we handle retrofits and new installations. We survey the site and design the ductwork accordingly.' },
      { q: 'What materials do you use?', a: 'We use galvanised iron (GI) sheet metal, pre-insulated duct board (PIR), and flexible ducting depending on the application.' },
      { q: 'Do you handle the full installation or just fabrication?', a: 'We handle everything — design, fabrication, installation, and testing.' },
    ],
  },
  {
    slug: 'vrf-systems',
    name: 'VRF Systems',
    tagline: 'VRF / VRV HVAC System Design & Installation',
    description: 'Variable Refrigerant Flow (VRF) systems offer flexible, energy-efficient climate control for commercial buildings, hotels, and large villas. We design, supply, and commission VRF systems from Daikin, Mitsubishi, Samsung, and LG.',
    features: ['Multi-zone cooling & heating', 'Heat recovery VRF', 'BMS integration', 'Daikin, Mitsubishi, Samsung, LG', 'Commissioning & testing', 'Service & maintenance'],
    benefits: ['Up to 30% energy savings', 'Individual room control', 'Scalable for any building size', 'Quiet operation', 'Long equipment life'],
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
    icon: '🌀',
    color: 'from-indigo-600 to-indigo-800',
    faqs: [
      { q: 'What size buildings suit VRF systems?', a: 'VRF is ideal for medium to large buildings — offices, hotels, commercial buildings, and large villas.' },
      { q: 'Can VRF systems heat and cool at the same time?', a: 'Yes — heat recovery VRF systems can heat some zones while cooling others simultaneously.' },
      { q: 'Do you handle the full project or just supply?', a: 'We handle design, supply, installation, commissioning, and ongoing maintenance.' },
    ],
  },
  {
    slug: 'chilled-water',
    name: 'Chilled Water Systems',
    tagline: 'Chiller Plant & Chilled Water HVAC Systems',
    description: 'We install and maintain centralised chilled water systems for large commercial buildings, factories, and campuses. Our scope includes chillers, cooling towers, pumps, piping, AHUs, and FCUs.',
    features: ['Chiller installation & commissioning', 'Cooling towers & condenser water', 'Chilled water piping & insulation', 'AHU & FCU installation', 'BMS controls', 'System balancing & testing'],
    benefits: ['Efficient for large buildings', 'Centralized monitoring', 'Lower running costs at scale', 'Long system lifespan', 'Flexible capacity'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    icon: '🌊',
    color: 'from-cyan-600 to-cyan-800',
    faqs: [
      { q: 'What is a chilled water system?', a: 'A central plant where water is chilled by a refrigeration machine (chiller) and circulated to AHUs or FCUs throughout a building.' },
      { q: 'Is a chilled water system suitable for a villa?', a: 'It is most efficient for large commercial or multi-storey buildings. For villas, central ducted or VRF systems are typically better suited.' },
    ],
  },
  {
    slug: 'refrigeration',
    name: 'Refrigeration',
    tagline: 'Commercial Refrigeration & Cold Store Solutions',
    description: 'We install, repair, and service commercial refrigeration systems — cold rooms, walk-in freezers, display cases, and industrial refrigeration units for supermarkets, restaurants, factories, and food processing facilities.',
    features: ['Cold room & walk-in freezer', 'Blast chillers & freezers', 'Refrigerated display cases', 'Ice machines', 'Industrial refrigeration', 'Monitoring systems'],
    benefits: ['HACCP-compliant installations', 'Energy-efficient compressors', '24/7 monitoring options', 'Fast fault response', 'All refrigerants handled'],
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    icon: '🧊',
    color: 'from-blue-500 to-cyan-700',
    faqs: [
      { q: 'Can you build a custom cold room?', a: 'Yes — we design and construct cold rooms to any size and temperature requirement, from -25°C freezers to +4°C chill rooms.' },
      { q: 'Do you service existing refrigeration systems?', a: 'Yes — we repair and service all commercial refrigeration brands and systems.' },
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing Works',
    tagline: 'Complete Plumbing Solutions Abu Dhabi',
    description: 'Our licensed plumbers handle all plumbing works — from new installations and fit-outs to repairs and emergency callouts. We serve residential villas, apartments, offices, and commercial properties across Abu Dhabi.',
    features: ['Supply & drainage piping', 'Sanitary ware installation', 'Water heater installation', 'Leak detection & repair', 'Water tank cleaning', 'Fit-out plumbing'],
    benefits: ['Licensed plumbers', 'Same-day repairs available', 'Quality materials used', 'Full fit-out capability', 'Competitive pricing'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    icon: '🚰',
    color: 'from-teal-600 to-teal-800',
    faqs: [
      { q: 'Do you handle emergency plumbing?', a: 'Yes — we offer emergency plumbing callouts for leaks, burst pipes, and drainage blockages.' },
      { q: 'Can you do a full villa plumbing fit-out?', a: 'Yes — we handle complete plumbing fit-out for new construction and renovation projects.' },
    ],
  },
  {
    slug: 'ventilation',
    name: 'Ventilation Systems',
    tagline: 'Fresh Air, Exhaust & IAQ Systems Abu Dhabi',
    description: 'Proper ventilation is essential for air quality, comfort, and building compliance. We design and install mechanical ventilation, fresh air handling units, kitchen/toilet exhausts, and indoor air quality (IAQ) systems.',
    features: ['Fresh air handling units (AHU)', 'Kitchen exhaust systems', 'Toilet & general exhaust', 'Heat recovery ventilators (HRV)', 'IAQ monitoring', 'Pressurisation systems'],
    benefits: ['Improved indoor air quality', 'Compliance with UAE building codes', 'Reduced humidity & odours', 'Energy-efficient HRV options', 'Fire safety compliance'],
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    icon: '💨',
    color: 'from-sky-600 to-sky-800',
    faqs: [
      { q: 'Is ventilation legally required in UAE buildings?', a: 'Yes — the UAE fire code and Abu Dhabi building codes mandate mechanical ventilation in commercial buildings and certain residential uses.' },
      { q: 'What is an HRV?', a: 'A Heat Recovery Ventilator recovers energy from exhaust air to pre-condition fresh incoming air, improving efficiency significantly.' },
    ],
  },
  {
    slug: 'amc',
    name: 'AMC Contracts',
    tagline: 'Annual Maintenance Contracts — Abu Dhabi',
    description: 'Our Annual Maintenance Contract (AMC) plans give you peace of mind with scheduled HVAC servicing throughout the year at a fixed price. Choose from Basic, Standard, or Premium plans for villas, offices, and commercial buildings.',
    features: ['Scheduled service visits (quarterly)', 'Filter & coil cleaning', 'Refrigerant check', 'Electrical inspection', 'Priority emergency response', 'Detailed service reports'],
    benefits: ['Fixed annual cost — no surprises', 'Priority booking for your property', 'Discounted emergency call rates', 'Equipment lifespan extended', 'Full documentation provided'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    icon: '📋',
    color: 'from-amber-600 to-amber-800',
    faqs: [
      { q: 'What is included in an AMC plan?', a: 'Scheduled maintenance visits, cleaning, checks, and priority emergency response. Exact scope depends on the plan selected.' },
      { q: 'How many visits per year?', a: 'Our standard plans include 4 visits per year (quarterly). Premium plans include 6 visits.' },
      { q: 'Can I get an AMC for one AC unit?', a: 'Yes — we tailor AMC plans to the number of units and your property type. Contact us for a custom quote.' },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData.find((s) => s.slug === slug);
}

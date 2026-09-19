'use client';
import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { locationPins } from '@/data/projects';

interface Pin {
  name: string;
  x: number;
  y: number;
  count: number;
  service: string;
}

export default function ProjectMapSection() {
  const [activePin, setActivePin] = useState<Pin | null>(null);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Project Locations
          </div>
          <h2 className="section-heading">HVAC Projects Across Abu Dhabi & UAE</h2>
          <p className="section-subheading mx-auto mt-3">
            We have delivered HVAC, refrigeration, and mechanical services across key locations in Abu Dhabi.
            Click a pin to see projects in that area.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="relative bg-navy-900 rounded-3xl overflow-hidden" style={{ paddingBottom: '70%' }}>
              {/* SVG Map of Abu Dhabi region */}
              <svg
                viewBox="0 0 100 70"
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="100" height="70" fill="#0A1628" />

                {/* Water (Gulf) */}
                <path d="M0 0 L100 0 L100 25 Q80 30 60 28 Q50 26 45 30 Q55 35 65 38 Q75 42 85 40 L100 45 L100 70 L0 70 Z" fill="#0F2040" opacity="0.5" />

                {/* Abu Dhabi City island shape */}
                <ellipse cx="53" cy="37" rx="12" ry="5" fill="#1E3A5F" opacity="0.6" />

                {/* Land areas */}
                <path d="M0 30 Q15 28 25 32 Q35 36 45 38 Q55 40 70 38 Q80 36 90 40 Q95 42 100 45 L100 70 L0 70 Z" fill="#1E3A5F" opacity="0.4" />

                {/* Grid lines */}
                {[20, 40, 60, 80].map(x => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="70" stroke="#FFFFFF" strokeWidth="0.1" opacity="0.15" />
                ))}
                {[15, 30, 45, 55].map(y => (
                  <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#FFFFFF" strokeWidth="0.1" opacity="0.15" />
                ))}

                {/* Main roads */}
                <line x1="30" y1="70" x2="55" y2="35" stroke="#F59E0B" strokeWidth="0.3" opacity="0.4" strokeDasharray="1,1" />
                <line x1="0" y1="50" x2="100" y2="45" stroke="#F59E0B" strokeWidth="0.3" opacity="0.3" strokeDasharray="1,1" />

                {/* Location pins */}
                {locationPins.map((pin) => (
                  <g key={pin.name} onClick={() => setActivePin(activePin?.name === pin.name ? null : pin)} style={{ cursor: 'pointer' }}>
                    {/* Pulse ring */}
                    <circle cx={pin.x} cy={pin.y} r="4" fill="none" stroke="#DC2626" strokeWidth="0.5" opacity="0.4">
                      <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Pin circle */}
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r="2.2"
                      fill={activePin?.name === pin.name ? '#F59E0B' : '#DC2626'}
                      className="transition-all"
                    />
                    {/* Project count */}
                    <text x={pin.x} y={pin.y + 0.7} textAnchor="middle" fontSize="1.5" fill="white" fontWeight="bold">
                      {pin.count}
                    </text>
                    {/* Label */}
                    <text
                      x={pin.x + 3}
                      y={pin.y + 0.8}
                      fontSize="2.2"
                      fill="white"
                      opacity="0.8"
                      fontWeight="500"
                    >
                      {pin.name}
                    </text>
                  </g>
                ))}

                {/* Title overlay */}
                <text x="3" y="5" fontSize="3" fill="white" opacity="0.5" fontWeight="bold">ABU DHABI — UAE</text>
              </svg>

              {/* Active pin popup */}
              {activePin && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                  <button onClick={() => setActivePin(null)} className="absolute top-3 right-3 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-navy-900 text-sm">{activePin.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{activePin.service}</div>
                      <div className="text-brand-red font-semibold text-xs mt-1">{activePin.count} Project{activePin.count > 1 ? 's' : ''} Completed</div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/971506725808?text=${encodeURIComponent(`Hello Al Ghawas, I need HVAC service in ${activePin.name}. Please contact me.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-bold py-2 rounded-xl"
                  >
                    Request Service in {activePin.name}
                  </a>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-xs text-center mt-2">
              Click any pin to see project details. We serve all Abu Dhabi areas.
            </p>
          </div>

          {/* Location list */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="font-bold text-navy-900 mb-4">Project Coverage Areas</h3>
            {locationPins.map((pin) => (
              <button
                key={pin.name}
                onClick={() => setActivePin(activePin?.name === pin.name ? null : pin)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  activePin?.name === pin.name
                    ? 'bg-brand-red/5 border-brand-red/30'
                    : 'bg-gray-50 border-transparent hover:border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activePin?.name === pin.name ? 'bg-brand-red' : 'bg-navy-900/10'
                }`}>
                  <MapPin className={`w-4 h-4 ${activePin?.name === pin.name ? 'text-white' : 'text-navy-900'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-navy-900 text-sm">{pin.name}</div>
                  <div className="text-gray-400 text-xs">{pin.service}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  activePin?.name === pin.name ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {pin.count}
                </span>
              </button>
            ))}

            <div className="mt-4 p-4 bg-navy-900 rounded-2xl text-center">
              <p className="text-white/70 text-sm mb-3">Don&apos;t see your area? We serve all Abu Dhabi locations.</p>
              <a
                href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service%20in%20my%20area.%20Can%20you%20service%20my%20location%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Check Your Area
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

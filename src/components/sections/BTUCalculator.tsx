'use client';
import { useState } from 'react';
import { Calculator, Sun, Users, Home, Thermometer } from 'lucide-react';

const ROOM_TYPES = ['Bedroom', 'Living Room', 'Office', 'Shop', 'Server Room', 'Kitchen', 'Gym', 'Warehouse'];
const SUN_EXPOSURE = ['Low (Shaded/North facing)', 'Medium (East/West facing)', 'High (South facing/Full sun)'];
const INSULATION = ['Good (Modern building)', 'Average', 'Poor (Old building/No insulation)'];

function calcBTU(
  lengthM: number, widthM: number, heightM: number,
  sunExposure: string, people: number,
  roomType: string, insulation: string
): { btu: number; tons: number; model: string } {
  const areaSqFt = lengthM * widthM * 10.764;
  let base = areaSqFt * 25;

  // Sun multiplier
  if (sunExposure.includes('Medium')) base *= 1.1;
  if (sunExposure.includes('High')) base *= 1.2;

  // People load
  base += people * 600;

  // Room type
  if (roomType === 'Kitchen') base *= 1.3;
  if (roomType === 'Server Room') base *= 1.5;
  if (roomType === 'Gym') base *= 1.2;
  if (roomType === 'Warehouse') base *= 0.85;

  // Height
  if (heightM > 3) base *= 1 + (heightM - 3) * 0.05;

  // Insulation
  if (insulation.includes('Average')) base *= 1.1;
  if (insulation.includes('Poor')) base *= 1.2;

  const btu = Math.round(base / 500) * 500;
  const tons = +(btu / 12000).toFixed(1);

  let model = '';
  if (tons <= 1) model = '9,000 BTU (0.75 Ton) Split AC';
  else if (tons <= 1.5) model = '18,000 BTU (1.5 Ton) Split AC';
  else if (tons <= 2) model = '24,000 BTU (2 Ton) Split AC';
  else if (tons <= 3) model = '36,000 BTU (3 Ton) Split AC or Ducted';
  else if (tons <= 5) model = '5 Ton Ducted Split or Cassette AC';
  else if (tons <= 10) model = 'Package Unit or VRF Zone';
  else model = 'VRF/Chilled Water System — site inspection required';

  return { btu, tons, model };
}

export default function BTUCalculator() {
  const [form, setForm] = useState({
    length: '', width: '', height: '3',
    sunExposure: '', people: '2', roomType: '', insulation: '',
  });
  const [result, setResult] = useState<{ btu: number; tons: number; model: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [leadPhone, setLeadPhone] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const calculate = () => {
    const l = parseFloat(form.length);
    const w = parseFloat(form.width);
    const h = parseFloat(form.height) || 3;
    if (!l || !w || l <= 0 || w <= 0) return;
    const r = calcBTU(l, w, h, form.sunExposure, parseInt(form.people) || 2, form.roomType, form.insulation);
    setResult(r);
  };

  return (
    <section id="btu-calculator" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Free BTU Calculator
          </div>
          <h2 className="section-heading">AC Tonnage & BTU Estimator</h2>
          <p className="section-subheading mx-auto mt-3">
            Estimate the required AC capacity for your room in seconds.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          {/* Calculator inputs */}
          <div className="card p-7">
            <h3 className="font-bold text-navy-900 text-lg mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-red" />
              Room Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Length (m) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 5" min="1" value={form.length} onChange={set('length')} />
                </div>
                <div>
                  <label className="form-label">Width (m) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 4" min="1" value={form.width} onChange={set('width')} />
                </div>
                <div>
                  <label className="form-label">Height (m)</label>
                  <input className="form-input" type="number" placeholder="e.g. 3" min="2" value={form.height} onChange={set('height')} />
                </div>
              </div>
              <div>
                <label className="form-label flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Sun Exposure</label>
                <select className="form-select" value={form.sunExposure} onChange={set('sunExposure')}>
                  <option value="">Select...</option>
                  {SUN_EXPOSURE.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label flex items-center gap-1"><Users className="w-3.5 h-3.5" /> No. of People</label>
                  <input className="form-input" type="number" placeholder="e.g. 2" min="1" value={form.people} onChange={set('people')} />
                </div>
                <div>
                  <label className="form-label flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Room Type</label>
                  <select className="form-select" value={form.roomType} onChange={set('roomType')}>
                    <option value="">Select...</option>
                    {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Insulation Quality</label>
                <select className="form-select" value={form.insulation} onChange={set('insulation')}>
                  <option value="">Select...</option>
                  {INSULATION.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <button
                onClick={calculate}
                disabled={!form.length || !form.width}
                className="w-full btn-primary justify-center py-4 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calculator className="w-5 h-5" />
                Calculate BTU
              </button>
            </div>
          </div>

          {/* Result panel */}
          <div>
            {result ? (
              <div className="card p-7 border border-brand-gold/30 bg-gradient-to-br from-brand-gold/5 to-white">
                <div className="text-center mb-6">
                  <div className="text-5xl font-black text-navy-900 mb-1">
                    {result.btu.toLocaleString()}
                  </div>
                  <div className="text-brand-gold font-bold text-sm">BTU Required</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-navy-900 rounded-2xl p-4 text-center">
                    <div className="text-brand-gold font-black text-3xl">{result.tons}</div>
                    <div className="text-white/70 text-xs">Tons (TR)</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="text-navy-900 font-black text-3xl">{(result.btu / 1000).toFixed(1)}</div>
                    <div className="text-gray-500 text-xs">kBTU/hr</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                  <p className="text-blue-700 font-semibold text-sm mb-1">Recommended:</p>
                  <p className="text-navy-900 font-bold">{result.model}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                  <p className="text-amber-700 text-xs">
                    ⚠️ <strong>Disclaimer:</strong> This is an estimate only. Final HVAC capacity requires a professional site inspection considering local climate conditions, building envelope, and equipment specifications.
                  </p>
                </div>

                {!showForm ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full btn-primary justify-center py-4"
                  >
                    Request Accurate Site Inspection
                  </button>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-bold text-navy-900">Request Site Inspection</h4>
                    <input
                      className="form-input"
                      placeholder="Your phone / WhatsApp"
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                    />
                    <a
                      href={`https://wa.me/971506725808?text=${encodeURIComponent(
                        `Hello Al Ghawas, I used your BTU calculator. Result: ${result.btu.toLocaleString()} BTU (${result.tons} Tons). Recommended: ${result.model}. I need a professional site inspection. My phone: ${leadPhone}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-whatsapp justify-center py-4 block text-center"
                    >
                      Book Inspection on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-10 text-center border-2 border-dashed border-gray-200">
                <Calculator className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-400 text-xl mb-2">Enter room details</h3>
                <p className="text-gray-400 text-sm">Fill the form on the left to calculate the required AC capacity for your room.</p>
              </div>
            )}

            {/* Info card */}
            <div className="mt-5 card p-5 bg-navy-900">
              <h4 className="text-white font-bold text-sm mb-3">Why proper sizing matters:</h4>
              <ul className="space-y-2 text-white/60 text-xs">
                <li>✓ Undersized AC runs continuously — high bills & poor cooling</li>
                <li>✓ Oversized AC causes short cycling & humidity problems</li>
                <li>✓ Correct sizing = optimal efficiency + longer lifespan</li>
                <li>✓ Our engineers perform accurate load calculations on-site</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

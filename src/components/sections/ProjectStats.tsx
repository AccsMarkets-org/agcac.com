'use client';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 2005, suffix: '', label: 'Year Founded', prefix: '' },
  { value: 30, suffix: '+', label: 'Completed Projects', prefix: '' },
  { value: 20, suffix: '+', label: 'Years Experience', prefix: '' },
  { value: 100, suffix: '%', label: 'Client Focus', prefix: '' },
];

const badges = [
  '🏢 Commercial Buildings',
  '🏠 Private Villas',
  '🔄 VRF Systems',
  '❄️ Chiller Projects',
  '🌀 Duct Fabrication',
  '🔧 Maintenance Support',
  '🏭 Industrial Facilities',
  '🏨 Hotels & Government',
];

function Counter({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="font-black text-4xl md:text-5xl text-white">{prefix}{count}{suffix}</div>;
}

export default function ProjectStats() {
  return (
    <section className="bg-navy-900 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="container-custom relative z-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          {stats.map(({ value, suffix, label, prefix }) => (
            <div key={label} className="text-center">
              <Counter target={value} suffix={suffix} prefix={prefix} />
              <p className="text-white/50 text-sm mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <div key={badge} className="bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-2 rounded-full">
              {badge}
            </div>
          ))}
        </div>

        {/* Coverage statement */}
        <div className="text-center mt-10">
          <p className="text-white/40 text-sm">Abu Dhabi · Yas Island · MBZ City · Khalifa City · Baniyas · Mussafah · Al Maryah Island · Al Jubail Island · Shamkha</p>
        </div>
      </div>
    </section>
  );
}

'use client';
import { useState } from 'react';

interface LogoImageProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export default function LogoImage({ size = 'sm', className = '' }: LogoImageProps) {
  const [failed, setFailed] = useState(false);

  if (size === 'lg') {
    return failed ? (
      <div className={`bg-white rounded-xl p-3 flex items-center gap-3 shadow-md ${className}`}>
        <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-xl select-none">AGC</span>
        </div>
        <div>
          <div className="font-black text-base leading-tight text-navy-900">Al Ghawas A/C</div>
          <div className="text-red-600 text-xs font-semibold">Air Con &amp; Refrigeration</div>
        </div>
      </div>
    ) : (
      <div className={`bg-white rounded-xl p-2 shadow-md w-fit ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Al Ghawas Air Con & Refrigeration"
          width={100}
          height={123}
          className="h-20 w-auto object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return failed ? (
    <div className={`w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shrink-0 ${className}`}>
      <span className="text-white font-black text-base leading-none select-none">AGC</span>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Al Ghawas Air Con & Refrigeration"
      width={52}
      height={64}
      className={`h-12 w-auto object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

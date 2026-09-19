'use client';
import { useState } from 'react';

type VATReturn = { id: string; period: string; status: string; netVAT: number; ftaRefNumber: string | null; submittedAt: string | null; };
type CTReturn = { id: string; financialYear: string; status: string; netCTPayable: number; ftaRefNumber: string | null; submittedAt: string | null; };

interface Props {
  vatReturns: VATReturn[];
  ctReturns: CTReturn[];
  piCount: number;
  siCount: number;
  piPending: number;
  companyTRN: string;
  companyName: string;
  approvedVATCount: number;
  approvedCTCount: number;
}

export default function SubmissionClient(p: Props) {
  const [vatReturns, setVATReturns] = useState(p.vatReturns);
  const [ctReturns, setCTReturns] = useState(p.ctReturns);

  const checklist = [
    { label: 'Company TRN configured', done: !!p.companyTRN, cta: '/admin/tax/settings' },
    { label: `Purchase invoices uploaded (${p.piCount} total)`, done: p.piCount > 0, cta: '/admin/tax/purchase-invoices' },
    { label: `No pending invoice approvals (${p.piPending} pending)`, done: p.piPending === 0, cta: '/admin/tax/purchase-invoices' },
    { label: `Sales invoices recorded (${p.siCount} total)`, done: p.siCount > 0, cta: '/admin/tax/sales-invoices' },
    { label: `VAT returns prepared (${p.approvedVATCount} approved)`, done: p.approvedVATCount > 0, cta: '/admin/tax/vat-returns' },
  ];

  const handleVATFTARef = async (id: string) => {
    const ref = prompt('Enter FTA Reference Number from EmaraTax:');
    if (!ref?.trim()) return;
    const res = await fetch('/api/admin/tax/vat-returns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Submitted', ftaRefNumber: ref.trim(), submittedAt: new Date().toISOString() }),
    });
    if (!res.ok) return alert('Update failed');
    const updated = await res.json();
    setVATReturns(v => v.map(r => r.id === updated.id ? updated : r));
  };

  const handleCTFTARef = async (id: string) => {
    const ref = prompt('Enter FTA Reference Number from EmaraTax:');
    if (!ref?.trim()) return;
    const res = await fetch('/api/admin/tax/corporate-tax', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Submitted', ftaRefNumber: ref.trim(), submittedAt: new Date().toISOString() }),
    });
    if (!res.ok) return alert('Update failed');
    const updated = await res.json();
    setCTReturns(v => v.map(r => r.id === updated.id ? updated : r));
  };

  const FMT = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submission Center</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage tax filing submissions</p>
      </div>

      {/* Critical legal banner */}
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-2xl mt-0.5">⚠️</span>
          <div>
            <h2 className="text-red-900 font-bold text-base mb-2">THIS SYSTEM DOES NOT SUBMIT TO THE FTA</h2>
            <p className="text-red-800 text-sm mb-3">
              All UAE VAT returns and Corporate Tax filings <strong>must be submitted manually</strong> by an authorized accountant or licensed tax agent through the EmaraTax portal.
              After filing, return here to record the FTA reference number and mark the return as submitted.
            </p>
            <div className="bg-red-100 rounded-lg px-4 py-3 text-sm text-red-900 font-mono">
              EmaraTax Portal: <strong>eservices.tax.gov.ae</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Filing Workflow</h2>
        <ol className="space-y-3">
          {[
            { n: 1, text: 'Ensure all invoices are uploaded and approved in this system' },
            { n: 2, text: 'Prepare VAT return or Corporate Tax return in this system (Draft → Approved)' },
            { n: 3, text: 'Download the reports from Tax Reports for your accountant' },
            { n: 4, text: 'Your authorized accountant logs into EmaraTax and files the return' },
            { n: 5, text: 'Accountant receives an FTA reference number upon successful submission' },
            { n: 6, text: 'Return to this page → click "Enter FTA Ref" → record the reference number' },
            { n: 7, text: 'The return status updates to "Submitted" — keep confirmation documents for 5 years' },
          ].map(s => (
            <li key={s.n} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{s.n}</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Pre-flight checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Pre-Submission Checklist</h2>
        <div className="space-y-2">
          {checklist.map(item => (
            <div key={item.label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${item.done ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-3">
                <span>{item.done ? '✅' : '⚠️'}</span>
                <span className={`text-sm ${item.done ? 'text-green-800' : 'text-amber-800'}`}>{item.label}</span>
              </div>
              {!item.done && (
                <a href={item.cta} className="text-xs text-blue-600 hover:underline font-medium">Fix →</a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VAT Returns requiring action */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">VAT Returns</h2>
        {vatReturns.length === 0 && <p className="text-sm text-gray-400">No VAT returns yet. <a href="/admin/tax/vat-returns" className="text-blue-600 underline">Create one →</a></p>}
        <div className="space-y-3">
          {vatReturns.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <div className="font-semibold text-gray-900 text-sm">{r.period}</div>
                <div className="text-xs text-gray-500 mt-0.5">Net VAT: {FMT(r.netVAT)}</div>
                {r.ftaRefNumber && <div className="text-xs text-green-600 font-mono mt-0.5">FTA Ref: {r.ftaRefNumber}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : r.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.status}
                </span>
                {r.status === 'Approved' && (
                  <button onClick={() => handleVATFTARef(r.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                    Enter FTA Ref
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CT Returns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Corporate Tax Returns</h2>
        {ctReturns.length === 0 && <p className="text-sm text-gray-400">No CT returns yet. <a href="/admin/tax/corporate-tax" className="text-blue-600 underline">Create one →</a></p>}
        <div className="space-y-3">
          {ctReturns.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div>
                <div className="font-semibold text-gray-900 text-sm">FY {r.financialYear}</div>
                <div className="text-xs text-gray-500 mt-0.5">Net CT Payable: {FMT(r.netCTPayable)}</div>
                {r.ftaRefNumber && <div className="text-xs text-green-600 font-mono mt-0.5">FTA Ref: {r.ftaRefNumber}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : r.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.status}
                </span>
                {r.status === 'Approved' && (
                  <button onClick={() => handleCTFTARef(r.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                    Enter FTA Ref
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Downloads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Download Reports for Your Accountant</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '📊 Purchase Invoice Register (Excel)', href: '/api/admin/tax/reports/purchase-register' },
            { label: '📊 Sales Invoice Register (Excel)', href: '/api/admin/tax/reports/sales-register' },
            { label: '📊 VAT Returns Summary (Excel)', href: '/api/admin/tax/reports/vat-returns' },
            { label: '📊 Corporate Tax Report (Excel)', href: '/api/admin/tax/reports/ct-report' },
          ].map(btn => (
            <a key={btn.label} href={btn.href}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              {btn.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Hand these reports to your authorized tax agent along with original source documents.
        </p>
      </div>
    </div>
  );
}

'use client';
import { AlertTriangle, CheckCircle, FileText, TrendingUp, TrendingDown, DollarSign, ExternalLink } from 'lucide-react';

const fmt = (n: number) => `AED ${Math.abs(n).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const VAT_WORKFLOW = [
  { step: 1, title: 'Upload Invoices', desc: 'Upload all purchase and sales invoices via AI Invoice Upload', route: '/admin/ai/invoice-upload', done: true },
  { step: 2, title: 'AI Extraction & Validation', desc: 'AI extracts TRN, VAT amounts, totals. Review warnings in the Document Queue', route: '/admin/ai/document-queue', done: true },
  { step: 3, title: 'Accountant Review & Approval', desc: 'Accountant reviews each document in the Review Center and approves', route: '/admin/ai/review-center', done: false },
  { step: 4, title: 'Tax Records Posted', desc: 'Approved documents are posted to Purchase Invoices / Tax Sales Invoices', route: '/admin/tax/purchase-invoices', done: false },
  { step: 5, title: 'VAT Return Preparation', desc: 'Review VAT dashboard. Prepare VAT Return document', route: '/admin/tax/vat-returns', done: false },
  { step: 6, title: 'Manual EmaraTax Submission', desc: 'Authorized accountant manually files the VAT Return on EmaraTax portal. Enter reference number here after submission.', route: null, done: false },
];

const CHECKLIST = [
  'All purchase invoices have valid 15-digit supplier TRN',
  'All VAT amounts are at 5% of taxable value',
  'No duplicate invoices in the system',
  'All sales invoices include customer TRN (for B2B)',
  'Exempt and zero-rated supplies are correctly classified',
  'All documents are reviewed and approved by accountant',
  'VAT Return totals match accounting records',
  'Supporting documents are retained for 5 years (UAE FTA requirement)',
];

export default function TaxAssistantClient({
  totalInputVAT,
  totalOutputVAT,
  netVAT,
  purchaseCount,
  salesCount,
  missingTRN,
  userRole,
}: {
  totalInputVAT: number;
  totalOutputVAT: number;
  netVAT: number;
  purchaseCount: number;
  salesCount: number;
  missingTRN: number;
  userRole: string;
}) {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Tax & VAT Assistant
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">UAE VAT 5% — Tax guidance, workflow, and compliance checklist</p>
      </div>

      {/* Critical legal notice */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="font-bold text-red-800">Important: Manual EmaraTax Submission Required</div>
            <p className="text-sm text-red-700">
              This system prepares your VAT return data and generates a submission package. <strong>The system does NOT automatically submit to FTA.</strong>
            </p>
            <p className="text-sm text-red-700">
              Final filing must be manually done by an authorized accountant through{' '}
              <span className="font-bold underline">EmaraTax portal</span>. After submission, enter the FTA reference number and upload the confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* VAT Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Input VAT (Purchases)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmt(totalInputVAT)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{purchaseCount} invoices</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Output VAT (Sales)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{fmt(totalOutputVAT)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{salesCount} invoices</div>
        </div>
        <div className={`rounded-2xl border-2 p-5 ${netVAT > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className={`flex items-center gap-2 mb-2 ${netVAT > 0 ? 'text-orange-700' : 'text-green-700'}`}>
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Net VAT {netVAT > 0 ? 'Payable' : 'Refundable'}</span>
          </div>
          <div className={`text-2xl font-bold ${netVAT > 0 ? 'text-orange-800' : 'text-green-800'}`}>{fmt(netVAT)}</div>
          <div className="text-xs text-gray-500 mt-0.5">Output VAT − Input VAT</div>
        </div>
      </div>

      {/* Warnings */}
      {missingTRN > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800 text-sm">{missingTRN} purchase invoice{missingTRN > 1 ? 's' : ''} with missing or invalid supplier TRN</div>
            <p className="text-xs text-amber-700 mt-0.5">Input VAT on invoices without a valid 15-digit TRN may not be reclaimable under UAE FTA rules.</p>
          </div>
        </div>
      )}

      {/* VAT Filing Workflow */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900">VAT Filing Workflow</h2>
        <div className="space-y-3">
          {VAT_WORKFLOW.map(step => (
            <div key={step.step} className="flex gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step.step}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  {step.title}
                  {step.done && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  {step.step === 6 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">MANUAL REQUIRED</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
                {step.route && (
                  <a href={step.route} className="text-xs text-indigo-600 hover:underline mt-0.5 flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {step.step === 6 && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                    <strong>Submit this return through EmaraTax:</strong>{' '}
                    <a href="https://eservices.tax.gov.ae" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                      eservices.tax.gov.ae
                    </a>
                    . After submission, enter the FTA reference number and upload your confirmation document.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-bold text-gray-900">Pre-Filing Compliance Checklist</h2>
        <div className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-indigo-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          This checklist is a guide only. Always consult a qualified UAE tax professional before filing.
        </p>
      </div>

      {/* UAE VAT Quick Reference */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">UAE VAT Quick Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            ['Standard Rate', '5%'],
            ['Zero Rate (exports, international)', '0%'],
            ['Exempt (residential rent, insurance)', 'Exempt'],
            ['VAT Return Period', 'Quarterly (most SMEs)'],
            ['Filing Deadline', '28 days after quarter end'],
            ['Record Retention', '5 years minimum'],
            ['TRN Length', '15 digits'],
            ['FTA Portal', 'EmaraTax (eservices.tax.gov.ae)'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between bg-white rounded-xl border border-gray-200 px-3 py-2">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 pt-1">
          This is general information. These pages should be reviewed by a qualified UAE legal/tax advisor before relying on them for compliance purposes.
        </p>
      </div>
    </div>
  );
}

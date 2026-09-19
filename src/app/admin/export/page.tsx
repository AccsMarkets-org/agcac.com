'use client';

import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';

export default function ExportDataPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-500 text-sm mt-1">Download all leads and records in Excel or CSV format.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Excel Export (.xlsx)</h2>
          <p className="text-gray-500 text-sm mb-4">
            Styled Excel file with color-coded status columns, frozen headers, and auto-filter. Best for analysis and reporting.
          </p>
          <ul className="space-y-1.5 mb-6">
            {['All lead fields + UTM data', 'Color-coded status column', 'Frozen header row', 'Auto-filter enabled', 'Emergency urgency highlighted'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <a
            href="/api/leads/export-excel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Excel File
          </a>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">CSV Export (.csv)</h2>
          <p className="text-gray-500 text-sm mb-4">
            Plain CSV compatible with any spreadsheet software, CRM, or data import tool.
          </p>
          <ul className="space-y-1.5 mb-6">
            {['All lead fields', 'UTF-8 encoded', 'Compatible with all CRMs', 'Lightweight file size', 'Easy to import anywhere'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <a
            href="/api/leads/export-csv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV File
          </a>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Exports include all non-deleted leads from the database, ordered newest first. Trashed leads are excluded.
      </div>
    </div>
  );
}

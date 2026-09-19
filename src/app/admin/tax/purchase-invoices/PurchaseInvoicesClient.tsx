'use client';
import { useState } from 'react';
import { Eye, FileText, CheckCircle, XCircle, Printer, ExternalLink, Upload, X as XIcon } from 'lucide-react';

type Item = { id: string; description: string; quantity: number; unitPrice: number; vatRate: number; vatAmount: number; total: number };
type Invoice = {
  id: string; invoiceRef: string; supplierName: string; supplierTRN: string | null;
  trnVerified: string; invoiceDate: string; invoiceNumber: string | null;
  netAmount: number; vatAmount: number; totalAmount: number; vatRate: number;
  vatTreatment: string; recoverableVAT: number; nonRecoverableVAT: number;
  paymentStatus: string; approvalStatus: string; approvedBy: string | null; approvedAt: string | null;
  category: string; notes: string | null; fileUrl: string | null; status: string;
  items: Item[];
};

const FMT = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
const VAT_TREATMENTS = ['Standard', 'ZeroRated', 'Exempt', 'OutOfScope', 'ReverseCharge'];
const CATEGORIES = ['General', 'Equipment', 'Materials', 'Services', 'Rent', 'Utilities', 'Travel', 'Other'];

const EMPTY: Omit<Invoice, 'id' | 'invoiceRef' | 'items'> = {
  supplierName: '', supplierTRN: '', trnVerified: 'NotVerified',
  invoiceDate: new Date().toISOString().slice(0, 10),
  invoiceNumber: '', netAmount: 0, vatAmount: 0, totalAmount: 0,
  vatRate: 5, vatTreatment: 'Standard', recoverableVAT: 0, nonRecoverableVAT: 0,
  paymentStatus: 'Unpaid', approvalStatus: 'Pending', approvedBy: null, approvedAt: null,
  category: 'General', notes: '', fileUrl: null, status: 'Pending',
};

export default function PurchaseInvoicesClient({ invoices: init }: { invoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(init);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ ...EMPTY, invoiceDate: new Date().toISOString().slice(0, 10) });
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewItems, setViewItems] = useState<Invoice | null>(null);
  const [viewDetail, setViewDetail] = useState<Invoice | null>(null);

  const openAdd = () => { setForm({ ...EMPTY, invoiceDate: new Date().toISOString().slice(0, 10) }); setEditing(null); setModal('add'); };
  const openEdit = (inv: Invoice) => { setForm({ ...inv, invoiceDate: inv.invoiceDate.slice(0, 10) }); setEditing(inv); setModal('edit'); };

  const calcVAT = (net: number, rate: number, treatment: string) => {
    if (treatment !== 'Standard') return { vatAmount: 0, totalAmount: net, recoverableVAT: 0, nonRecoverableVAT: 0 };
    const vat = parseFloat((net * rate / 100).toFixed(2));
    return { vatAmount: vat, totalAmount: parseFloat((net + vat).toFixed(2)), recoverableVAT: vat, nonRecoverableVAT: 0 };
  };

  const handleNetChange = (val: string) => {
    const net = parseFloat(val) || 0;
    const { vatAmount, totalAmount, recoverableVAT, nonRecoverableVAT } = calcVAT(net, form.vatRate, form.vatTreatment);
    setForm(f => ({ ...f, netAmount: net, vatAmount, totalAmount, recoverableVAT, nonRecoverableVAT }));
  };

  const validateTRN = (trn: string) => /^\d{15}$/.test(trn);

  const handleSave = async () => {
    if (!form.supplierName) return alert('Supplier name is required');
    if (form.supplierTRN && !validateTRN(form.supplierTRN)) return alert('TRN must be exactly 15 digits');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/purchase-invoices', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editing ? { id: editing.id } : {}), ...form }),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      if (editing) setInvoices(v => v.map(i => i.id === saved.id ? saved : i));
      else setInvoices(v => [saved, ...v]);
      setModal(null);
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleQuickApprove = async (inv: Invoice, status: 'Approved' | 'Rejected') => {
    if (!confirm(`${status} this invoice?`)) return;
    const res = await fetch('/api/admin/purchase-invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inv, approvalStatus: status, invoiceDate: inv.invoiceDate.slice(0, 10) }),
    });
    if (res.ok) {
      const saved = await res.json();
      setInvoices(v => v.map(i => i.id === saved.id ? saved : i));
      if (viewDetail?.id === saved.id) setViewDetail(saved);
    }
  };

  const handlePrint = (inv: Invoice) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(iframe); return; }

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' });
    const fmtMoney = (n: number) => n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const date  = fmtDate(inv.invoiceDate);
    const today = new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' });
    const origin = window.location.origin;

    const aStatus = inv.approvalStatus;
    const pStatus = inv.paymentStatus;
    const aColor = aStatus === 'Approved' ? '#166534' : aStatus === 'Rejected' ? '#991b1b' : '#92400e';
    const aBg    = aStatus === 'Approved' ? '#dcfce7' : aStatus === 'Rejected' ? '#fee2e2'  : '#fef3c7';
    const pColor = pStatus === 'Paid' ? '#166534' : pStatus === 'PartiallyPaid' ? '#92400e' : '#991b1b';
    const pBg    = pStatus === 'Paid' ? '#dcfce7' : pStatus === 'PartiallyPaid' ? '#fef3c7' : '#fee2e2';

    let itemRows = '';
    if (inv.items.length > 0) {
      itemRows = inv.items.map((it, i) =>
        '<tr style="background:' + (i % 2 === 0 ? '#ffffff' : '#f8fafc') + '">' +
          '<td style="padding:9px 12px;font-size:12px;color:#1e293b;border-bottom:1px solid #f1f5f9">' + (it.description || '—') + '</td>' +
          '<td style="padding:9px 12px;font-size:12px;text-align:right;color:#475569;border-bottom:1px solid #f1f5f9">' + it.quantity + '</td>' +
          '<td style="padding:9px 12px;font-size:12px;text-align:right;color:#475569;border-bottom:1px solid #f1f5f9">' + fmtMoney(it.unitPrice) + '</td>' +
          '<td style="padding:9px 12px;font-size:12px;text-align:right;color:#7c3aed;border-bottom:1px solid #f1f5f9">' + fmtMoney(it.vatAmount) + '</td>' +
          '<td style="padding:9px 12px;font-size:12px;text-align:right;font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9">' + fmtMoney(it.total) + '</td>' +
        '</tr>'
      ).join('');
    }

    const itemsSection = inv.items.length > 0
      ? '<div style="margin-top:22px">' +
          '<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">Line Items</div>' +
          '<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">' +
            '<thead>' +
              '<tr style="background:#0a1628">' +
                '<th style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#fff;text-align:left">Description</th>' +
                '<th style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#fff;text-align:right;width:60px">Qty</th>' +
                '<th style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#cbd5e1;text-align:right;width:130px">Unit Price (AED)</th>' +
                '<th style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#c4b5fd;text-align:right;width:110px">VAT (AED)</th>' +
                '<th style="padding:10px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#fbbf24;text-align:right;width:110px">Total (AED)</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + itemRows + '</tbody>' +
            '<tfoot>' +
              '<tr style="background:#f8fafc">' +
                '<td colspan="3" style="padding:9px 12px"></td>' +
                '<td style="padding:9px 12px;font-size:11px;font-weight:600;color:#64748b;text-align:right;border-top:2px solid #e2e8f0">VAT Total</td>' +
                '<td style="padding:9px 12px;font-size:13px;font-weight:700;color:#7c3aed;text-align:right;border-top:2px solid #e2e8f0">AED ' + fmtMoney(inv.vatAmount) + '</td>' +
              '</tr>' +
              '<tr style="background:#fff5f5">' +
                '<td colspan="3" style="padding:10px 12px"></td>' +
                '<td style="padding:10px 12px;font-size:12px;font-weight:700;color:#c8102e;text-align:right;border-top:2px solid #c8102e">TOTAL DUE</td>' +
                '<td style="padding:10px 12px;font-size:16px;font-weight:900;color:#c8102e;text-align:right;border-top:2px solid #c8102e">AED ' + fmtMoney(inv.totalAmount) + '</td>' +
              '</tr>' +
            '</tfoot>' +
          '</table>' +
        '</div>'
      : '<div style="margin-top:22px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:16px;text-align:center;color:#94a3b8;font-size:12px">No line items recorded for this invoice.</div>';

    const notesSection = inv.notes
      ? '<div style="margin-top:18px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:6px;padding:12px 16px">' +
          '<div style="font-size:9px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Notes &amp; Remarks</div>' +
          '<div style="font-size:12px;color:#78350f;line-height:1.6">' + inv.notes + '</div>' +
        '</div>'
      : '';

    const html =
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>' +
      '<title>Purchase Invoice ' + inv.invoiceRef + '</title>' +
      '<style>' +
        '*{box-sizing:border-box;margin:0;padding:0}' +
        'body{font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;background:#fff;color:#0f172a;font-size:13px;line-height:1.5}' +
        '.page{max-width:820px;margin:0 auto}' +
        '@media print{' +
          'body{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
          '.page{max-width:100%}' +
          '.no-print{display:none}' +
        '}' +
      '</style></head><body>' +

      '<div class="page">' +

        // ── Navy top bar ──
        '<div style="background:#0a1628;padding:18px 40px;display:flex;align-items:center;justify-content:space-between">' +
          '<div style="display:flex;align-items:center;gap:14px">' +
            '<img src="' + origin + '/logo.svg" style="height:64px;width:auto;object-fit:contain" alt="AGC" ' +
              'onerror="this.style.display=\'none\';document.getElementById(\'agc-fb\').style.display=\'flex\'"/>' +
            '<div id="agc-fb" style="display:none;width:52px;height:60px;background:#c8102e;border-radius:8px;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:900">AGC</div>' +
            '<div>' +
              '<div style="color:#ffffff;font-size:16px;font-weight:800;line-height:1.25">Al Ghawas Air Con &amp; Refrigeration</div>' +
              '<div style="color:#94a3b8;font-size:10px;margin-top:4px;line-height:1.7">' +
                'Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE<br/>' +
                'Tel: +971-50-672-5808 &nbsp;·&nbsp; info@alghawasac.com &nbsp;·&nbsp; www.alghawasac.com' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div style="color:#c8102e;font-size:26px;font-weight:900;line-height:1;letter-spacing:-0.5px">PURCHASE</div>' +
            '<div style="color:#c8102e;font-size:26px;font-weight:900;line-height:1;letter-spacing:-0.5px">INVOICE</div>' +
            '<div style="color:#e2e8f0;font-size:13px;font-weight:700;margin-top:6px;font-family:monospace">' + inv.invoiceRef + '</div>' +
            '<div style="color:#64748b;font-size:10px;margin-top:3px">Printed: ' + today + '</div>' +
          '</div>' +
        '</div>' +

        // ── Red accent line ──
        '<div style="height:4px;background:linear-gradient(90deg,#c8102e 0%,#0a1628 100%)"></div>' +

        '<div style="padding:28px 40px">' +

          // ── Status badges + TRN row ──
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">' +
            '<div style="font-size:10px;color:#64748b">TRN: <strong style="color:#0a1628">[Your Company TRN]</strong> &nbsp;·&nbsp; VAT Registered &nbsp;·&nbsp; Est. 2005</div>' +
            '<div style="display:flex;gap:8px">' +
              '<span style="padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px;background:' + aBg + ';color:' + aColor + ';border:1px solid ' + aColor + '">' + aStatus + '</span>' +
              '<span style="padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px;background:' + pBg + ';color:' + pColor + ';border:1px solid ' + pColor + '">' + pStatus + '</span>' +
            '</div>' +
          '</div>' +

          // ── Two-column info ──
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px">' +

            '<div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0">' +
              '<div style="font-size:9px;font-weight:700;color:#c8102e;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0">Supplier Details</div>' +
              '<table style="width:100%;border-collapse:collapse">' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0;width:45%">Supplier Name</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right">' + inv.supplierName + '</td></tr>' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">Supplier TRN</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right;font-family:monospace">' + (inv.supplierTRN || '— Not Provided') + '</td></tr>' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">TRN Verified</td><td style="font-size:11px;font-weight:600;color:' + (inv.trnVerified === 'Verified' ? '#166534' : '#92400e') + ';text-align:right">' + (inv.trnVerified || 'Not Verified') + '</td></tr>' +
                (inv.invoiceNumber ? '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">Invoice #</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right;font-family:monospace">' + inv.invoiceNumber + '</td></tr>' : '') +
              '</table>' +
            '</div>' +

            '<div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0">' +
              '<div style="font-size:9px;font-weight:700;color:#c8102e;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0">Invoice Details</div>' +
              '<table style="width:100%;border-collapse:collapse">' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0;width:45%">Invoice Date</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right">' + date + '</td></tr>' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">Category</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right">' + inv.category + '</td></tr>' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">VAT Treatment</td><td style="font-size:11px;font-weight:600;color:#0f172a;text-align:right">' + inv.vatTreatment + '</td></tr>' +
                '<tr><td style="font-size:11px;color:#94a3b8;padding:4px 0">Payment Status</td><td style="font-size:11px;font-weight:700;color:' + pColor + ';text-align:right">' + pStatus + '</td></tr>' +
              '</table>' +
            '</div>' +

          '</div>' +

          // ── Financial summary ──
          '<div style="background:#0a1628;border-radius:12px;padding:20px 24px;margin-bottom:16px">' +
            '<div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:14px">Financial Summary</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1.4fr;gap:0">' +

              '<div style="padding:0 20px 0 0;border-right:1px solid rgba(255,255,255,.1)">' +
                '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Net Amount</div>' +
                '<div style="font-size:18px;font-weight:800;color:#f1f5f9">AED ' + fmtMoney(inv.netAmount) + '</div>' +
                '<div style="font-size:9px;color:#64748b;margin-top:2px">Before VAT</div>' +
              '</div>' +

              '<div style="padding:0 20px;border-right:1px solid rgba(255,255,255,.1)">' +
                '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">VAT Rate</div>' +
                '<div style="font-size:18px;font-weight:800;color:#c4b5fd">' + inv.vatRate + '%</div>' +
                '<div style="font-size:9px;color:#64748b;margin-top:2px">' + inv.vatTreatment + '</div>' +
              '</div>' +

              '<div style="padding:0 20px;border-right:1px solid rgba(255,255,255,.1)">' +
                '<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">VAT Amount</div>' +
                '<div style="font-size:18px;font-weight:800;color:#c4b5fd">AED ' + fmtMoney(inv.vatAmount) + '</div>' +
                '<div style="font-size:9px;color:#64748b;margin-top:2px">Input Tax</div>' +
              '</div>' +

              '<div style="padding:0 0 0 20px;background:rgba(200,16,46,.15);margin:-20px -24px -20px 0;padding:20px 24px 20px 20px;border-radius:0 12px 12px 0">' +
                '<div style="font-size:10px;color:#fca5a5;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Total Amount</div>' +
                '<div style="font-size:22px;font-weight:900;color:#ffffff">AED ' + fmtMoney(inv.totalAmount) + '</div>' +
                '<div style="font-size:9px;color:#fca5a5;margin-top:2px">Including VAT</div>' +
              '</div>' +

            '</div>' +
          '</div>' +

          // ── VAT Recovery bar ──
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px">' +
            '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px">' +
              '<div style="font-size:9px;color:#15803d;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Recoverable VAT</div>' +
              '<div style="font-size:14px;font-weight:700;color:#166534;margin-top:2px">AED ' + inv.recoverableVAT.toFixed(2) + '</div>' +
            '</div>' +
            '<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:10px 14px">' +
              '<div style="font-size:9px;color:#dc2626;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Non-Recoverable VAT</div>' +
              '<div style="font-size:14px;font-weight:700;color:#991b1b;margin-top:2px">AED ' + inv.nonRecoverableVAT.toFixed(2) + '</div>' +
            '</div>' +
            '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px">' +
              '<div style="font-size:9px;color:#2563eb;text-transform:uppercase;letter-spacing:.5px;font-weight:600">Net VAT Claim</div>' +
              '<div style="font-size:14px;font-weight:700;color:#1d4ed8;margin-top:2px">AED ' + (inv.recoverableVAT - inv.nonRecoverableVAT).toFixed(2) + '</div>' +
            '</div>' +
          '</div>' +

          itemsSection +
          notesSection +

          // ── Footer ──
          '<div style="margin-top:28px;padding-top:18px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end">' +
            '<div>' +
              '<div style="font-size:10px;color:#64748b;line-height:1.8">' +
                'Al Ghawas Air Con &amp; Refrigeration Contracting LLC<br/>' +
                'Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE<br/>' +
                'Tel: +971-50-672-5808 &nbsp;·&nbsp; info@alghawasac.com' +
              '</div>' +
              '<div style="font-size:8px;color:#cbd5e1;text-transform:uppercase;letter-spacing:2px;margin-top:5px">VAT REGISTERED · UAE FEDERAL TAX AUTHORITY · EST. 2005</div>' +
            '</div>' +
            '<div style="text-align:right;min-width:180px">' +
              '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;margin-bottom:12px">' +
                '<div style="font-size:9px;font-weight:700;color:#0a1628;text-transform:uppercase;letter-spacing:.8px">Approval Status</div>' +
                '<div style="font-size:15px;font-weight:800;color:' + aColor + ';margin-top:3px">' + aStatus + '</div>' +
                (inv.approvedBy
                  ? '<div style="font-size:10px;color:#64748b;margin-top:2px">By: ' + inv.approvedBy + '</div>'
                  : '<div style="font-size:10px;color:#94a3b8;margin-top:2px">Awaiting approval</div>') +
                (inv.approvedAt
                  ? '<div style="font-size:10px;color:#94a3b8">' + fmtDate(inv.approvedAt) + '</div>'
                  : '') +
              '</div>' +
              '<div style="border-top:1px solid #0a1628;padding-top:6px;font-size:10px;color:#64748b">________________________<br/>Authorized Signature</div>' +
            '</div>' +
          '</div>' +

        '</div>' + // padding wrapper
      '</div>' + // .page
      '</body></html>';

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 2000);
    }, 500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    await fetch(`/api/admin/purchase-invoices?id=${id}`, { method: 'DELETE' });
    setInvoices(v => v.filter(i => i.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/invoice-upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm(f => ({ ...f, fileUrl: url }));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Upload failed');
      }
    } catch { alert('Upload error — check connection'); }
    finally { setUploadingFile(false); e.target.value = ''; }
  };

  const filtered = invoices.filter(i => {
    const q = filter.toLowerCase();
    const matchSearch = !q || i.supplierName.toLowerCase().includes(q) || (i.invoiceNumber ?? '').toLowerCase().includes(q) || i.invoiceRef.toLowerCase().includes(q);
    const matchStatus = !statusFilter || i.approvalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totals = filtered.reduce((a, i) => ({ net: a.net + i.netAmount, vat: a.vat + i.vatAmount, total: a.total + i.totalAmount }), { net: 0, vat: 0, total: 0 });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Supplier invoices for input VAT recovery</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Add Invoice
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Net Amount', value: FMT(totals.net) }, { label: 'Input VAT', value: FMT(totals.vat) }, { label: 'Total Amount', value: FMT(totals.total) }].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search supplier, invoice #..."
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left w-28">Ref / Date</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-right w-36">Amount (AED)</th>
              <th className="px-4 py-3 text-center w-24">Approval</th>
              <th className="px-4 py-3 text-center w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No invoices found</td></tr>
            )}
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">

                {/* Ref + Date */}
                <td className="px-4 py-3">
                  <div className="font-mono text-xs font-bold text-blue-600">{inv.invoiceRef}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(inv.invoiceDate).toLocaleDateString('en-AE')}</div>
                </td>

                {/* Supplier + TRN */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 text-sm">{inv.supplierName}</div>
                  <div className="text-xs mt-0.5">
                    {inv.supplierTRN
                      ? <span className={`font-mono ${validateTRN(inv.supplierTRN) ? 'text-green-600' : 'text-red-500'}`}>TRN: {inv.supplierTRN}</span>
                      : <span className="text-gray-300">No TRN</span>}
                    {inv.invoiceNumber && <span className="text-gray-400 ml-2">#{inv.invoiceNumber}</span>}
                  </div>
                </td>

                {/* Amounts */}
                <td className="px-4 py-3 text-right">
                  <div className="font-bold text-gray-900 tabular-nums">
                    {inv.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-purple-500 tabular-nums mt-0.5">
                    VAT: {inv.vatAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </div>
                </td>

                {/* Approval badge */}
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    inv.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                    inv.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-700'}`}>
                    {inv.approvalStatus}
                  </span>
                </td>

                {/* Actions — always fully visible */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 flex-wrap justify-center">

                    {/* View detail */}
                    <button onClick={() => setViewDetail(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      <Eye className="w-3 h-3" /> View
                    </button>

                    {/* View document — always shown, greyed if no file */}
                    {inv.fileUrl ? (
                      <button onClick={() => { setViewDetail(inv); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                        <FileText className="w-3 h-3" /> Doc
                      </button>
                    ) : (
                      <button onClick={() => openEdit(inv)} title="Upload a document in Edit"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 hover:bg-violet-50 hover:text-violet-600 border border-dashed border-gray-300 transition-colors">
                        <Upload className="w-3 h-3" /> Doc
                      </button>
                    )}

                    {/* Edit */}
                    <button onClick={() => openEdit(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                      Edit
                    </button>

                    {/* Print */}
                    <button onClick={() => handlePrint(inv)} title="Print invoice"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Quick approve/reject */}
                    {inv.approvalStatus === 'Pending' && (
                      <button onClick={() => handleQuickApprove(inv, 'Approved')}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {inv.approvalStatus !== 'Rejected' && (
                      <button onClick={() => handleQuickApprove(inv, 'Rejected')}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button onClick={() => handleDelete(inv.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Purchase Invoice</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-medium">Supplier Name *</label>
                <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Supplier TRN (15 digits)</label>
                <input value={form.supplierTRN ?? ''} onChange={e => setForm(f => ({ ...f, supplierTRN: e.target.value }))}
                  maxLength={15} className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${form.supplierTRN && !validateTRN(form.supplierTRN) ? 'border-red-400' : 'border-gray-300'}`} />
                {form.supplierTRN && !validateTRN(form.supplierTRN) && <p className="text-xs text-red-500 mt-0.5">Must be exactly 15 digits</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Invoice Number</label>
                <input value={form.invoiceNumber ?? ''} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Invoice Date</label>
                <input type="date" value={form.invoiceDate.slice(0, 10)} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Treatment</label>
                <select value={form.vatTreatment} onChange={e => setForm(f => ({ ...f, vatTreatment: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {VAT_TREATMENTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Net Amount (AED)</label>
                <input type="number" step="0.01" value={form.netAmount || ''}
                  onChange={e => handleNetChange(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Rate %</label>
                <input type="number" step="0.01" value={form.vatRate}
                  onChange={e => { const r = parseFloat(e.target.value) || 0; setForm(f => { const c = calcVAT(f.netAmount, r, f.vatTreatment); return { ...f, vatRate: r, ...c }; }); }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Amount (AED)</label>
                <input type="number" step="0.01" value={form.vatAmount}
                  onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, vatAmount: v, totalAmount: parseFloat((f.netAmount + v).toFixed(2)), recoverableVAT: v })); }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Total Amount (AED)</label>
                <input type="number" step="0.01" value={form.totalAmount}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700" readOnly />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Payment Status</label>
                <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option>Unpaid</option><option>Paid</option><option>PartiallyPaid</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Approval Status</label>
                <select value={form.approvalStatus} onChange={e => setForm(f => ({ ...f, approvalStatus: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option>Pending</option><option>Approved</option><option>Rejected</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-medium">Attach Invoice Document (PDF / Image)</label>
                {form.fileUrl ? (
                  <div className="mt-1 flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                    <a href={form.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-violet-700 font-medium underline truncate flex-1">
                      {form.fileUrl.split('/').pop()}
                    </a>
                    <button type="button" onClick={() => setForm(f => ({ ...f, fileUrl: null }))}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className={`mt-1 flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors ${uploadingFile ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                    <Upload className={`w-4 h-4 ${uploadingFile ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                    <span className="text-xs text-gray-500">
                      {uploadingFile ? 'Uploading...' : 'Click to upload PDF or image (max 20 MB)'}
                    </span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                      disabled={uploadingFile} onChange={handleFileUpload} />
                  </label>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-medium">Notes</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Math check */}
            {form.netAmount > 0 && Math.abs((form.netAmount + form.vatAmount) - form.totalAmount) > 0.01 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                ⚠️ Math check: Net ({form.netAmount}) + VAT ({form.vatAmount}) ≠ Total ({form.totalAmount})
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors">
                {saving ? 'Saving...' : editing ? 'Update Invoice' : 'Save Invoice'}
              </button>
              <button onClick={() => setModal(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail view modal */}
      {viewDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-blue-600 font-bold text-lg">{viewDetail.invoiceRef}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${viewDetail.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' : viewDetail.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {viewDetail.approvalStatus}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${viewDetail.paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {viewDetail.paymentStatus}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{viewDetail.supplierName}</p>
              </div>
              <button onClick={() => setViewDetail(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Supplier + Invoice info */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Supplier Name', value: viewDetail.supplierName },
                  { label: 'Supplier TRN', value: viewDetail.supplierTRN || '— Not provided' },
                  { label: 'Invoice Number', value: viewDetail.invoiceNumber || '—' },
                  { label: 'Invoice Date', value: new Date(viewDetail.invoiceDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  { label: 'Category', value: viewDetail.category },
                  { label: 'VAT Treatment', value: viewDetail.vatTreatment },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-gray-800">{value}</div>
                  </div>
                ))}
              </div>

              {/* Financial breakdown */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Financial Breakdown</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Net Amount</div>
                    <div className="font-bold text-gray-900">AED {viewDetail.netAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center border-x border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">VAT ({viewDetail.vatRate}%)</div>
                    <div className="font-bold text-purple-600">AED {viewDetail.vatAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Total</div>
                    <div className="font-bold text-blue-700 text-lg">AED {viewDetail.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recoverable VAT</span>
                    <span className="font-semibold text-green-700">AED {viewDetail.recoverableVAT.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Non-Recoverable VAT</span>
                    <span className="font-semibold text-red-500">AED {viewDetail.nonRecoverableVAT.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {viewDetail.items.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Line Items</h3>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">VAT</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {viewDetail.items.map(it => (
                          <tr key={it.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{it.description}</td>
                            <td className="px-3 py-2 text-right">{it.quantity}</td>
                            <td className="px-3 py-2 text-right">{it.unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right text-purple-600">{it.vatAmount.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-bold">{it.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewDetail.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="text-xs text-amber-600 font-semibold uppercase mb-1">Notes</div>
                  <p className="text-sm text-gray-700">{viewDetail.notes}</p>
                </div>
              )}

              {/* Document viewer */}
              {viewDetail.fileUrl && (() => {
                const url = viewDetail.fileUrl;
                const isPDF = /\.pdf$/i.test(url);
                const isImage = /\.(jpe?g|png|webp|gif)$/i.test(url);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">
                        {isPDF ? '📄 Attached PDF' : isImage ? '🖼️ Attached Image' : '📎 Attached Document'}
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 underline">
                        <ExternalLink className="w-3 h-3" /> Open in new tab
                      </a>
                    </div>
                    {isPDF ? (
                      <iframe src={url} title="Invoice PDF" className="w-full rounded-xl border border-violet-100 bg-gray-50" style={{ height: '480px' }} />
                    ) : isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="Invoice attachment" className="w-full max-h-96 object-contain rounded-xl border border-violet-100 bg-gray-50" />
                    ) : (
                      <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span className="text-xs text-gray-600 truncate flex-1">{url.split('/').pop()}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {viewDetail.approvalStatus !== 'Approved' && (
                  <button onClick={() => handleQuickApprove(viewDetail, 'Approved')}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                {viewDetail.approvalStatus !== 'Rejected' && (
                  <button onClick={() => handleQuickApprove(viewDetail, 'Rejected')}
                    className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
                <button onClick={() => { setViewDetail(null); openEdit(viewDetail); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Edit Invoice
                </button>
                <button onClick={() => handlePrint(viewDetail)}
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm px-4 py-2 rounded-xl transition-colors">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => setViewDetail(null)}
                  className="ml-auto text-sm text-gray-400 hover:text-gray-600 px-3 py-2">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items modal */}
      {viewItems && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{viewItems.invoiceRef} — Line Items</h2>
              <button onClick={() => setViewItems(null)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {viewItems.items.length === 0 ? (
              <p className="text-sm text-gray-400">No line items recorded</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">VAT</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewItems.items.map(it => (
                    <tr key={it.id}>
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2 text-right">{it.quantity}</td>
                      <td className="px-3 py-2 text-right">{it.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{it.vatAmount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

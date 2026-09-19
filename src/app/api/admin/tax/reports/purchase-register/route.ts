import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoices = await prisma.purchaseInvoice.findMany({
    where: { deletedAt: null },
    orderBy: { invoiceDate: 'asc' },
    include: { items: true },
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Al Ghawas Tax System';
  const ws = wb.addWorksheet('Purchase Invoice Register');

  ws.columns = [
    { header: 'Ref', key: 'ref', width: 12 },
    { header: 'Invoice #', key: 'invNum', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Supplier', key: 'supplier', width: 30 },
    { header: 'Supplier TRN', key: 'trn', width: 18 },
    { header: 'Category', key: 'cat', width: 14 },
    { header: 'VAT Treatment', key: 'vatTx', width: 15 },
    { header: 'Net (AED)', key: 'net', width: 14 },
    { header: 'VAT (AED)', key: 'vat', width: 14 },
    { header: 'Total (AED)', key: 'total', width: 14 },
    { header: 'Recoverable VAT', key: 'recov', width: 16 },
    { header: 'Approval Status', key: 'approval', width: 15 },
    { header: 'Payment Status', key: 'payment', width: 14 },
  ];

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const inv of invoices) {
    ws.addRow({
      ref: inv.invoiceRef,
      invNum: inv.invoiceNumber ?? '',
      date: new Date(inv.invoiceDate).toLocaleDateString('en-AE'),
      supplier: inv.supplierName,
      trn: inv.supplierTRN ?? '',
      cat: inv.category,
      vatTx: inv.vatTreatment,
      net: inv.netAmount,
      vat: inv.vatAmount,
      total: inv.totalAmount,
      recov: inv.recoverableVAT,
      approval: inv.approvalStatus,
      payment: inv.paymentStatus,
    });
  }

  // Totals row
  const lastRow = ws.lastRow?.number ?? 1;
  ws.addRow({
    ref: 'TOTAL',
    net: invoices.reduce((s, i) => s + i.netAmount, 0),
    vat: invoices.reduce((s, i) => s + i.vatAmount, 0),
    total: invoices.reduce((s, i) => s + i.totalAmount, 0),
    recov: invoices.reduce((s, i) => s + i.recoverableVAT, 0),
  });
  ws.lastRow!.font = { bold: true };
  ws.lastRow!.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="purchase-register-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

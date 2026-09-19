import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoices = await prisma.taxSalesInvoice.findMany({
    where: { deletedAt: null },
    orderBy: { invoiceDate: 'asc' },
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Al Ghawas Tax System';
  const ws = wb.addWorksheet('Sales Invoice Register');

  ws.columns = [
    { header: 'Ref', key: 'ref', width: 12 },
    { header: 'Invoice #', key: 'invNum', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Customer', key: 'customer', width: 30 },
    { header: 'Customer TRN', key: 'trn', width: 18 },
    { header: 'Service Type', key: 'svc', width: 16 },
    { header: 'VAT Treatment', key: 'vatTx', width: 15 },
    { header: 'Net (AED)', key: 'net', width: 14 },
    { header: 'VAT (AED)', key: 'vat', width: 14 },
    { header: 'Total (AED)', key: 'total', width: 14 },
    { header: 'Payment Status', key: 'payment', width: 14 },
    { header: 'Approval Status', key: 'approval', width: 15 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };

  for (const inv of invoices) {
    ws.addRow({
      ref: inv.invoiceRef,
      invNum: inv.invoiceNumber,
      date: new Date(inv.invoiceDate).toLocaleDateString('en-AE'),
      customer: inv.customerName,
      trn: inv.customerTRN ?? '',
      svc: inv.serviceType,
      vatTx: inv.vatTreatment,
      net: inv.netAmount,
      vat: inv.vatAmount,
      total: inv.totalAmount,
      payment: inv.paymentStatus,
      approval: inv.approvalStatus,
    });
  }

  ws.addRow({
    ref: 'TOTAL',
    net: invoices.reduce((s, i) => s + i.netAmount, 0),
    vat: invoices.reduce((s, i) => s + i.vatAmount, 0),
    total: invoices.reduce((s, i) => s + i.totalAmount, 0),
  });
  ws.lastRow!.font = { bold: true };
  ws.lastRow!.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sales-register-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

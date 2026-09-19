import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const returns = await prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('VAT Returns');

  ws.columns = [
    { header: 'Period', key: 'period', width: 14 },
    { header: 'Start Date', key: 'start', width: 13 },
    { header: 'End Date', key: 'end', width: 13 },
    { header: 'Standard Sales', key: 'stdSales', width: 16 },
    { header: 'Zero Rated Sales', key: 'zeroSales', width: 16 },
    { header: 'Output VAT', key: 'outputVAT', width: 13 },
    { header: 'Standard Purchases', key: 'stdPurch', width: 18 },
    { header: 'Input VAT (Recoverable)', key: 'inputVAT', width: 22 },
    { header: 'Adjustments', key: 'adj', width: 13 },
    { header: 'Net VAT Due', key: 'netVAT', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'FTA Ref', key: 'ftaRef', width: 20 },
    { header: 'Submitted At', key: 'submittedAt', width: 16 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };

  for (const r of returns) {
    ws.addRow({
      period: r.period,
      start: new Date(r.startDate).toLocaleDateString('en-AE'),
      end: new Date(r.endDate).toLocaleDateString('en-AE'),
      stdSales: r.standardSales, zeroSales: r.zeroRatedSales,
      outputVAT: r.outputVAT, stdPurch: r.standardPurchases,
      inputVAT: r.recoverableInput, adj: r.adjustments,
      netVAT: r.netVAT, status: r.status,
      ftaRef: r.ftaRefNumber ?? '',
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-AE') : '',
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="vat-returns-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

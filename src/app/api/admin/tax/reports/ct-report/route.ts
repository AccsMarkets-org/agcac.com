import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const returns = await prisma.corporateTaxReturn.findMany({ orderBy: { financialYear: 'desc' } });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Corporate Tax Returns');

  ws.columns = [
    { header: 'FY', key: 'fy', width: 8 },
    { header: 'Year Start', key: 'yStart', width: 12 },
    { header: 'Year End', key: 'yEnd', width: 12 },
    { header: 'Revenue', key: 'rev', width: 14 },
    { header: 'Cost of Sales', key: 'cos', width: 14 },
    { header: 'Gross Profit', key: 'gp', width: 14 },
    { header: 'Operating Expenses', key: 'opex', width: 18 },
    { header: 'Accounting Net Profit', key: 'anp', width: 22 },
    { header: 'Non-Deductible Exp', key: 'nde', width: 18 },
    { header: 'Taxable Income', key: 'ti', width: 15 },
    { header: 'Taxable @ 0% (up to 375k)', key: 't0', width: 22 },
    { header: 'Taxable @ 9%', key: 't9pct', width: 13 },
    { header: 'CT @ 9%', key: 'ct9', width: 12 },
    { header: 'Credits', key: 'cred', width: 10 },
    { header: 'Net CT Payable', key: 'netCT', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'FTA Ref', key: 'ftaRef', width: 20 },
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B21A8' } };

  for (const r of returns) {
    ws.addRow({
      fy: r.financialYear,
      yStart: new Date(r.yearStart).toLocaleDateString('en-AE'),
      yEnd: new Date(r.yearEnd).toLocaleDateString('en-AE'),
      rev: r.revenue, cos: r.costOfSales, gp: r.grossProfit,
      opex: r.operatingExpenses, anp: r.accountingNetProfit,
      nde: r.nonDeductibleExpenses, ti: r.taxableIncome,
      t0: r.taxableUpTo375k, t9pct: r.taxableAbove375k,
      ct9: r.ctAt9Pct, cred: r.creditsPayments, netCT: r.netCTPayable,
      status: r.status, ftaRef: r.ftaRefNumber ?? '',
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ct-report-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

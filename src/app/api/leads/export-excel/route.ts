import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Al Ghawas A/C Refrigeration Contracting LLC';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Leads', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  sheet.columns = [
    { header: 'Lead ID',       key: 'leadId',       width: 12 },
    { header: 'Date',          key: 'date',          width: 14 },
    { header: 'Name',          key: 'name',          width: 22 },
    { header: 'Phone',         key: 'phone',         width: 16 },
    { header: 'Email',         key: 'email',         width: 26 },
    { header: 'Location',      key: 'location',      width: 20 },
    { header: 'Service',       key: 'service',       width: 24 },
    { header: 'Property Type', key: 'propertyType',  width: 16 },
    { header: 'Urgency',       key: 'urgency',       width: 12 },
    { header: 'Priority',      key: 'priority',      width: 10 },
    { header: 'Status',        key: 'status',        width: 14 },
    { header: 'Source Page',   key: 'sourcePage',    width: 18 },
    { header: 'Lead Source',   key: 'leadSource',    width: 14 },
    { header: 'UTM Source',    key: 'utmSource',     width: 15 },
    { header: 'UTM Medium',    key: 'utmMedium',     width: 15 },
    { header: 'UTM Campaign',  key: 'utmCampaign',   width: 20 },
    { header: 'Device',        key: 'deviceType',    width: 10 },
    { header: 'Message',       key: 'message',       width: 38 },
    { header: 'Internal Notes',key: 'internalNotes', width: 30 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A1628' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;

  const statusColors: Record<string, string> = {
    New: 'FF3B82F6', Contacted: 'FFF59E0B', Quoted: 'FF8B5CF6',
    Won: 'FF22C55E', Lost: 'FFEF4444',
  };

  leads.forEach((lead, idx) => {
    const row = sheet.addRow({
      leadId:       lead.leadId,
      date:         lead.createdAt.toLocaleDateString('en-GB'),
      name:         lead.name,
      phone:        lead.phone,
      email:        lead.email ?? '',
      location:     lead.location ?? '',
      service:      lead.service,
      propertyType: lead.propertyType ?? '',
      urgency:      lead.urgency,
      priority:     lead.priority,
      status:       lead.status,
      sourcePage:   lead.sourcePage ?? '',
      leadSource:   lead.leadSource ?? '',
      utmSource:    lead.utmSource ?? '',
      utmMedium:    lead.utmMedium ?? '',
      utmCampaign:  lead.utmCampaign ?? '',
      deviceType:   lead.deviceType ?? '',
      message:      lead.message ?? '',
      internalNotes: lead.internalNotes ?? '',
    });

    if (idx % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }

    const sc = statusColors[lead.status];
    if (sc) {
      const cell = row.getCell('status');
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }

    // Red for emergency urgency
    if (lead.urgency === 'Emergency') {
      const cell = row.getCell('urgency');
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }

    row.alignment = { vertical: 'middle', wrapText: false };
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'S1' };

  const filename = `AlGhawas_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

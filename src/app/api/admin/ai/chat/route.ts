import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseChatQuery } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { message: string; sessionId?: string };
  const { message, sessionId } = body;
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  // Role-based data access — case-insensitive, matches 'Tax Manager' and 'TaxManager'
  const isTaxRole = ['superadmin', 'admin', 'accountant', 'tax manager', 'taxmanager'].includes(auth.role.toLowerCase());

  // Get or create session
  let session = sessionId
    ? await prisma.aIChatSession.findFirst({ where: { sessionId } })
    : null;

  if (!session) {
    session = await prisma.aIChatSession.create({
      data: {
        sessionId: `CHAT-${uuidv4().substring(0, 8).toUpperCase()}`,
        userId: auth.userId,
        userEmail: auth.email,
        userRole: auth.role,
        title: message.substring(0, 50),
      },
    });
  }

  // Save user message
  await prisma.aIChatMessage.create({
    data: { sessionId: session.id, role: 'user', content: message },
  });

  // Parse query intent
  const { type, params } = parseChatQuery(message);
  let response = '';
  let dataUsed = '';

  try {
    switch (type) {
      case 'greeting': {
        response = `Hello! I'm the Al Ghawas AI Copilot. I can help you with:\n\n• **Leads** — "Show today's new leads", "How many leads do we have?"\n• **Invoices** — "Which invoices are unpaid?", "Show purchase invoices", "How many purchase invoices?"\n• **VAT & Tax** — "What is VAT payable?", "Tax summary" *(accountant role required)*\n• **Compliance** — "Which invoices have missing TRN?", "Show duplicate warnings"\n• **Operations** — "Which quotes are not invoiced?", "Show expiring AMC contracts"\n• **AI Insights** — "Show AI suggestions"\n\nWhat would you like to know?`;
        dataUsed = 'none';
        break;
      }

      case 'leads_count': {
        const total = await prisma.lead.count({ where: { deletedAt: null } });
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayCount = await prisma.lead.count({ where: { createdAt: { gte: today }, deletedAt: null } });
        const newLeads = await prisma.lead.count({ where: { status: 'New', deletedAt: null } });
        response = `**Lead Summary:**\n\n• Total leads in system: **${total}**\n• New today: **${todayCount}**\n• Status "New" (uncontacted): **${newLeads}**`;
        dataUsed = 'Lead table';
        break;
      }

      case 'leads_summary': {
        const leads = await prisma.lead.findMany({
          where: { deletedAt: null },
          select: { name: true, service: true, status: true, urgency: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        const total = await prisma.lead.count({ where: { deletedAt: null } });
        response = leads.length === 0
          ? 'No leads found.'
          : `**${total} total leads** (showing latest ${leads.length}):\n\n${leads.map((l, i) => `${i + 1}. **${l.name}** — ${l.service} — ${l.status} (${l.urgency})`).join('\n')}`;
        dataUsed = 'Lead table';
        break;
      }

      case 'purchase_invoices_count': {
        if (!isTaxRole) { response = 'Access denied. Purchase invoice data requires Accountant or Admin role.'; break; }
        const total = await prisma.purchaseInvoice.count({ where: { deletedAt: null } });
        const agg = await prisma.purchaseInvoice.aggregate({
          _sum: { totalAmount: true, vatAmount: true },
          where: { deletedAt: null },
        });
        const pending = await prisma.purchaseInvoice.count({ where: { deletedAt: null, approvalStatus: 'Pending' } });
        response = `**Purchase Invoice Summary:**\n\n• Total invoices: **${total}**\n• Pending approval: **${pending}**\n• Total value: **AED ${(agg._sum.totalAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}**\n• Total input VAT: **AED ${(agg._sum.vatAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}**`;
        dataUsed = 'PurchaseInvoice table';
        break;
      }

      case 'purchase_invoices_list': {
        if (!isTaxRole) { response = 'Access denied. Purchase invoice data requires Accountant or Admin role.'; break; }
        const invoices = await prisma.purchaseInvoice.findMany({
          where: { deletedAt: null },
          select: { invoiceRef: true, supplierName: true, totalAmount: true, invoiceDate: true, approvalStatus: true },
          orderBy: { invoiceDate: 'desc' },
          take: 10,
        });
        const total = await prisma.purchaseInvoice.count({ where: { deletedAt: null } });
        response = invoices.length === 0
          ? 'No purchase invoices found.'
          : `**${total} purchase invoices** (latest ${invoices.length}):\n\n${invoices.map((inv, i) => `${i + 1}. **${inv.invoiceRef}** — ${inv.supplierName} — AED ${inv.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })} — ${inv.approvalStatus}`).join('\n')}`;
        dataUsed = 'PurchaseInvoice table';
        break;
      }

      case 'purchase_invoices_category': {
        if (!isTaxRole) { response = 'Access denied. Purchase invoice data requires Accountant or Admin role.'; break; }
        const category = params.category || 'General';
        const catInvoices = await prisma.purchaseInvoice.findMany({
          where: { deletedAt: null, category: { contains: category } },
          select: { invoiceRef: true, supplierName: true, totalAmount: true, invoiceDate: true },
          orderBy: { invoiceDate: 'desc' },
          take: 10,
        });
        response = catInvoices.length === 0
          ? `No purchase invoices found for category "${category}".`
          : `**${catInvoices.length} purchase invoices — ${category}:**\n\n${catInvoices.map((inv, i) => `${i + 1}. **${inv.invoiceRef}** — ${inv.supplierName} — AED ${inv.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`).join('\n')}`;
        dataUsed = 'PurchaseInvoice table';
        break;
      }

      case 'leads_today': {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const leads = await prisma.lead.findMany({
          where: { createdAt: { gte: today }, deletedAt: null },
          select: { name: true, phone: true, service: true, urgency: true, status: true, createdAt: true },
          take: 10,
        });
        response = leads.length === 0
          ? 'No new leads today.'
          : `**${leads.length} new leads today:**\n\n${leads.map((l, i) => `${i + 1}. **${l.name}** — ${l.service} (${l.urgency}) — ${l.status}`).join('\n')}`;
        dataUsed = 'Lead table';
        break;
      }

      case 'unpaid_invoices': {
        const invoices = await prisma.invoice.findMany({
          where: { status: 'Unpaid' },
          select: { invoiceId: true, customerName: true, dueDate: true, items: { select: { total: true } } },
          take: 15,
          orderBy: { dueDate: 'asc' },
        });
        const total = invoices.reduce((s, inv) => s + inv.items.reduce((si, it) => si + it.total, 0), 0);
        response = invoices.length === 0
          ? 'No unpaid invoices found.'
          : `**${invoices.length} unpaid invoices** (total outstanding: **AED ${total.toLocaleString('en-AE', { minimumFractionDigits: 2 })}**):\n\n${invoices.map((inv, i) => `${i + 1}. **${inv.invoiceId}** — ${inv.customerName}${inv.dueDate ? ` (due: ${inv.dueDate.toLocaleDateString('en-GB')})` : ''}`).join('\n')}`;
        dataUsed = 'Invoice table';
        break;
      }

      case 'vat_payable': {
        if (!isTaxRole) {
          response = 'Access denied. VAT data is restricted to Accountant, Tax Manager, and Admin roles.';
          break;
        }
        const vatReturn = await prisma.vATReturn.findFirst({
          where: { status: { not: 'Closed' } },
          orderBy: { createdAt: 'desc' },
        });
        if (!vatReturn) {
          response = 'No open VAT return found. Please create a VAT return period in the Tax module.';
        } else {
          response = `**VAT Position — ${vatReturn.period}**\n\n• Output VAT (Sales): **AED ${vatReturn.outputVAT.toLocaleString('en-AE', { minimumFractionDigits: 2 })}**\n• Input VAT (Purchases): **AED ${vatReturn.recoverableInput.toLocaleString('en-AE', { minimumFractionDigits: 2 })}**\n• **Net VAT Payable: AED ${vatReturn.netVAT.toLocaleString('en-AE', { minimumFractionDigits: 2 })}**\n\nStatus: **${vatReturn.status}**\n\n⚠️ *AI suggestions require accountant review before tax filing.*`;
        }
        dataUsed = 'VATReturn table';
        break;
      }

      case 'missing_trn': {
        if (!isTaxRole) { response = 'Access denied.'; break; }
        const missing = await prisma.purchaseInvoice.findMany({
          where: { OR: [{ supplierTRN: null }, { supplierTRN: '' }], deletedAt: null },
          select: { invoiceRef: true, supplierName: true, totalAmount: true },
          take: 20,
        });
        response = missing.length === 0
          ? 'All purchase invoices have supplier TRNs.'
          : `**${missing.length} purchase invoices missing TRN:**\n\n${missing.map((inv, i) => `${i + 1}. **${inv.invoiceRef}** — ${inv.supplierName} — AED ${inv.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`).join('\n')}\n\n⚠️ *Input VAT cannot be claimed without a valid TRN.*`;
        dataUsed = 'PurchaseInvoice table';
        break;
      }

      case 'duplicate_warnings': {
        const dupes = await prisma.aIAnomaly.findMany({
          where: { type: 'DuplicateInvoice', status: 'Open' },
          take: 10,
        });
        response = dupes.length === 0
          ? 'No duplicate invoice warnings at this time.'
          : `**${dupes.length} duplicate invoice warnings:**\n\n${dupes.map((d, i) => `${i + 1}. ${d.title}\n   ${d.description}`).join('\n\n')}`;
        dataUsed = 'AIAnomaly table';
        break;
      }

      case 'accepted_not_invoiced': {
        const quotes = await prisma.quotation.findMany({
          where: { status: 'Accepted' },
          select: { quoteId: true, customerName: true, createdAt: true },
          take: 10,
        });
        const unInvoiced: typeof quotes = [];
        for (const q of quotes) {
          const inv = await prisma.invoice.findFirst({ where: { quoteId: q.quoteId } });
          if (!inv) unInvoiced.push(q);
        }
        response = unInvoiced.length === 0
          ? 'All accepted quotations have been invoiced.'
          : `**${unInvoiced.length} accepted quotes not yet invoiced:**\n\n${unInvoiced.map((q, i) => `${i + 1}. **${q.quoteId}** — ${q.customerName} — accepted ${q.createdAt.toLocaleDateString('en-GB')}`).join('\n')}`;
        dataUsed = 'Quotation, Invoice tables';
        break;
      }

      case 'overdue_customers': {
        const overdue = await prisma.invoice.findMany({
          where: { status: 'Unpaid', dueDate: { lt: new Date() } },
          select: { invoiceId: true, customerName: true, dueDate: true },
          take: 15,
          orderBy: { dueDate: 'asc' },
        });
        response = overdue.length === 0
          ? 'No overdue customer invoices.'
          : `**${overdue.length} overdue invoices:**\n\n${overdue.map((inv, i) => `${i + 1}. **${inv.customerName}** — Invoice ${inv.invoiceId} — due ${inv.dueDate?.toLocaleDateString('en-GB') || 'N/A'}`).join('\n')}`;
        dataUsed = 'Invoice table';
        break;
      }

      case 'expiring_amc': {
        const expiring = await prisma.aMCContract.findMany({
          where: { status: 'Active', endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
          select: { amcId: true, customerName: true, endDate: true },
          take: 10,
        });
        response = expiring.length === 0
          ? 'No AMC contracts expiring in the next 30 days.'
          : `**${expiring.length} AMC contracts expiring within 30 days:**\n\n${expiring.map((a, i) => `${i + 1}. **${a.customerName}** — ${a.amcId} — expires ${a.endDate.toLocaleDateString('en-GB')}`).join('\n')}`;
        dataUsed = 'AMCContract table';
        break;
      }

      case 'ai_suggestions': {
        const suggestions = await prisma.aISuggestion.findMany({
          where: { status: 'Open' },
          orderBy: { riskLevel: 'desc' },
          take: 10,
        });
        response = suggestions.length === 0
          ? 'No open AI suggestions at this time.'
          : `**${suggestions.length} open AI suggestions:**\n\n${suggestions.map((s, i) => `${i + 1}. [${s.riskLevel}] **${s.title}**\n   ${s.description}`).join('\n\n')}`;
        dataUsed = 'AISuggestion table';
        break;
      }

      case 'tax_summary': {
        if (!isTaxRole) { response = 'Access denied. Tax data requires Accountant or Tax Manager role.'; break; }
        const [sales, purchases, vatReturn] = await Promise.all([
          prisma.taxSalesInvoice.aggregate({ _sum: { totalAmount: true, vatAmount: true }, where: { status: 'Active' } }),
          prisma.purchaseInvoice.aggregate({ _sum: { totalAmount: true, vatAmount: true, recoverableVAT: true }, where: { deletedAt: null } }),
          prisma.vATReturn.findFirst({ where: { status: { not: 'Closed' } }, orderBy: { createdAt: 'desc' } }),
        ]);
        response = `**Tax Summary**\n\n**Sales (Output VAT)**\n• Total Sales: AED ${(sales._sum.totalAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}\n• Output VAT: AED ${(sales._sum.vatAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}\n\n**Purchases (Input VAT)**\n• Total Purchases: AED ${(purchases._sum.totalAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}\n• Recoverable Input VAT: AED ${(purchases._sum.recoverableVAT || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}\n\n${vatReturn ? `**Current VAT Return (${vatReturn.period}):** Net VAT Payable: AED ${vatReturn.netVAT.toLocaleString('en-AE', { minimumFractionDigits: 2 })}` : 'No open VAT return.'}\n\n⚠️ *AI summary only. Final amounts require accountant review before FTA submission.*`;
        dataUsed = 'TaxSalesInvoice, PurchaseInvoice, VATReturn tables';
        break;
      }

      case 'pending_quotations': {
        const quotes = await prisma.quotation.findMany({
          where: { status: { in: ['Draft', 'Sent', 'Pending'] } },
          select: { quoteId: true, customerName: true, service: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 15,
        });
        const total = await prisma.quotation.count({ where: { status: { in: ['Draft', 'Sent', 'Pending'] } } });
        response = quotes.length === 0
          ? 'No pending quotations found.'
          : `**${total} pending quotations:**\n\n${quotes.map((q, i) => `${i + 1}. **${q.quoteId}** — ${q.customerName} — ${q.service} — ${q.status}`).join('\n')}`;
        dataUsed = 'Quotation table';
        break;
      }

      default: {
        response = `I can help you with:\n\n• "Show today's new leads" or "How many leads?"\n• "Show purchase invoices" or "How many purchase invoices?"\n• "Which invoices are unpaid?"\n• "Show pending quotations"\n• "Which customers owe payment?"\n• "Show AMC contracts expiring this month"\n• "Show AI suggestions"\n• "What is VAT payable?" *(accountant role required)*\n• "Which invoices have missing TRN?" *(accountant role required)*\n• "Tax summary" *(accountant role required)*\n\nTry typing any of the above or a variation.`;
        dataUsed = 'none';
        break;
      }
    }
  } catch (err) {
    response = `Sorry, I encountered an error while fetching data: ${String(err)}`;
  }

  // Save assistant message
  await prisma.aIChatMessage.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: response,
      queryType: type,
      dataUsed,
    },
  });

  // Log the query
  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'ChatQuery',
      module: 'AI',
      details: `Query type: ${type}, Message: ${message.substring(0, 100)}`,
    },
  });

  return NextResponse.json({ response, sessionId: session.sessionId, queryType: type });
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    const session = await prisma.aIChatSession.findFirst({
      where: { sessionId, userId: auth.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json({ session });
  }

  const sessions = await prisma.aIChatSession.findMany({
    where: { userId: auth.userId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  return NextResponse.json({ sessions });
}

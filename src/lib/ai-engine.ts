/**
 * Al Ghawas AI Automation Engine
 * Core AI processing: classification, extraction, validation, matching, suggestions.
 * Uses rule-based intelligence + OCR text parsing. Hooks for external AI APIs included.
 */

import { parseInvoiceText } from './invoice-ocr';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'SalesInvoice'
  | 'PurchaseInvoice'
  | 'Receipt'
  | 'Quotation'
  | 'DeliveryNote'
  | 'PaymentProof'
  | 'CreditNote'
  | 'DebitNote'
  | 'BankStatement'
  | 'TaxDocument'
  | 'Unknown';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
}

export interface AIExtraction {
  documentType: DocumentType;
  invoiceNumber: string;
  invoiceDate: string;
  dateOfSupply: string;
  supplier: {
    name: string;
    trn: string;
    address: string;
    phone: string;
    email: string;
  };
  customer: {
    name: string;
    trn: string;
    address: string;
    phone: string;
    email: string;
  };
  project: {
    projectName: string;
    jobNumber: string;
    quotationNumber: string;
    location: string;
  };
  lineItems: LineItem[];
  totals: {
    subtotal: number;
    discount: number;
    vatAmount: number;
    grandTotal: number;
    currency: string;
  };
  payment: {
    paymentTerms: string;
    dueDate: string;
    bankName: string;
    iban: string;
    paymentStatus: string;
  };
  confidence: {
    overall: number;
    invoiceNumber: number;
    invoiceDate: number;
    supplierTRN: number;
    vatAmount: number;
    totalAmount: number;
  };
  accountingCategory: string;
  vatTreatment: string;
  warnings: ValidationWarning[];
  rawText: string;
}

export interface ValidationWarning {
  type: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  message: string;
  field?: string;
}

export interface MatchResult {
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  invoiceId?: string;
  quotationId?: string;
  projectId?: string;
  confidence: number;
  matchedOn: string[];
}

// ─── DOCUMENT CLASSIFICATION ─────────────────────────────────────────────────

export function classifyDocument(text: string): DocumentType {
  const t = text.toUpperCase();

  if (t.includes('CREDIT NOTE') || t.includes('CREDIT MEMO')) return 'CreditNote';
  if (t.includes('DEBIT NOTE') || t.includes('DEBIT MEMO')) return 'DebitNote';
  if (t.includes('DELIVERY NOTE') || t.includes('PACKING SLIP') || t.includes('DELIVERY ORDER')) return 'DeliveryNote';
  if (t.includes('BANK STATEMENT') || t.includes('ACCOUNT STATEMENT')) return 'BankStatement';
  if (t.includes('QUOTATION') || t.includes('QUOTE') || t.includes('PROPOSAL') || t.includes('ESTIMATE')) return 'Quotation';
  if (t.includes('RECEIPT') && !t.includes('INVOICE')) return 'Receipt';
  if (t.includes('PAYMENT VOUCHER') || t.includes('PAYMENT PROOF') || t.includes('PAYMENT CONFIRMATION')) return 'PaymentProof';
  if (t.includes('TAX INVOICE') && (t.includes('PURCHASE') || t.includes('BILL TO'))) return 'PurchaseInvoice';
  if (t.includes('PURCHASE ORDER') || t.includes('PURCHASE INVOICE') || t.includes('SUPPLIER INVOICE')) return 'PurchaseInvoice';
  if (t.includes('INVOICE') || t.includes('TAX INVOICE')) {
    // Heuristic: if "sold to" or customer TRN on invoice, likely sales
    if (t.includes('SOLD TO') || t.includes('BILL TO') || t.includes('CUSTOMER TRN')) return 'SalesInvoice';
    return 'PurchaseInvoice';
  }
  return 'Unknown';
}

// ─── EXTRACT SUPPLIER / CUSTOMER NAMES ───────────────────────────────────────

function extractPartyNames(text: string): { supplierName: string; customerName: string } {
  let supplierName = '';
  let customerName = '';

  // Supplier: "From:", "Supplier:", "Billed by:", first company line patterns
  const supplierMatch = text.match(/(?:From|Supplier|Sold By|Vendor|Billed By|Issued By)[\s:]+([^\n]{3,60})/i);
  if (supplierMatch) supplierName = supplierMatch[1].trim();

  // Customer: "To:", "Bill To:", "Customer:"
  const customerMatch = text.match(/(?:To|Bill To|Billed To|Customer|Client|Attention|Sold To)[\s:]+([^\n]{3,60})/i);
  if (customerMatch) customerName = customerMatch[1].trim();

  // Fallback: look for "LLC" or "L.L.C" company names
  if (!supplierName) {
    const llcMatch = text.match(/([A-Z][A-Za-z\s&\-\.]{5,50}(?:LLC|L\.L\.C|LTD|FZCO|SOLE|EST\.?))/);
    if (llcMatch) supplierName = llcMatch[1].trim();
  }

  return { supplierName, customerName };
}

function extractPhoneEmail(text: string): { phone: string; email: string } {
  const phone = text.match(/(?:\+971|00971|05\d|04\d|02\d)[\s\-]?\d{7,9}/)?.[0]?.trim() || '';
  const email = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)?.[0]?.trim() || '';
  return { phone, email };
}

function extractIBAN(text: string): string {
  const match = text.match(/\b(AE\d{2}[\s\-]?\d{3}[\s\-]?\d{16})\b/i);
  return match ? match[1].replace(/[\s\-]/g, '') : '';
}

function extractBankName(text: string): string {
  const banks = ['ADCB', 'FAB', 'Emirates NBD', 'Dubai Islamic Bank', 'Mashreq', 'RAK Bank', 'ADIB', 'ENBD', 'HSBC', 'Citibank'];
  for (const bank of banks) {
    if (text.toUpperCase().includes(bank.toUpperCase())) return bank;
  }
  const match = text.match(/(?:Bank|Banker)[\s:]+([^\n]{3,40})/i);
  return match ? match[1].trim() : '';
}

function extractAddress(text: string, marker: string): string {
  const pattern = new RegExp(`${marker}[\\s\\S]{0,20}([^\\n]{10,100})`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim().substring(0, 100) : '';
}

function extractLineItems(text: string): LineItem[] {
  const items: LineItem[] = [];
  // Look for table rows: Description | Qty | Unit Price | VAT | Total
  const linePattern = /([A-Za-z][^\n]{5,80})\s+(\d+(?:\.\d+)?)\s+(\d[\d,]*(?:\.\d+)?)\s+(?:\d[\d,]*(?:\.\d+)?\s+)?(\d[\d,]*(?:\.\d+)?)/g;
  let m;
  while ((m = linePattern.exec(text)) !== null) {
    const qty = parseFloat(m[2]);
    const unitPrice = parseFloat(m[3].replace(/,/g, ''));
    const total = parseFloat(m[4].replace(/,/g, ''));
    if (qty > 0 && unitPrice > 0 && total > 0) {
      const net = qty * unitPrice;
      const vatAmt = total - net > 0 ? total - net : net * 0.05;
      items.push({
        description: m[1].trim().substring(0, 100),
        quantity: qty,
        unitPrice,
        discount: 0,
        netAmount: parseFloat(net.toFixed(2)),
        vatRate: 5,
        vatAmount: parseFloat(vatAmt.toFixed(2)),
        totalAmount: total,
      });
    }
  }
  return items.slice(0, 20);
}

// ─── MAIN EXTRACTION FUNCTION ─────────────────────────────────────────────────

export function extractInvoiceData(rawText: string): AIExtraction {
  const parsed = parseInvoiceText(rawText);
  const docType = classifyDocument(rawText);
  const { supplierName, customerName } = extractPartyNames(rawText);
  const { phone, email } = extractPhoneEmail(rawText);
  const iban = extractIBAN(rawText);
  const bankName = extractBankName(rawText);
  const lineItems = extractLineItems(rawText);

  // Project/job references
  const jobMatch = rawText.match(/(?:Job\s*(?:No\.?|Number|#|Order))[\s:]+([A-Z0-9\-\/]+)/i);
  const projectMatch = rawText.match(/(?:Project\s*(?:Name|No\.?|#))[\s:]+([^\n]{3,60})/i);
  const locationMatch = rawText.match(/(?:Site|Location|Address)[\s:]+([^\n]{5,80})/i);

  // Payment due date
  const dueDateMatch = rawText.match(/(?:Due\s*Date|Payment\s*Due)[\s:]+(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4}|\d{4}[\-\/]\d{2}[\-\/]\d{2})/i);

  const totals = {
    subtotal: parsed.subtotal || 0,
    discount: 0,
    vatAmount: parsed.vatAmount || 0,
    grandTotal: parsed.totalAmount || 0,
    currency: parsed.currency || 'AED',
  };

  // Infer missing total
  if (totals.grandTotal === 0 && totals.subtotal > 0) {
    totals.grandTotal = parseFloat((totals.subtotal + totals.vatAmount).toFixed(2));
  }

  const confidence = calculateConfidence({
    invoiceNumber: parsed.invoiceNumber || '',
    invoiceDate: parsed.invoiceDate || '',
    supplierTRN: parsed.supplierTRN || '',
    vatAmount: totals.vatAmount,
    totalAmount: totals.grandTotal,
    supplierName,
  });

  const warnings = generateValidationWarnings({
    invoiceNumber: parsed.invoiceNumber || '',
    invoiceDate: parsed.invoiceDate || '',
    supplierTRN: parsed.supplierTRN || '',
    vatAmount: totals.vatAmount,
    subtotal: totals.subtotal,
    totalAmount: totals.grandTotal,
    docType,
    rawText,
  });

  return {
    documentType: docType,
    invoiceNumber: parsed.invoiceNumber || '',
    invoiceDate: parsed.invoiceDate || '',
    dateOfSupply: parsed.dateOfSupply || '',
    supplier: {
      name: supplierName,
      trn: parsed.supplierTRN || '',
      address: extractAddress(rawText, 'From|Supplier|Company'),
      phone,
      email,
    },
    customer: {
      name: customerName,
      trn: parsed.customerTRN || '',
      address: extractAddress(rawText, 'To|Bill To|Customer'),
      phone: '',
      email: '',
    },
    project: {
      projectName: projectMatch ? projectMatch[1].trim() : '',
      jobNumber: jobMatch ? jobMatch[1].trim() : '',
      quotationNumber: parsed.poNumber || '',
      location: locationMatch ? locationMatch[1].trim().substring(0, 80) : '',
    },
    lineItems,
    totals,
    payment: {
      paymentTerms: parsed.paymentTerms || '',
      dueDate: dueDateMatch ? dueDateMatch[1] : '',
      bankName,
      iban,
      paymentStatus: 'Unknown',
    },
    confidence,
    accountingCategory: suggestAccountingCategory(supplierName, rawText),
    vatTreatment: totals.vatAmount > 0 ? 'Standard' : 'ZeroRated',
    warnings,
    rawText,
  };
}

// ─── CONFIDENCE SCORING ───────────────────────────────────────────────────────

export function calculateConfidence(fields: {
  invoiceNumber: string;
  invoiceDate: string;
  supplierTRN: string;
  vatAmount: number;
  totalAmount: number;
  supplierName: string;
}): AIExtraction['confidence'] {
  const invNumScore = fields.invoiceNumber ? 90 : 10;
  const invDateScore = fields.invoiceDate ? 85 : 10;
  const trnScore = fields.supplierTRN && /^\d{15}$/.test(fields.supplierTRN) ? 95 : fields.supplierTRN ? 60 : 5;
  const vatScore = fields.vatAmount > 0 ? 88 : 15;
  const totalScore = fields.totalAmount > 0 ? 88 : 20;

  const overall = parseFloat(
    ((invNumScore * 0.20 + invDateScore * 0.15 + trnScore * 0.25 + vatScore * 0.20 + totalScore * 0.20)).toFixed(1)
  );

  return {
    overall,
    invoiceNumber: invNumScore,
    invoiceDate: invDateScore,
    supplierTRN: trnScore,
    vatAmount: vatScore,
    totalAmount: totalScore,
  };
}

// ─── VALIDATION WARNINGS ─────────────────────────────────────────────────────

export function generateValidationWarnings(params: {
  invoiceNumber: string;
  invoiceDate: string;
  supplierTRN: string;
  vatAmount: number;
  subtotal: number;
  totalAmount: number;
  docType: DocumentType;
  rawText: string;
}): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const { invoiceNumber, invoiceDate, supplierTRN, vatAmount, subtotal, totalAmount, docType, rawText } = params;

  if (!invoiceNumber) {
    warnings.push({ type: 'MissingInvoiceNumber', severity: 'Error', message: 'Invoice number not found', field: 'invoiceNumber' });
  }

  if (!invoiceDate) {
    warnings.push({ type: 'MissingInvoiceDate', severity: 'Error', message: 'Invoice date not found', field: 'invoiceDate' });
  } else {
    // Future date check
    const parsed = new Date(invoiceDate);
    if (!isNaN(parsed.getTime()) && parsed > new Date()) {
      warnings.push({ type: 'FutureDate', severity: 'Warning', message: 'Invoice date is in the future', field: 'invoiceDate' });
    }
  }

  if (!supplierTRN) {
    warnings.push({ type: 'MissingTRN', severity: 'Error', message: 'Supplier TRN not found. Required for UAE VAT compliance.', field: 'supplierTRN' });
  } else if (!/^\d{15}$/.test(supplierTRN)) {
    warnings.push({ type: 'InvalidTRN', severity: 'Error', message: `TRN "${supplierTRN}" is not a valid 15-digit UAE TRN`, field: 'supplierTRN' });
  }

  if (subtotal > 0 && vatAmount > 0) {
    const expectedVAT = parseFloat((subtotal * 0.05).toFixed(2));
    const diff = Math.abs(vatAmount - expectedVAT);
    if (diff > 0.10 && diff / subtotal > 0.01) {
      warnings.push({
        type: 'VATMismatch',
        severity: 'Warning',
        message: `VAT amount (${vatAmount}) differs from expected 5% (${expectedVAT}). Possible non-standard VAT rate or error.`,
        field: 'vatAmount',
      });
    }
  }

  if (subtotal > 0 && vatAmount > 0 && totalAmount > 0) {
    const expectedTotal = parseFloat((subtotal + vatAmount).toFixed(2));
    const diff = Math.abs(totalAmount - expectedTotal);
    if (diff > 0.50) {
      warnings.push({
        type: 'TotalMismatch',
        severity: 'Warning',
        message: `Total (${totalAmount}) does not equal subtotal + VAT (${expectedTotal})`,
        field: 'totalAmount',
      });
    }
  }

  if (totalAmount === 0 && subtotal === 0) {
    warnings.push({ type: 'NoAmounts', severity: 'Error', message: 'No amounts could be extracted from the document', field: 'totalAmount' });
  }

  if (docType === 'Unknown') {
    warnings.push({ type: 'UnknownDocumentType', severity: 'Warning', message: 'Could not determine document type. Please classify manually.' });
  }

  const text = rawText.toLowerCase();
  if (!text.includes('vat') && !text.includes('tax') && docType === 'PurchaseInvoice') {
    warnings.push({ type: 'NoVATMention', severity: 'Info', message: 'No VAT mentioned in document. May be zero-rated or exempt.' });
  }

  return warnings;
}

// ─── ACCOUNTING CATEGORY ──────────────────────────────────────────────────────

const CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['etisalat', 'du telecom', 'e&', 'stc', 'virgin mobile', 'internet', 'telecom'], category: 'Utilities - Telecom' },
  { keywords: ['dewa', 'addc', 'electricity', 'water authority', 'utility bill'], category: 'Utilities - Power/Water' },
  { keywords: ['rent', 'landlord', 'lease', 'tenancy', 'office rent'], category: 'Office Rent' },
  { keywords: ['adnoc', 'enoc', 'emarat', 'fuel', 'petrol', 'diesel', 'vehicle fuel'], category: 'Vehicle & Fuel' },
  { keywords: ['copper pipe', 'refrigerant', 'freon', 'r410', 'r22', 'hvac material', 'ac unit', 'split ac', 'ducted ac'], category: 'HVAC Materials' },
  { keywords: ['duct', 'galvanized', 'gi sheet', 'insulation', 'ductwork'], category: 'Duct Materials' },
  { keywords: ['tools', 'drill', 'equipment', 'machinery', 'hardware'], category: 'Tools & Equipment' },
  { keywords: ['labour', 'subcontractor', 'manpower', 'technician fee', 'contractor'], category: 'Subcontractor Expense' },
  { keywords: ['salary', 'wages', 'staff expense', 'payroll', 'employee'], category: 'Staff Expenses' },
  { keywords: ['marketing', 'advertising', 'ads', 'google ads', 'meta ads', 'promotion'], category: 'Marketing & Advertising' },
  { keywords: ['software', 'subscription', 'license', 'saas', 'cloud', 'microsoft', 'adobe'], category: 'Software & Subscriptions' },
  { keywords: ['government fee', 'municipality', 'license fee', 'permit', 'registration', 'ded', 'adm'], category: 'Government Fees' },
  { keywords: ['bank charge', 'bank fee', 'transaction fee', 'processing fee'], category: 'Bank Charges' },
  { keywords: ['audit', 'accounting', 'legal', 'consulting', 'professional fee', 'lawyer'], category: 'Professional Fees' },
  { keywords: ['vehicle', 'car', 'truck', 'van', 'transport', 'delivery'], category: 'Vehicle Expenses' },
  { keywords: ['insurance', 'policy', 'coverage'], category: 'Insurance' },
  { keywords: ['hotel', 'travel', 'airline', 'accommodation', 'flight'], category: 'Travel & Entertainment' },
  { keywords: ['stationery', 'office supply', 'printing', 'paper'], category: 'Office Supplies' },
];

export function suggestAccountingCategory(supplierName: string, rawText: string): string {
  const searchText = (supplierName + ' ' + rawText).toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => searchText.includes(k))) {
      return rule.category;
    }
  }
  return 'General Expense';
}

// ─── AUTOMATION RULE ENGINE ──────────────────────────────────────────────────

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ type: string; value?: string }>;
  active: boolean;
  priority: number;
}

export interface AutomationAction {
  ruleId: string;
  ruleName: string;
  actionType: string;
  actionValue?: string;
  triggered: boolean;
}

export function evaluateAutomationRules(
  rules: AutomationRule[],
  context: {
    documentType: string;
    supplierName: string;
    supplierTRN: string;
    totalAmount: number;
    vatAmount: number;
    hasWarnings: boolean;
    hasDuplicate: boolean;
    uploadedByRole: string;
  }
): AutomationAction[] {
  const triggered: AutomationAction[] = [];

  const sortedRules = [...rules].filter(r => r.active).sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    let allMet = true;
    for (const cond of rule.conditions) {
      const fieldValue = getContextFieldValue(context, cond.field);
      if (!evaluateCondition(fieldValue, cond.operator, cond.value)) {
        allMet = false;
        break;
      }
    }
    if (allMet) {
      for (const action of rule.actions) {
        triggered.push({
          ruleId: rule.id,
          ruleName: rule.name,
          actionType: action.type,
          actionValue: action.value,
          triggered: true,
        });
      }
    }
  }

  return triggered;
}

function getContextFieldValue(context: Record<string, unknown>, field: string): string {
  const val = context[field];
  if (val === undefined || val === null) return '';
  return String(val).toLowerCase();
}

function evaluateCondition(fieldValue: string, operator: string, condValue: string): boolean {
  const cv = condValue.toLowerCase();
  switch (operator) {
    case 'contains': return fieldValue.includes(cv);
    case 'equals': return fieldValue === cv;
    case 'startsWith': return fieldValue.startsWith(cv);
    case 'greaterThan': return parseFloat(fieldValue) > parseFloat(cv);
    case 'lessThan': return parseFloat(fieldValue) < parseFloat(cv);
    case 'isEmpty': return fieldValue === '' || fieldValue === '0';
    case 'isNotEmpty': return fieldValue !== '' && fieldValue !== '0';
    case 'isTrue': return fieldValue === 'true' || fieldValue === '1';
    default: return false;
  }
}

// ─── DUPLICATE DETECTION ─────────────────────────────────────────────────────

export interface DuplicateCheckInput {
  invoiceNumber: string;
  supplierName: string;
  totalAmount: number;
  invoiceDate: string;
  existingDocs: Array<{
    id: string;
    docId: string;
    invoiceNumber?: string;
    supplierName?: string;
    totalAmount?: number;
    invoiceDate?: string;
    fileName: string;
  }>;
}

export interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number;
  matchedDocId?: string;
  matchedOn: string[];
  message: string;
}

export function detectDuplicates(input: DuplicateCheckInput): DuplicateResult {
  const { invoiceNumber, supplierName, totalAmount, invoiceDate, existingDocs } = input;

  for (const doc of existingDocs) {
    const matchedOn: string[] = [];
    let score = 0;

    if (invoiceNumber && doc.invoiceNumber && invoiceNumber.trim().toLowerCase() === doc.invoiceNumber.trim().toLowerCase()) {
      matchedOn.push('invoice_number');
      score += 60;
    }
    if (supplierName && doc.supplierName && supplierName.toLowerCase().includes(doc.supplierName.toLowerCase().substring(0, 5))) {
      matchedOn.push('supplier_name');
      score += 20;
    }
    if (totalAmount > 0 && doc.totalAmount && Math.abs(totalAmount - doc.totalAmount) < 0.01) {
      matchedOn.push('amount');
      score += 15;
    }
    if (invoiceDate && doc.invoiceDate && invoiceDate === doc.invoiceDate) {
      matchedOn.push('date');
      score += 5;
    }

    if (score >= 60) {
      return {
        isDuplicate: true,
        confidence: Math.min(score, 100),
        matchedDocId: doc.docId,
        matchedOn,
        message: `Possible duplicate of document ${doc.docId} (matched on: ${matchedOn.join(', ')})`,
      };
    }
  }

  return { isDuplicate: false, confidence: 0, matchedOn: [], message: 'No duplicates found' };
}

// ─── PAYMENT DETECTION ───────────────────────────────────────────────────────

export function detectPaymentInfo(rawText: string): {
  amount: number;
  date: string;
  reference: string;
  bankName: string;
  status: string;
} {
  const parsed = parseInvoiceText(rawText);
  const refMatch = rawText.match(/(?:Reference|Ref|Transaction\s*(?:No|ID|#))[\s:]+([A-Z0-9\-\/]{4,30})/i);
  const dateMatch = rawText.match(/(?:Payment\s*Date|Transaction\s*Date|Paid\s*On)[\s:]+(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i);

  return {
    amount: parsed.totalAmount || 0,
    date: dateMatch ? dateMatch[1] : parsed.invoiceDate || '',
    reference: refMatch ? refMatch[1] : '',
    bankName: extractBankName(rawText),
    status: rawText.toLowerCase().includes('paid') || rawText.toLowerCase().includes('received') ? 'Paid' : 'Unknown',
  };
}

// ─── AI CHAT QUERY PARSER ────────────────────────────────────────────────────

export type ChatQueryType =
  | 'greeting'
  | 'leads_today'
  | 'leads_count'
  | 'leads_summary'
  | 'unpaid_invoices'
  | 'purchase_invoices_count'
  | 'purchase_invoices_list'
  | 'purchase_invoices_category'
  | 'pending_quotations'
  | 'vat_payable'
  | 'missing_trn'
  | 'duplicate_warnings'
  | 'accepted_not_invoiced'
  | 'overdue_customers'
  | 'expiring_amc'
  | 'ai_suggestions'
  | 'tax_summary'
  | 'unknown';

export function parseChatQuery(message: string): { type: ChatQueryType; params: Record<string, string> } {
  const m = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|salaam|مرحبا|good morning|good afternoon|greetings|howdy|yo)[\s!?.]*$/.test(m)) {
    return { type: 'greeting', params: {} };
  }

  // Leads — today / new / count / summary
  if (m.includes('lead') && (m.includes('today') || m.includes('new') || m.includes('latest') || m.includes('recent'))) {
    return { type: 'leads_today', params: {} };
  }
  if ((m.includes('how many') || m.includes('count') || m.includes('number of') || m.includes('total')) && m.includes('lead')) {
    return { type: 'leads_count', params: {} };
  }
  if (m.includes('lead') && (m.includes('show') || m.includes('list') || m.includes('all') || m.includes('open') || m.includes('pending'))) {
    return { type: 'leads_summary', params: {} };
  }

  // Invoices — unpaid
  if (m.includes('unpaid') || (m.includes('invoice') && (m.includes('outstanding') || m.includes('pending payment') || m.includes('not paid')))) {
    return { type: 'unpaid_invoices', params: {} };
  }

  // Purchase invoices — count
  if ((m.includes('how many') || m.includes('count') || m.includes('number of') || m.includes('total')) &&
      (m.includes('purchase') || m.includes('supplier') || m.includes('invoice'))) {
    return { type: 'purchase_invoices_count', params: {} };
  }

  // Purchase invoices — category filter
  if (m.includes('purchase invoice') && m.includes('hvac')) return { type: 'purchase_invoices_category', params: { category: 'HVAC Materials' } };
  if (m.includes('purchase invoice') && (m.includes('utility') || m.includes('dewa') || m.includes('electric'))) return { type: 'purchase_invoices_category', params: { category: 'Utilities' } };

  // Purchase invoices — general list / show
  if (m.includes('purchase invoice') || (m.includes('purchase') && m.includes('invoice')) || (m.includes('supplier') && m.includes('invoice'))) {
    return { type: 'purchase_invoices_list', params: {} };
  }

  // VAT
  if ((m.includes('vat') || m.includes('tax')) && (m.includes('payable') || m.includes('quarter') || m.includes('period') || m.includes('due') || m.includes('owe'))) {
    return { type: 'vat_payable', params: {} };
  }
  if (m.includes('vat summary') || m.includes('tax summary') || m.includes('tax position') || m.includes('vat position')) {
    return { type: 'tax_summary', params: {} };
  }
  if ((m.includes('tax') || m.includes('vat')) && (m.includes('summary') || m.includes('report') || m.includes('overview') || m.includes('status'))) {
    return { type: 'tax_summary', params: {} };
  }

  // Missing TRN
  if ((m.includes('missing') || m.includes('no trn') || m.includes('without trn') || m.includes('no tax reg')) && (m.includes('trn') || m.includes('tax'))) {
    return { type: 'missing_trn', params: {} };
  }
  if (m.includes('trn') && (m.includes('missing') || m.includes('empty') || m.includes('blank') || m.includes('invalid'))) {
    return { type: 'missing_trn', params: {} };
  }

  // Duplicates
  if (m.includes('duplicate') || m.includes('double entry') || m.includes('same invoice')) {
    return { type: 'duplicate_warnings', params: {} };
  }

  // Pending / open quotations
  if (m.includes('quotation') || m.includes('quote') || m.includes('proposal') || m.includes('estimate')) {
    if (m.includes('pending') || m.includes('open') || m.includes('draft') || m.includes('list') || m.includes('show') || m.includes('all')) {
      return { type: 'pending_quotations', params: {} };
    }
  }

  // Accepted quotes not invoiced
  if (m.includes('accepted') && (m.includes('not invoiced') || m.includes('no invoice') || m.includes('pending invoice'))) {
    return { type: 'accepted_not_invoiced', params: {} };
  }
  if (m.includes('quote') && m.includes('not invoiced')) {
    return { type: 'accepted_not_invoiced', params: {} };
  }

  // Overdue customers / payments
  if (m.includes('overdue') || (m.includes('customer') && (m.includes('owe') || m.includes('payment') || m.includes('unpaid') || m.includes('debt')))) {
    return { type: 'overdue_customers', params: {} };
  }

  // Expiring AMC
  if (m.includes('amc') || (m.includes('maintenance') && (m.includes('expir') || m.includes('renew') || m.includes('contract')))) {
    return { type: 'expiring_amc', params: {} };
  }

  // AI suggestions / recommendations
  if (m.includes('suggestion') || m.includes('recommend') || m.includes('ai tip') || m.includes('what should') || m.includes('advice')) {
    return { type: 'ai_suggestions', params: {} };
  }

  // Tax summary (broad)
  if (m.includes('tax') || m.includes('vat')) {
    return { type: 'tax_summary', params: {} };
  }

  return { type: 'unknown', params: {} };
}

// ─── GENERATE SUGGESTIONS FROM DB DATA ──────────────────────────────────────

export function generateSuggestionSeed(type: string, relatedId: string, context: string): {
  type: string;
  title: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  actionType: string;
} {
  const seeds: Record<string, { title: string; description: string; riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'; actionType: string }> = {
    MissingTRN: {
      title: 'Invoice missing supplier TRN',
      description: `Document ${relatedId} has no supplier TRN. Input VAT cannot be claimed without a valid TRN. ${context}`,
      riskLevel: 'High',
      actionType: 'ReviewDocument',
    },
    DuplicateWarning: {
      title: 'Possible duplicate invoice detected',
      description: `Invoice ${relatedId} may be a duplicate. ${context}`,
      riskLevel: 'Critical',
      actionType: 'ReviewDocument',
    },
    VATMismatch: {
      title: 'VAT amount mismatch',
      description: `VAT calculation mismatch in ${relatedId}. ${context}`,
      riskLevel: 'High',
      actionType: 'ReviewDocument',
    },
    NeedsReview: {
      title: 'Document waiting for review',
      description: `Document ${relatedId} has been processed and is ready for accountant review.`,
      riskLevel: 'Medium',
      actionType: 'ReviewDocument',
    },
    LowConfidence: {
      title: 'Low OCR confidence',
      description: `Document ${relatedId} has low extraction confidence. Manual verification needed.`,
      riskLevel: 'Medium',
      actionType: 'ReviewDocument',
    },
    ExpiringAMC: {
      title: 'AMC contract expiring soon',
      description: context,
      riskLevel: 'Medium',
      actionType: 'RenewAMC',
    },
    UnpaidInvoice: {
      title: 'Customer payment overdue',
      description: context,
      riskLevel: 'High',
      actionType: 'SendPaymentReminder',
    },
    AcceptedQuote: {
      title: 'Accepted quotation not yet invoiced',
      description: context,
      riskLevel: 'Medium',
      actionType: 'CreateInvoice',
    },
  };

  return { type, ...(seeds[type] || { title: type, description: context, riskLevel: 'Low', actionType: 'Review' }) };
}

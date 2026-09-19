/**
 * Invoice text parser — extracts structured fields from raw OCR / PDF text.
 * Works with UAE invoice formats.
 */

export interface ExtractedInvoice {
  invoiceNumber?: string;
  invoiceDate?: string;
  dateOfSupply?: string;
  supplierName?: string;
  supplierAddress?: string;
  supplierTRN?: string;
  customerName?: string;
  customerAddress?: string;
  customerTRN?: string;
  subtotal?: number;
  vatRate?: number;
  vatAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentTerms?: string;
  poNumber?: string;
  bankDetails?: string;
}

export function parseInvoiceText(text: string): ExtractedInvoice {
  const result: ExtractedInvoice = {};
  if (!text || text.trim().length === 0) return result;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // ── TRN — 15-digit UAE Tax Registration Number ──────────────────────────
  const trnMatches = text.match(/(?:TRN|Tax\s*Reg(?:istration)?\s*(?:No\.?|Number|#)?|VAT\s*(?:No\.?|Reg\.?|Reg(?:istration)?))[\s:]*([0-9]{15})/gi);
  if (trnMatches) {
    const nums = trnMatches.map(m => m.match(/([0-9]{15})/)?.[1]).filter(Boolean) as string[];
    if (nums[0]) result.supplierTRN = nums[0];
    if (nums[1]) result.customerTRN = nums[1];
  }
  // Fallback: any standalone 15-digit number
  if (!result.supplierTRN) {
    const standalone = text.match(/\b([0-9]{15})\b/);
    if (standalone) result.supplierTRN = standalone[1];
  }

  // ── Invoice number ───────────────────────────────────────────────────────
  const invNum = text.match(/(?:Invoice\s*(?:No\.?|Number|#|Ref\.?)|Tax\s*Invoice\s*(?:No\.?|#))[\s:]*([A-Z0-9\-\/]+)/i);
  if (invNum) result.invoiceNumber = invNum[1].trim();

  // ── Invoice date ─────────────────────────────────────────────────────────
  const invDate = text.match(/(?:Invoice\s*Date|Issue\s*Date|Date\s*of\s*Invoice|Date)[\s:]*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4}|\d{4}[\-\/]\d{2}[\-\/]\d{2})/i);
  if (invDate) result.invoiceDate = invDate[1].trim();

  // ── Date of supply ───────────────────────────────────────────────────────
  const supplyDate = text.match(/(?:Date\s*of\s*Supply|Supply\s*Date|Delivery\s*Date)[\s:]*(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4})/i);
  if (supplyDate) result.dateOfSupply = supplyDate[1].trim();

  // ── Supplier name ────────────────────────────────────────────────────────
  // Strategy 1: explicit "FROM" or "Supplier" label
  const supplierLabel = text.match(/(?:FROM|Supplier\s*(?:Name)?|Vendor|Issued\s*By|Invoice\s*From|Billed\s*From)[\s:]*\n?\s*([A-Za-z][^\n]{2,80})/i);
  if (supplierLabel) {
    result.supplierName = supplierLabel[1].trim().substring(0, 100);
  }

  // Strategy 2: first non-empty line that looks like a company name (has common legal suffix)
  if (!result.supplierName) {
    for (const line of lines.slice(0, 8)) {
      if (/\b(LLC|L\.L\.C|Ltd|Limited|Co\.|Corp|Group|Company|Trading|Contracting|FZCO|FZLLC|Establishment|Est\.)\b/i.test(line)) {
        result.supplierName = line.substring(0, 100);
        break;
      }
    }
  }

  // Strategy 3: line just before "Invoice" keyword
  if (!result.supplierName) {
    const invoiceIdx = lines.findIndex(l => /\bINVOICE\b/i.test(l));
    if (invoiceIdx > 0) {
      const candidate = lines[invoiceIdx - 1];
      if (candidate.length > 3 && candidate.length < 80 && !/^\d+$/.test(candidate)) {
        result.supplierName = candidate;
      }
    }
  }

  // ── Customer name ─────────────────────────────────────────────────────────
  const billToMatch = text.match(/(?:BILL\s*TO|Ship\s*To|Customer\s*(?:Name)?|To\s*:|Dear)[\s:]*\n?\s*([A-Za-z][^\n]{2,80})/i);
  if (billToMatch) {
    result.customerName = billToMatch[1].trim().substring(0, 100);
  }

  // ── Supplier address ──────────────────────────────────────────────────────
  const addrMatch = text.match(/(?:Address|Location)[\s:]*([^\n]{5,100})/i);
  if (addrMatch) result.supplierAddress = addrMatch[1].trim();

  // ── Amounts — look for AED patterns ──────────────────────────────────────

  // VAT amount
  const vatLine = text.match(/(?:VAT|Value\s*Added\s*Tax|Tax\s*Amount|Tax\s*\(5%\)|TAX)[\s(@5%:]*[\s:]*(?:AED\s*)?([0-9,]+(?:\.[0-9]{2})?)/i);
  if (vatLine) result.vatAmount = parseFloat(vatLine[1].replace(/,/g, ''));

  // Subtotal / net
  const subtotalLine = text.match(/(?:Sub[\s-]?total|Net\s*Amount|Amount\s*(?:Before\s*VAT|Ex(?:cl)?\.?\s*(?:VAT|Tax))|Taxable\s*Amount)[\s:]*(?:AED\s*)?([0-9,]+(?:\.[0-9]{2})?)/i);
  if (subtotalLine) result.subtotal = parseFloat(subtotalLine[1].replace(/,/g, ''));

  // Total
  const totalLine = text.match(/(?:Total\s*(?:Amount\s*(?:Due|Payable)?|Due|Payable|Invoice\s*Total)|Grand\s*Total|Amount\s*(?:Due|Payable)|TOTAL\s*DUE)[\s:]*(?:AED\s*)?([0-9,]+(?:\.[0-9]{2})?)/i);
  if (totalLine) result.totalAmount = parseFloat(totalLine[1].replace(/,/g, ''));

  // Fallback: scan for any currency+amount pairs
  if (!result.subtotal && !result.totalAmount) {
    const amountPattern = /(?:AED|Dhs?\.?)\s*([0-9,]+(?:\.[0-9]{2})?)|([0-9,]+(?:\.[0-9]{2})?)\s*(?:AED|Dhs?\.?)/g;
    const amounts: number[] = [];
    let m;
    while ((m = amountPattern.exec(text)) !== null) {
      const val = parseFloat((m[1] || m[2]).replace(/,/g, ''));
      if (!isNaN(val) && val > 0 && val < 10_000_000) amounts.push(val);
    }
    if (amounts.length >= 2) {
      // Largest amount is likely total
      amounts.sort((a, b) => b - a);
      result.totalAmount = amounts[0];
    }
  }

  // ── Infer missing amounts ─────────────────────────────────────────────────
  if (result.subtotal && result.vatAmount && !result.totalAmount) {
    result.totalAmount = parseFloat((result.subtotal + result.vatAmount).toFixed(2));
  }
  if (result.totalAmount && result.vatAmount && !result.subtotal) {
    result.subtotal = parseFloat((result.totalAmount - result.vatAmount).toFixed(2));
  }
  if (result.subtotal && result.totalAmount && !result.vatAmount) {
    const diff = result.totalAmount - result.subtotal;
    if (diff > 0.01) result.vatAmount = parseFloat(diff.toFixed(2));
  }

  // ── VAT rate ──────────────────────────────────────────────────────────────
  const vatRateMatch = text.match(/(?:VAT\s*@?\s*|Tax\s*Rate\s*[:=]?\s*)(\d+(?:\.\d+)?)\s*%/i);
  if (vatRateMatch) result.vatRate = parseFloat(vatRateMatch[1]);
  else if (result.subtotal && result.vatAmount && result.subtotal > 0) {
    const computed = (result.vatAmount / result.subtotal) * 100;
    // Only trust computed rate if it's near common UAE rates (0%, 5%)
    if (computed < 0.5) result.vatRate = 0;
    else if (computed > 4 && computed < 6) result.vatRate = 5;
    else result.vatRate = parseFloat(computed.toFixed(1));
  } else {
    result.vatRate = 5; // UAE default
  }

  // ── Currency ──────────────────────────────────────────────────────────────
  result.currency = 'AED';
  const currMatch = text.match(/\b(USD|EUR|GBP|AED|SAR|QAR|KWD|OMR|BHD)\b/i);
  if (currMatch) result.currency = currMatch[1].toUpperCase();

  // ── PO number ─────────────────────────────────────────────────────────────
  const poMatch = text.match(/(?:P\.?O\.?\s*(?:No\.?|Number|#))[\s:]*([A-Z0-9\-\/]+)/i);
  if (poMatch) result.poNumber = poMatch[1].trim();

  // ── Payment terms ─────────────────────────────────────────────────────────
  const termsMatch = text.match(/(?:Payment\s*Terms?|Terms)[\s:]*([^\n]{2,50})/i);
  if (termsMatch) result.paymentTerms = termsMatch[1].trim().substring(0, 100);

  // ── Bank details ──────────────────────────────────────────────────────────
  const ibanMatch = text.match(/(?:IBAN|Account\s*(?:No\.?|Number))[\s:]*([A-Z0-9\s]{10,35})/i);
  if (ibanMatch) result.bankDetails = ibanMatch[1].trim();

  return result;
}

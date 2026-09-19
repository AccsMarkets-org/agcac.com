import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Lead, LeadFormData, LeadStatus } from '@/types/lead';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

let leadCounter = 0;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLeads(): Lead[] {
  ensureDataDir();
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([]), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function writeLeads(leads: Lead[]): void {
  ensureDataDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

function generateLeadId(existingLeads: Lead[]): string {
  const count = existingLeads.length + 1 + leadCounter++;
  return `AGC-${String(count).padStart(4, '0')}`;
}

function getDeviceType(userAgent?: string): string {
  if (!userAgent) return 'Unknown';
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

export function createLead(data: LeadFormData, userAgent?: string, ipAddress?: string): Lead {
  const leads = readLeads();
  const now = new Date();

  const lead: Lead = {
    id: generateLeadId(leads),
    createdAt: now.toISOString(),
    date: now.toLocaleDateString('en-AE', { timeZone: 'Asia/Dubai' }),
    time: now.toLocaleTimeString('en-AE', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' }),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    location: data.location.trim(),
    service: data.service,
    propertyType: data.propertyType || '',
    rooms: data.rooms || '',
    area: data.area || '',
    acUnits: data.acUnits || '',
    urgency: data.urgency || '',
    existingSystem: data.existingSystem || '',
    message: data.message?.trim() || '',
    sourcePage: data.sourcePage,
    utmSource: data.utmSource || '',
    utmMedium: data.utmMedium || '',
    utmCampaign: data.utmCampaign || '',
    utmTerm: data.utmTerm || '',
    utmContent: data.utmContent || '',
    gclid: data.gclid || '',
    fbclid: data.fbclid || '',
    deviceType: getDeviceType(userAgent),
    status: 'New',
    ipAddress: ipAddress || '',
  };

  leads.push(lead);
  writeLeads(leads);
  return lead;
}

export function getAllLeads(): Lead[] {
  return readLeads().reverse();
}

export function updateLeadStatus(id: string, status: LeadStatus): boolean {
  const leads = readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  leads[idx].status = status;
  writeLeads(leads);
  return true;
}

export function getLeadById(id: string): Lead | null {
  const leads = readLeads();
  return leads.find((l) => l.id === id) || null;
}

export function getLeadsStats() {
  const leads = readLeads();
  return {
    total: leads.length,
    new: leads.filter((l) => l.status === 'New').length,
    contacted: leads.filter((l) => l.status === 'Contacted').length,
    quoted: leads.filter((l) => l.status === 'Quoted').length,
    won: leads.filter((l) => l.status === 'Won').length,
    lost: leads.filter((l) => l.status === 'Lost').length,
  };
}

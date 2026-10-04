import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { KretzProperty, KRETZ_PROPERTIES_DATABASE } from './propertiesData';

export type { KretzProperty };
export { KRETZ_PROPERTIES_DATABASE };

export type UserRole = 'CLIENT' | 'LEGAL_OFFICER' | 'TRANSACTION_OFFICER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_email_verified: boolean;
  email_verification_token?: string;
  reset_password_token?: string;
  reset_password_expires?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country: string;
  state: string;
  date_of_birth?: string;
  target_closing_date?: string;
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  terms_accepted_at: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyRequest {
  id: string;
  user_id: string;
  property_type: 'House' | 'Apartment' | 'Land' | 'Commercial property' | 'Office' | 'Industrial property' | 'Other';
  preferred_country: string;
  preferred_state: string;
  preferred_city: string;
  preferred_neighborhood?: string;
  min_size_sqm?: number;
  max_size_sqm?: number;
  bedrooms?: number;
  budget: number;
  currency: string;
  intended_use: 'Residential' | 'Commercial' | 'Investment' | 'Development' | 'Other';
  purchase_structure: 'Cash' | 'Financing' | 'Hybrid';
  timeframe: string;
  additional_requirements?: string;
  special_instructions?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PROPERTY_IDENTIFIED' | 'TRANSACTION_STARTED' | 'COMPLETED' | 'CANCELLED';
  assigned_officer_id?: string;
  matched_property_id?: string;
  matched_property?: KretzProperty;
  admin_notes?: string;
  admin_response_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  property_request_id?: string;
  client_id: string;
  legal_officer_id: string;
  transaction_officer_id: string;
  matched_property_id?: string;
  matched_property?: KretzProperty;
  property_name: string;
  property_address: string;
  property_type: string;
  property_size_sqm?: number;
  bedrooms?: number;
  cadastral_id?: string;
  asking_price: number;
  agreed_price: number;
  currency: string;
  status: 'INITIATED' | 'LEGAL_DUE_DILIGENCE' | 'OFFER_STAGE' | 'CONTRACT_SIGNING' | 'PAYMENTS_ESCROW' | 'CLOSING' | 'COMPLETED' | 'CANCELLED';
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionParty {
  id: string;
  transaction_id: string;
  user_id?: string;
  party_role: 'BUYER' | 'SELLER' | 'LEGAL_OFFICER' | 'TRANSACTION_OFFICER' | 'NOTARY' | 'ESCROW_AGENT';
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Document {
  id: string;
  transaction_id: string;
  client_id: string;
  document_name: string;
  document_type: 'GOVERNMENT_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS' | 'PROPERTY_DEED' | 'BANK_PROOF' | 'SIGNED_AGREEMENT' | 'SURVEY_REPORT' | 'TAX_CLEARANCE' | 'CLOSING_DEED' | 'OTHER';
  current_version: number;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REQUIRES_CORRECTION' | 'REJECTED';
  reviewer_id?: string;
  reviewer_name?: string;
  review_comment?: string;
  is_private_internal: boolean;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  iv_hex: string;
  auth_tag_hex: string;
  sha256_hash: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  iv_hex: string;
  auth_tag_hex: string;
  sha256_hash: string;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REQUIRES_CORRECTION' | 'REJECTED';
  reviewer_name?: string;
  review_comment?: string;
  uploaded_by_user_id: string;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface LegalReview {
  id: string;
  transaction_id: string;
  overall_status: 'PENDING' | 'IN_PROGRESS' | 'CLEARED' | 'ISSUE_FOUND' | 'RESOLVED';
  assigned_legal_officer_id: string;
  legal_summary: string;
  internal_legal_notes: string;
  cleared_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalCheck {
  id: string;
  legal_review_id: string;
  transaction_id: string;
  check_type: 'OWNERSHIP_VERIFICATION' | 'TITLE_VERIFICATION' | 'LAND_REGISTRY_SEARCH' | 'SURVEY_VERIFICATION' | 'ENCUMBRANCE_LIEN_CHECK' | 'PLANNING_APPROVAL' | 'TAX_VERIFICATION' | 'SELLER_VERIFICATION' | 'FINAL_LEGAL_OPINION';
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CLEARED' | 'ISSUE_FOUND' | 'RESOLVED';
  assigned_professional_name: string;
  findings: string;
  client_visible_notes: string;
  internal_notes: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  transaction_id: string;
  client_id: string;
  property_title: string;
  asking_price: number;
  client_offer_amount: number;
  deposit_amount: number;
  currency: string;
  proposed_closing_date: string;
  conditions: string;
  notes: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTEROFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  counteroffer_amount?: number;
  counteroffer_conditions?: string;
  counteroffer_notes?: string;
  version: number;
  submitted_at: string;
  updated_at: string;
}

export interface SourceOfWealthItem {
  id: string;
  category: 'BUSINESS_SALE' | 'CORPORATE_DIVIDENDS' | 'INHERITANCE' | 'REAL_ESTATE_SALE' | 'INVESTMENT_PORTFOLIO' | 'SALARY_BONUS' | 'FAMILY_TRUST' | 'OTHER';
  percentage: number;
  estimated_amount: number;
  description: string;
  supporting_doc_name?: string;
  supporting_doc_id?: string;
}

export interface BeneficialOwnerItem {
  id: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  country_of_residence: string;
  ownership_percentage: number;
  is_pep: boolean;
}

export interface TracfinDossier {
  id: string;
  transaction_id: string;
  client_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_LEGAL_REVIEW' | 'CLEARED' | 'REQUIRES_CLARIFICATION' | 'REJECTED';
  origin_bank_name: string;
  origin_bank_country: string;
  origin_bank_iban_masked: string;
  origin_bank_swift: string;
  tax_residence_countries: string[];
  tax_id_numbers: string;
  source_of_wealth_categories: SourceOfWealthItem[];
  pep_declaration: boolean;
  pep_details?: string;
  sanctions_declaration: boolean;
  beneficial_ownership_type: 'INDIVIDUAL' | 'HOLDING_COMPANY' | 'SCI' | 'TRUST_FOUNDATION';
  beneficial_owners: BeneficialOwnerItem[];
  bank_comfort_letter_uploaded: boolean;
  bank_comfort_letter_doc_id?: string;
  tracfin_risk_rating: 'LOW' | 'STANDARD' | 'ENHANCED_DILIGENCE';
  legal_officer_clearance_notes?: string;
  cleared_by_officer_name?: string;
  cleared_at?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QESSigner {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'LEGAL_REPRESENTATIVE' | 'NOTARY';
  status: 'PENDING' | 'OTP_SENT' | 'SIGNED';
  otp_code?: string;
  otp_sent_at?: string;
  otp_expires_at?: number;
  signed_at?: string;
  signature_image_url?: string;
  ip_address?: string;
  certificate_fingerprint?: string;
}

export interface QESAuditEvent {
  id: string;
  action: string;
  actor_name: string;
  actor_email: string;
  timestamp: string;
  ip_address: string;
  details: string;
}

export interface QESContractSession {
  id: string;
  contract_id: string;
  transaction_id: string;
  document_type: 'COMPROMIS_DE_VENTE' | 'PROCURATION_NOTARIEE' | 'ACTE_AUTHENTIQUE_PROMIS';
  eidas_assurance_level: 'QUALIFIED' | 'ADVANCED';
  trust_service_provider: string;
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'COMPLETED' | 'REVOKED';
  sha256_document_hash: string;
  certificate_id: string;
  signers: QESSigner[];
  audit_trail: QESAuditEvent[];
  completed_at?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  transaction_id: string;
  title: string;
  contract_status: 'DRAFT' | 'READY_FOR_SIGNATURE' | 'PARTIALLY_SIGNED' | 'EXECUTED' | 'CANCELLED';
  version: number;
  content_summary: string;
  document_id?: string;
  valid_until: string;
  qes_session?: QESContractSession;
  executed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractSignature {
  id: string;
  contract_id: string;
  transaction_id: string;
  user_id: string;
  signer_name: string;
  signer_role: 'BUYER' | 'SELLER' | 'LEGAL_REPRESENTATIVE' | 'NOTARY';
  signature_data_url: string;
  ip_address: string;
  user_agent: string;
  signed_at: string;
  audit_certificate_hash: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  client_id: string;
  description: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  payment_method?: string;
  transaction_reference?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  receipt_document_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClosingRecord {
  id: string;
  transaction_id: string;
  closing_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_closing_date: string;
  actual_closing_date?: string;
  notary_name: string;
  registration_number?: string;
  handover_notes: string;
  key_handover_confirmed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClosingChecklistItem {
  id: string;
  transaction_id: string;
  item_key: string;
  item_title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  required_role: 'CLIENT' | 'LEGAL_OFFICER' | 'TRANSACTION_OFFICER' | 'NOTARY';
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  order_index: number;
}

export interface Message {
  id: string;
  transaction_id: string;
  sender_user_id: string;
  sender_name: string;
  sender_role: UserRole;
  message_text: string;
  attachment_document_id?: string;
  attachment_name?: string;
  is_internal_note: boolean;
  created_at: string;
  read_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  transaction_id?: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  transaction_id?: string;
  details: string;
  ip_address: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILURE';
}

interface DatabaseSchema {
  users: User[];
  user_profiles: UserProfile[];
  property_requests: PropertyRequest[];
  transactions: Transaction[];
  transaction_parties: TransactionParty[];
  documents: Document[];
  document_versions: DocumentVersion[];
  legal_reviews: LegalReview[];
  legal_checks: LegalCheck[];
  offers: Offer[];
  contracts: Contract[];
  contract_signatures: ContractSignature[];
  payments: Payment[];
  closing_records: ClosingRecord[];
  closing_checklist: ClosingChecklistItem[];
  messages: Message[];
  notifications: Notification[];
  audit_logs: AuditLog[];
  kretz_properties: KretzProperty[];
  tracfin_dossiers: TracfinDossier[];
  qes_sessions: QESContractSession[];
  counters: {
    request: number;
    transaction: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const STORAGE_DIR = path.join(DATA_DIR, 'secure_storage');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

let dbCache: DatabaseSchema | null = null;

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password123!', salt);
  const now = new Date().toISOString();

  const legalOfficer: User = {
    id: 'usr_legal_001',
    email: 'maitre.claire@kretz.site',
    password_hash: passwordHash,
    role: 'LEGAL_OFFICER',
    is_email_verified: true,
    created_at: now,
    updated_at: now,
  };

  const legalProfile: UserProfile = {
    id: 'prof_legal_001',
    user_id: 'usr_legal_001',
    first_name: 'Claire',
    last_name: 'de Saint-Germain',
    phone_number: '+33 1 42 68 00 11',
    country: 'France',
    state: 'Paris',
    kyc_status: 'VERIFIED',
    terms_accepted_at: now,
    created_at: now,
    updated_at: now,
  };

  const transOfficer: User = {
    id: 'usr_trans_001',
    email: 'marcus.vance@kretz.site',
    password_hash: passwordHash,
    role: 'TRANSACTION_OFFICER',
    is_email_verified: true,
    created_at: now,
    updated_at: now,
  };

  const transProfile: UserProfile = {
    id: 'prof_trans_001',
    user_id: 'usr_trans_001',
    first_name: 'Marcus',
    last_name: 'Vance',
    phone_number: '+33 1 42 68 00 22',
    country: 'France',
    state: 'Paris',
    kyc_status: 'VERIFIED',
    terms_accepted_at: now,
    created_at: now,
    updated_at: now,
  };

  const adminUser: User = {
    id: 'usr_admin_001',
    email: 'admin@kretz.site',
    password_hash: passwordHash,
    role: 'ADMIN',
    is_email_verified: true,
    created_at: now,
    updated_at: now,
  };

  const adminProfile: UserProfile = {
    id: 'prof_admin_001',
    user_id: 'usr_admin_001',
    first_name: 'Valentin',
    last_name: 'Kretz',
    phone_number: '+33 1 42 68 00 00',
    country: 'France',
    state: 'Paris',
    kyc_status: 'VERIFIED',
    terms_accepted_at: now,
    created_at: now,
    updated_at: now,
  };

  return {
    users: [legalOfficer, transOfficer, adminUser],
    user_profiles: [legalProfile, transProfile, adminProfile],
    property_requests: [],
    transactions: [],
    transaction_parties: [],
    documents: [],
    document_versions: [],
    legal_reviews: [],
    legal_checks: [],
    offers: [],
    contracts: [],
    contract_signatures: [],
    payments: [],
    closing_records: [],
    closing_checklist: [],
    messages: [],
    notifications: [],
    audit_logs: [],
    kretz_properties: KRETZ_PROPERTIES_DATABASE,
    tracfin_dossiers: [],
    qes_sessions: [],
    counters: {
      request: 0,
      transaction: 0,
    },
  };
}

export function loadDB(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      if (!dbCache!.kretz_properties || dbCache!.kretz_properties.length < KRETZ_PROPERTIES_DATABASE.length) {
        dbCache!.kretz_properties = KRETZ_PROPERTIES_DATABASE;
      }
      if (!dbCache!.tracfin_dossiers) {
        dbCache!.tracfin_dossiers = [];
      }
      if (!dbCache!.qes_sessions) {
        dbCache!.qes_sessions = [];
      }
      saveDB();
      return dbCache!;
    } catch (e) {
      console.error('Failed to read db.json, generating default:', e);
    }
  }

  dbCache = getInitialDatabase();
  saveDB();
  return dbCache;
}

export function saveDB(): void {
  if (!dbCache) return;
  fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
}

export function getProperties(filter?: {
  property_type?: string;
  country?: string;
  city?: string;
  max_price?: number;
  min_price?: number;
  search?: string;
}): KretzProperty[] {
  const db = loadDB();
  let list = db.kretz_properties || KRETZ_PROPERTIES_DATABASE;

  if (!filter) return list;

  return list.filter((prop) => {
    if (filter.property_type && filter.property_type !== 'All' && prop.property_type !== filter.property_type) {
      return false;
    }
    if (filter.country && filter.country !== 'All' && prop.country.toLowerCase() !== filter.country.toLowerCase()) {
      return false;
    }
    if (filter.city && filter.city !== 'All' && prop.city.toLowerCase() !== filter.city.toLowerCase()) {
      return false;
    }
    if (filter.max_price && prop.asking_price > filter.max_price) {
      return false;
    }
    if (filter.min_price && prop.asking_price < filter.min_price) {
      return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      const match =
        prop.id.toLowerCase().includes(q) ||
        (prop.ref && prop.ref.toLowerCase().includes(q)) ||
        (prop.slug && prop.slug.toLowerCase().includes(q)) ||
        (prop.annonce_url && prop.annonce_url.toLowerCase().includes(q)) ||
        prop.name.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.headline.toLowerCase().includes(q) ||
        prop.description.toLowerCase().includes(q) ||
        prop.address.toLowerCase().includes(q) ||
        prop.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export function getPropertyById(rawId: string): KretzProperty | undefined {
  if (!rawId) return undefined;
  const db = loadDB();
  const list = db.kretz_properties || KRETZ_PROPERTIES_DATABASE;

  let id = decodeURIComponent(rawId).trim();
  const lower = id.toLowerCase();

  // 1. Direct case-insensitive match on id, slug, ref, annonce_url, tour_url
  let found = list.find(
    (p) =>
      p.id.toLowerCase() === lower ||
      (p.slug && p.slug.toLowerCase() === lower) ||
      (p.ref && p.ref.toLowerCase() === lower) ||
      (p.annonce_url && p.annonce_url.toLowerCase() === lower) ||
      (p.tour_url && p.tour_url.toLowerCase() === lower)
  );
  if (found) return found;

  // 2. URL parsing: Extract slug or ID from kretz.site URL or path
  // Handles: https://kretz.site/#/annonce/kp1-11270b/bastide
  // Handles: https://kretz.site/kretz-tour/en/annonce/kp1-11270b/bastide/
  // Handles: #/annonce/kp1-11270b/bastide
  const urlMatch = lower.match(/(?:annonce|property)\/([a-z0-9_-]+)(?:\/([a-z0-9_-]+))?/i);
  if (urlMatch) {
    const part1 = urlMatch[1]; // kp1-11270b
    const part2 = urlMatch[2]; // bastide
    const combinedSlug = part2 ? `${part1}-${part2}` : part1; // kp1-11270b-bastide

    found = list.find(
      (p) =>
        p.id.toLowerCase() === part1 ||
        (p.ref && p.ref.toLowerCase() === part1) ||
        (p.slug && p.slug.toLowerCase() === combinedSlug) ||
        (p.slug && p.slug.toLowerCase() === part1) ||
        (p.annonce_url && p.annonce_url.toLowerCase().includes(part1))
    );
    if (found) return found;
  }

  // 3. Normalized path with slashes converted to dash: e.g. kp1-11270b/bastide -> kp1-11270b-bastide
  const normalizedSlug = lower
    .replace(/^(?:https?:\/\/[^/]+)?(?:\/#)?(?:\/)?(?:annonce|property)\//i, '')
    .replace(/\/+$/, '')
    .replace(/\//g, '-');
  if (normalizedSlug) {
    found = list.find(
      (p) =>
        p.id.toLowerCase() === normalizedSlug ||
        (p.slug && p.slug.toLowerCase() === normalizedSlug)
    );
    if (found) return found;
  }

  // 4. Extract KP code e.g. "kp1-11270b" or "11270b" or "11270"
  const kpCodeMatch = lower.match(/(?:kp\d*[-_]?)?([0-9]{3,6}[a-z]?)/i);
  if (kpCodeMatch && kpCodeMatch[1]) {
    const code = kpCodeMatch[1]; // e.g. 11270b
    found = list.find(
      (p) =>
        p.id.toLowerCase().includes(code) ||
        (p.slug && p.slug.toLowerCase().includes(code))
    );
    if (found) return found;
  }

  // 5. Partial contains in ID, slug, or ref
  found = list.find(
    (p) =>
      p.id.toLowerCase().includes(lower) ||
      (p.slug && p.slug.toLowerCase().includes(lower)) ||
      (p.ref && p.ref.toLowerCase().includes(lower))
  );

  return found;
}

export function generateNextRequestId(): string {
  const db = loadDB();
  db.counters.request += 1;
  saveDB();
  const num = String(db.counters.request).padStart(6, '0');
  return `PR-2026-${num}`;
}

export function generateNextTransactionId(): string {
  const db = loadDB();
  db.counters.transaction += 1;
  saveDB();
  const num = String(db.counters.transaction).padStart(6, '0');
  return `TX-2026-${num}`;
}

export function logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const db = loadDB();
  const log: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.audit_logs.unshift(log);
  saveDB();
  return log;
}

export type UserRole = 'CLIENT' | 'LEGAL_OFFICER' | 'TRANSACTION_OFFICER' | 'ADMIN';

export interface UserProfile {
  first_name: string;
  last_name: string;
  phone_number: string;
  country: string;
  state: string;
  date_of_birth?: string;
  target_closing_date?: string;
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
  created_at: string;
  profile: UserProfile | null;
}

export interface KretzProperty {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  property_type: 'House' | 'Apartment' | 'Private Mansion' | 'Villa' | 'Château' | 'Chalet' | 'Penthouse' | 'Land' | 'Commercial property';
  address: string;
  city: string;
  state_region: string;
  country: string;
  cadastral_id: string;
  land_registry_ref: string;
  asking_price: number;
  currency: string;
  living_area_sqm: number;
  land_area_sqm?: number;
  bedrooms: number;
  bathrooms: number;
  reception_rooms: number;
  floor_level?: string;
  year_built?: number;
  architectural_style: string;
  notary_jurisdiction: string;
  legal_status: 'AVAILABLE' | 'UNDER_OFFER' | 'TRANSACTION_IN_PROGRESS' | 'ACQUIRED';
  features: string[];
  key_amenities: string[];
  legal_title_type: 'Freehold' | 'Co-ownership (Copropriété)' | 'SCI Share Acquisition' | 'Estate Freehold';
  due_diligence_pack_ready: boolean;
  cadastral_status?: string;
  tax_compliance_status?: string;
  energy_rating?: string;
  images: {
    hero: string;
    gallery: string[];
  };
  tags: string[];
  ref?: string;
  annonce_url?: string;
  tour_url?: string;
  video_url?: string;
  coordinates?: { lat: number; lng: number };
  agent?: {
    name: string;
    phone: string;
    email: string;
    photo: string;
    role: string;
  };
  is_confidential?: boolean;
  is_exclusive?: boolean;
  is_off_market?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyRequest {
  id: string;
  user_id: string;
  client_name?: string;
  client_email?: string;
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
  associated_transaction_id?: string;
  matched_property_id?: string;
  matched_property?: KretzProperty;
  admin_notes?: string;
  admin_response_at?: string;
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

export interface Transaction {
  id: string;
  property_request_id?: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_kyc_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  legal_officer_id: string;
  legal_officer_name?: string;
  transaction_officer_id: string;
  transaction_officer_name?: string;
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
  current_step: number; // 1 to 8
  parties?: TransactionParty[];
  created_at: string;
  updated_at: string;
}

export type DocumentType =
  | 'GOVERNMENT_ID'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'PROOF_OF_ADDRESS'
  | 'PROPERTY_DEED'
  | 'BANK_PROOF'
  | 'SIGNED_AGREEMENT'
  | 'SURVEY_REPORT'
  | 'TAX_CLEARANCE'
  | 'CLOSING_DEED'
  | 'OTHER';

export interface DocumentItem {
  id: string;
  transaction_id: string;
  client_id: string;
  document_name: string;
  document_type: DocumentType;
  current_version: number;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REQUIRES_CORRECTION' | 'REJECTED';
  reviewer_name?: string;
  review_comment?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  is_private_internal?: boolean;
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
  sha256_hash: string;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REQUIRES_CORRECTION' | 'REJECTED';
  reviewer_name?: string;
  review_comment?: string;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface LegalReview {
  id: string;
  transaction_id: string;
  overall_status: 'PENDING' | 'IN_PROGRESS' | 'CLEARED' | 'ISSUE_FOUND' | 'RESOLVED';
  legal_summary: string;
  internal_legal_notes?: string;
  cleared_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalCheck {
  id: string;
  legal_review_id: string;
  transaction_id: string;
  check_type:
    | 'OWNERSHIP_VERIFICATION'
    | 'TITLE_VERIFICATION'
    | 'LAND_REGISTRY_SEARCH'
    | 'SURVEY_VERIFICATION'
    | 'ENCUMBRANCE_LIEN_CHECK'
    | 'PLANNING_APPROVAL'
    | 'TAX_VERIFICATION'
    | 'SELLER_VERIFICATION'
    | 'FINAL_LEGAL_OPINION';
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CLEARED' | 'ISSUE_FOUND' | 'RESOLVED';
  assigned_professional_name: string;
  findings: string;
  client_visible_notes: string;
  internal_notes?: string;
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
  otp_sent_at?: string;
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
  trust_service_provider: string; // e.g. "Yousign EU / ANSSI Qualified TSP"
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'COMPLETED' | 'REVOKED';
  sha256_document_hash: string;
  certificate_id: string;
  signers: QESSigner[];
  audit_trail: QESAuditEvent[];
  completed_at?: string;
  created_at: string;
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

export interface CadastralPlotInfo {
  parcel_id: string;
  section: string;
  plot_number: string;
  commune: string;
  department: string;
  surface_sqm: number;
  cadastral_sheet: string;
  zoning_code: string; // e.g. "Zone UA (Centre Historique)" or "Zone N (Protégée)"
  heritage_perimeter: boolean; // ABF Architectes des Bâtiments de France
  servitudes: string[];
  urban_certificate_status: 'GRANTED' | 'IN_PROGRESS' | 'RESTRICTED';
  coordinates: { lat: number; lng: number };
}

export interface TechnicalDiagnosticDDT {
  dpe_energy_class: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  dpe_energy_kwh_sqm_year: number;
  dpe_ghg_class: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  dpe_ghg_kg_co2_sqm_year: number;
  carrez_surface_sqm: number;
  lead_status: 'NEGATIVE' | 'POSITIVE_CONTAINED' | 'EXEMPT';
  asbestos_status: 'NEGATIVE' | 'POSITIVE_MONITORED' | 'EXEMPT';
  termites_status: 'NEGATIVE' | 'CLEAR';
  electrical_status: 'CONFORM' | 'MINOR_OBSERVATIONS' | 'REQUIRES_UPGRADE';
  gas_status: 'CONFORM' | 'NOT_APPLICABLE';
  erp_flood_risk: 'LOW' | 'MEDIUM' | 'NONE';
  erp_seismic_zone: string;
  erp_soil_shrinkage: 'LOW' | 'MEDIUM' | 'HIGH';
  diagnostic_company_name: string;
  diagnostic_date: string;
  valid_until: string;
}

export interface PreemptionRightRecord {
  id: string;
  transaction_id: string;
  preemption_type: 'SAFER' | 'DPU_URBAIN' | 'ZAD' | 'ESPACES_NATURELS';
  authority_name: string;
  notification_date: string;
  statutory_deadline_date: string;
  status: 'PURGED' | 'PENDING_NOTIFICATION' | 'CERTIFICATE_ISSUED' | 'EXEMPT';
  certificate_reference?: string;
  waiver_received_date?: string;
  notary_notes?: string;
}

export interface NotarialWireInstructions {
  transaction_id: string;
  notary_office_name: string;
  notary_chamber_id: string;
  beneficiary_account_name: string;
  bank_name: string;
  bank_address: string;
  iban_formatted: string;
  bic_swift: string;
  clearing_code: string;
  payment_reference_code: string;
  security_verification_hash: string;
  issued_at: string;
  valid_for_days: number;
  tamper_evident_qr_data: string;
}

export interface CurrencyRate {
  currency: string;
  symbol: string;
  rate_to_eur: number;
  name: string;
}

export interface EscrowMilestoneBreakdown {
  agreed_purchase_price: number;
  earnest_deposit_10_percent: number;
  notary_fees_and_stamp_duty: number; // Droits de mutation (~7.5%)
  agency_commission_included: number;
  remaining_completion_balance: number;
  currency: string;
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

export interface PlatformMetrics {
  total_clients: number;
  total_requests: number;
  active_transactions: number;
  pending_legal_checks: number;
  unverified_documents: number;
  total_transaction_volume: number;
}

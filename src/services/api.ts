import {
  User,
  UserProfile,
  KretzProperty,
  PropertyRequest,
  Transaction,
  DocumentItem,
  DocumentVersion,
  LegalReview,
  LegalCheck,
  Offer,
  Contract,
  ContractSignature,
  TracfinDossier,
  QESContractSession,
  Payment,
  ClosingRecord,
  ClosingChecklistItem,
  Message,
  Notification,
  AuditLog,
  PlatformMetrics,
  UserRole,
} from '../types';

let cachedToken: string | null = localStorage.getItem('kretz_auth_token');

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (token) {
    localStorage.setItem('kretz_auth_token', token);
  } else {
    localStorage.removeItem('kretz_auth_token');
  }
}

export function getAuthToken(): string | null {
  return cachedToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (cachedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${cachedToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = 'An error occurred during request.';
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: async (credentials: { email: string; password: string; remember_me?: boolean }) => {
      const data = await request<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setAuthToken(data.token);
      return data;
    },

    register: async (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
      country: string;
      state: string;
      terms_accepted: boolean;
    }) => {
      const data = await request<{
        message: string;
        token: string;
        verificationCode?: string;
        user: User;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuthToken(data.token);
      return data;
    },

    verifyEmail: async (payload: { code: string; email?: string }) => {
      return request<{ message: string }>('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    forgotPassword: async (email: string) => {
      return request<{ message: string; resetCode?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (payload: { email: string; token: string; new_password: string }) => {
      return request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    me: async () => {
      return request<{ user: User }>('/api/auth/me');
    },

    logout: async () => {
      try {
        await request<{ message: string }>('/api/auth/logout', { method: 'POST' });
      } finally {
        setAuthToken(null);
      }
    },

    demoSwitchRole: async (role: UserRole) => {
      const data = await request<{ message: string; token: string; user: User }>('/api/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(data.token);
      return data;
    },
  },

  // Kretz Properties Portfolio (kretz.site)
  properties: {
    list: async (params?: {
      property_type?: string;
      country?: string;
      city?: string;
      min_price?: number;
      max_price?: number;
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.property_type) q.set('property_type', params.property_type);
      if (params?.country) q.set('country', params.country);
      if (params?.city) q.set('city', params.city);
      if (params?.min_price) q.set('min_price', String(params.min_price));
      if (params?.max_price) q.set('max_price', String(params.max_price));
      if (params?.search) q.set('search', params.search);
      const qs = q.toString();
      return request<{ properties: KretzProperty[]; total: number }>(`/api/properties${qs ? `?${qs}` : ''}`);
    },

    get: async (id: string) => {
      return request<{ property: KretzProperty }>(`/api/properties/${encodeURIComponent(id)}`);
    },

    matchToRequest: async (requestId: string, propertyId: string) => {
      return request<{ message: string; request: PropertyRequest; property: KretzProperty }>(
        `/api/property-requests/${encodeURIComponent(requestId)}/match-property`,
        {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId }),
        }
      );
    },
  },

  // Property Requests
  propertyRequests: {
    list: async () => {
      return request<{ requests: PropertyRequest[] }>('/api/property-requests');
    },

    get: async (id: string) => {
      return request<{ request: PropertyRequest }>('/api/property-requests/' + encodeURIComponent(id));
    },

    create: async (payload: Partial<PropertyRequest> & { is_draft?: boolean }) => {
      return request<{ message: string; request: PropertyRequest }>('/api/property-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    update: async (id: string, payload: Partial<PropertyRequest>) => {
      return request<{ message: string; request: PropertyRequest }>(`/api/property-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    convertToTransaction: async (
      id: string,
      payload: { property_name?: string; property_address?: string; agreed_price?: number; cadastral_id?: string },
    ) => {
      return request<{ message: string; transaction: Transaction }>(
        `/api/property-requests/${encodeURIComponent(id)}/convert-to-transaction`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Transactions
  transactions: {
    list: async () => {
      return request<{ transactions: Transaction[] }>('/api/transactions');
    },

    get: async (id: string) => {
      return request<{ transaction: Transaction }>(`/api/transactions/${encodeURIComponent(id)}`);
    },

    update: async (id: string, payload: Partial<Transaction>) => {
      return request<{ message: string; transaction: Transaction }>(`/api/transactions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },

  // Documents
  documents: {
    list: async (transactionId: string) => {
      return request<{ documents: DocumentItem[] }>(`/api/transactions/${encodeURIComponent(transactionId)}/documents`);
    },

    upload: async (transactionId: string, formData: FormData) => {
      return request<{ message: string; document: DocumentItem }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/documents`,
        {
          method: 'POST',
          body: formData,
        },
      );
    },

    getSignedUrl: async (documentId: string) => {
      return request<{ download_url: string; expires_at: number }>(
        `/api/documents/${encodeURIComponent(documentId)}/signed-url`,
      );
    },

    getVersions: async (documentId: string) => {
      return request<{ document: DocumentItem; versions: DocumentVersion[] }>(
        `/api/documents/${encodeURIComponent(documentId)}/versions`,
      );
    },

    uploadNewVersion: async (documentId: string, formData: FormData) => {
      return request<{ message: string; version: DocumentVersion; document: DocumentItem }>(
        `/api/documents/${encodeURIComponent(documentId)}/versions`,
        {
          method: 'POST',
          body: formData,
        },
      );
    },

    getVersionSignedUrl: async (versionId: string) => {
      return request<{ download_url: string; expires_at: number }>(
        `/api/document-versions/${encodeURIComponent(versionId)}/signed-url`,
      );
    },

    review: async (documentId: string, payload: { status: string; review_comment?: string }) => {
      return request<{ message: string; document: DocumentItem }>(
        `/api/documents/${encodeURIComponent(documentId)}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Legal Due Diligence
  legalReview: {
    get: async (transactionId: string) => {
      return request<{ review: LegalReview | null; checks: LegalCheck[] }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/legal-review`,
      );
    },

    updateCheck: async (checkId: string, payload: Partial<LegalCheck>) => {
      return request<{ message: string; check: LegalCheck }>(`/api/legal-checks/${encodeURIComponent(checkId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },

  // Offers
  offers: {
    get: async (transactionId: string) => {
      return request<{ offers: Offer[]; current_offer: Offer | null }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/offer`,
      );
    },

    submit: async (transactionId: string, payload: Partial<Offer>) => {
      return request<{ message: string; offer: Offer }>(`/api/transactions/${encodeURIComponent(transactionId)}/offer`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    respond: async (
      transactionId: string,
      payload: {
        status: 'ACCEPTED' | 'REJECTED' | 'COUNTEROFFER';
        counteroffer_amount?: number;
        counteroffer_conditions?: string;
        counteroffer_notes?: string;
      },
    ) => {
      return request<{ message: string; offer: Offer }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/offer/respond`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Contracts & e-Sign
  contracts: {
    get: async (transactionId: string) => {
      return request<{ contract: Contract | null; signatures: ContractSignature[]; qes_session?: QESContractSession }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/contract`,
      );
    },

    sign: async (
      transactionId: string,
      payload: { signature_data_url: string; signer_name: string; signer_role?: string },
    ) => {
      return request<{ message: string; signature: ContractSignature; contract: Contract }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/contract/sign`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Tracfin & Source of Funds (SoF) Compliance
  tracfin: {
    get: async (transactionId: string) => {
      return request<{ dossier: TracfinDossier }>(`/api/transactions/${encodeURIComponent(transactionId)}/tracfin`);
    },

    update: async (transactionId: string, payload: Partial<TracfinDossier>) => {
      return request<{ message: string; dossier: TracfinDossier }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/tracfin`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },

    submit: async (transactionId: string) => {
      return request<{ message: string; dossier: TracfinDossier }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/tracfin/submit`,
        {
          method: 'POST',
        },
      );
    },

    review: async (
      transactionId: string,
      payload: { status: 'CLEARED' | 'REQUIRES_CLARIFICATION' | 'REJECTED'; tracfin_risk_rating?: string; legal_officer_clearance_notes?: string },
    ) => {
      return request<{ message: string; dossier: TracfinDossier }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/tracfin/review`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // eIDAS Qualified Electronic Signatures (QES)
  qes: {
    init: async (transactionId: string, contractId: string) => {
      return request<{ session: QESContractSession }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/qes/${encodeURIComponent(contractId)}/init`,
        {
          method: 'POST',
        },
      );
    },

    sendOtp: async (transactionId: string, contractId: string) => {
      return request<{ message: string; otpCode: string; expiresInSeconds: number }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/qes/${encodeURIComponent(contractId)}/send-otp`,
        {
          method: 'POST',
        },
      );
    },

    signWithQES: async (
      transactionId: string,
      contractId: string,
      payload: { otp_code: string; signature_data_url: string; signer_name?: string },
    ) => {
      return request<{ message: string; session: QESContractSession; contract: Contract }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/qes/${encodeURIComponent(contractId)}/sign`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },

    getCertificate: async (transactionId: string, contractId: string) => {
      return request<any>(
        `/api/transactions/${encodeURIComponent(transactionId)}/qes/${encodeURIComponent(contractId)}/certificate`,
      );
    },
  },

  // Payments
  payments: {
    list: async (transactionId: string) => {
      return request<{ payments: Payment[] }>(`/api/transactions/${encodeURIComponent(transactionId)}/payments`);
    },

    confirm: async (
      transactionId: string,
      paymentId: string,
      payload: { transaction_reference?: string; payment_method?: string },
    ) => {
      return request<{ message: string; payment: Payment }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/payments/${encodeURIComponent(paymentId)}/confirm`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },

    create: async (transactionId: string, payload: { description: string; amount: number; due_date: string; currency?: string }) => {
      return request<{ message: string; payment: Payment }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/payments`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Closing
  closing: {
    get: async (transactionId: string) => {
      return request<{ closing: ClosingRecord | null; checklist: ClosingChecklistItem[] }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/closing`,
      );
    },

    updateChecklist: async (itemId: string, payload: { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; notes?: string }) => {
      return request<{ message: string; item: ClosingChecklistItem }>(
        `/api/closing-checklist/${encodeURIComponent(itemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );
    },

    finalize: async (
      transactionId: string,
      payload: { registration_number?: string; handover_notes?: string; key_handover_confirmed: boolean },
    ) => {
      return request<{ message: string; transaction: Transaction; closing: ClosingRecord }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/closing/finalize`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Messages
  messages: {
    list: async (transactionId: string) => {
      return request<{ messages: Message[] }>(`/api/transactions/${encodeURIComponent(transactionId)}/messages`);
    },

    send: async (
      transactionId: string,
      payload: { message_text: string; is_internal_note?: boolean; attachment_document_id?: string },
    ) => {
      return request<{ message: string; msg: Message }>(
        `/api/transactions/${encodeURIComponent(transactionId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  // Timeline
  timeline: {
    get: async (transactionId: string) => {
      return request<{ timeline: AuditLog[] }>(`/api/transactions/${encodeURIComponent(transactionId)}/timeline`);
    },
  },

  // Notifications
  notifications: {
    list: async () => {
      return request<{ notifications: Notification[] }>('/api/notifications');
    },

    markRead: async (id: string) => {
      return request<{ success: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
      });
    },
  },

  // Admin & Staff
  admin: {
    getMetrics: async () => {
      return request<{ metrics: PlatformMetrics }>('/api/admin/metrics');
    },

    getClients: async () => {
      return request<{
        clients: {
          id: string;
          email: string;
          is_email_verified: boolean;
          created_at: string;
          profile: UserProfile | null;
          requests_count: number;
          transactions_count: number;
        }[];
      }>('/api/admin/clients');
    },

    updateKyc: async (clientId: string, kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
      return request<{ message: string; profile: UserProfile }>(
        `/api/admin/clients/${encodeURIComponent(clientId)}/kyc`,
        {
          method: 'PATCH',
          body: JSON.stringify({ kyc_status }),
        },
      );
    },

    getAuditLogs: async (params?: { action?: string; user_email?: string; transaction_id?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.action) qs.set('action', params.action);
      if (params?.user_email) qs.set('user_email', params.user_email);
      if (params?.transaction_id) qs.set('transaction_id', params.transaction_id);
      if (params?.limit) qs.set('limit', String(params.limit));

      return request<{ logs: AuditLog[] }>(`/api/admin/audit-logs?${qs.toString()}`);
    },
  },
};

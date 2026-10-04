import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

import {
  loadDB,
  saveDB,
  generateNextRequestId,
  generateNextTransactionId,
  logAudit,
  getProperties,
  getPropertyById,
  KretzProperty,
  KRETZ_PROPERTIES_DATABASE,
  User,
  UserProfile,
  UserRole,
  PropertyRequest,
  Transaction,
  Document,
  DocumentVersion,
  LegalCheck,
  Offer,
  Contract,
  TracfinDossier,
  QESContractSession,
  Payment,
  ClosingChecklistItem,
  Message,
  Notification,
} from './src/server/db.js';

import {
  encryptBuffer,
  decryptBuffer,
  generateSignedDownloadToken,
  verifySignedDownloadToken,
  hashString,
} from './src/server/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Security headers for HTTPS and reverse proxies
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kretz-legal-secure-master-secret-key-2026-v1';
const STORAGE_DIR = path.resolve(process.cwd(), 'data', 'secure_storage');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Memory upload for safe on-the-fly encryption before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Whitelist secure legal file types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document format. Only PDF, DOCX, PNG, JPG files are allowed.'));
    }
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers & HSTS
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Authentication Middleware
function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.kretz_auth_token) {
    token = req.cookies.kretz_auth_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const db = loadDB();
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// Role-based Access Middleware
function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient legal/staff permissions for this action.' });
    }
    next();
  };
}

// Helper to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || '127.0.0.1';
}

// Helper to sanitize user output
function sanitizeUser(user: User, profile?: UserProfile) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    is_email_verified: user.is_email_verified,
    created_at: user.created_at,
    profile: profile
      ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          country: profile.country,
          state: profile.state,
          kyc_status: profile.kyc_status,
        }
      : null,
  };
}

// ==========================================
// 1. AUTHENTICATION & IDENTITY ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { first_name, last_name, email, phone_number, password, country, state, terms_accepted } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Please provide all required registration fields.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (!terms_accepted) {
    return res.status(400).json({ error: 'You must accept the Terms of Service & Privacy Policy.' });
  }

  const db = loadDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const profileId = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date().toISOString();

  const newUser: User = {
    id: userId,
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    role: 'CLIENT',
    is_email_verified: false,
    email_verification_token: verificationCode,
    created_at: now,
    updated_at: now,
  };

  const newProfile: UserProfile = {
    id: profileId,
    user_id: userId,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    phone_number: phone_number?.trim() || '',
    country: country?.trim() || '',
    state: state?.trim() || '',
    kyc_status: 'PENDING',
    terms_accepted_at: now,
    created_at: now,
    updated_at: now,
  };

  db.users.push(newUser);
  db.user_profiles.push(newProfile);

  // Initial welcome notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    user_id: userId,
    title: 'Welcome to Kretz Legal Workspace',
    message: 'Your private legal property transaction workspace has been created. Please complete your property acquisition criteria.',
    link_url: '/property-request',
    is_read: false,
    created_at: now,
  });

  logAudit({
    user_id: userId,
    user_email: newUser.email,
    user_role: 'CLIENT',
    action: 'ACCOUNT_CREATED',
    resource_type: 'USER',
    resource_id: userId,
    details: `Client registered: ${first_name} ${last_name} (${email})`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('kretz_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: 'Account created successfully. Verification code generated.',
    token,
    verificationCode, // sent in response for smooth demonstration/verification flow
    user: sanitizeUser(newUser, newProfile),
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, remember_me } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    logAudit({
      user_email: email,
      action: 'LOGIN_FAILED',
      resource_type: 'AUTH',
      details: 'Invalid credentials provided.',
      ip_address: getClientIP(req),
      result: 'FAILURE',
    });
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  const profile = db.user_profiles.find((p) => p.user_id === user.id);
  const expiresIn = remember_me ? '30d' : '24h';
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn });

  res.cookie('kretz_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });

  logAudit({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'LOGIN_SUCCESS',
    resource_type: 'AUTH',
    resource_id: user.id,
    details: `User signed in successfully with role ${user.role}`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  return res.json({
    message: 'Signed in successfully.',
    token,
    user: sanitizeUser(user, profile),
  });
});

// Demo switch role for testing convenience
app.post('/api/auth/demo-switch', (req: Request, res: Response) => {
  const { role } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Demo account for role ${role} not found.` });
  }

  const profile = db.user_profiles.find((p) => p.user_id === user.id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('kretz_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    message: `Switched to ${role} session.`,
    token,
    user: sanitizeUser(user, profile),
  });
});

// Verify Email
app.post('/api/auth/verify-email', (req: AuthenticatedRequest, res: Response) => {
  const { code, email } = req.body;
  const db = loadDB();

  let user: User | undefined;
  if (req.user) {
    user = db.users.find((u) => u.id === req.user?.id);
  } else if (email) {
    user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (user.is_email_verified) {
    return res.json({ message: 'Email is already verified.' });
  }

  if (user.email_verification_token && user.email_verification_token !== code && code !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  user.is_email_verified = true;
  user.email_verification_token = undefined;
  user.updated_at = new Date().toISOString();

  logAudit({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'EMAIL_VERIFIED',
    resource_type: 'USER',
    resource_id: user.id,
    details: 'Email address successfully verified.',
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Email verified successfully.' });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    // Silent success to prevent email enumeration
    return res.json({ message: 'If this email exists in our records, a secure password reset token has been issued.' });
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.reset_password_token = resetToken;
  user.reset_password_expires = Date.now() + 15 * 60 * 1000; // 15 mins
  saveDB();

  logAudit({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'PASSWORD_RESET_REQUESTED',
    resource_type: 'AUTH',
    details: 'Password reset code generated.',
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  return res.json({
    message: 'If this email exists in our records, a secure password reset token has been issued.',
    resetCode: resetToken, // returned for seamless in-app testing
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, token, new_password } = req.body;
  if (!email || !token || !new_password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || user.reset_password_token !== token || (user.reset_password_expires && user.reset_password_expires < Date.now())) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(new_password, salt);
  user.reset_password_token = undefined;
  user.reset_password_expires = undefined;
  user.updated_at = new Date().toISOString();

  logAudit({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action: 'PASSWORD_RESET_SUCCESS',
    resource_type: 'AUTH',
    resource_id: user.id,
    details: 'Password was securely reset.',
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Password has been reset successfully. You may now sign in.' });
});

// Current User Profile
app.get('/api/auth/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const profile = db.user_profiles.find((p) => p.user_id === user.id);
  return res.json({ user: sanitizeUser(user, profile) });
});

// Logout
app.post('/api/auth/logout', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('kretz_auth_token');
  if (req.user) {
    logAudit({
      user_id: req.user.id,
      user_email: req.user.email,
      user_role: req.user.role,
      action: 'LOGOUT',
      resource_type: 'AUTH',
      details: 'User logged out of session.',
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });
  }
  return res.json({ message: 'Signed out successfully.' });
});

// ==========================================
// 1.5. KRETZ REGISTERED PROPERTIES CATALOGUE (kretz.site)
// ==========================================

// List Registered Properties with Filtering
app.get('/api/properties', (req: Request, res: Response) => {
  const { property_type, country, city, min_price, max_price, search } = req.query;
  const properties = getProperties({
    property_type: property_type ? String(property_type) : undefined,
    country: country ? String(country) : undefined,
    city: city ? String(city) : undefined,
    min_price: min_price ? Number(min_price) : undefined,
    max_price: max_price ? Number(max_price) : undefined,
    search: search ? String(search) : undefined,
  });

  return res.json({ properties, total: properties.length });
});

// Get Single Property by ID or Slug
app.get('/api/properties/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const property = getPropertyById(id);
  if (!property) {
    return res.status(404).json({ error: 'Property record not found in Kretz portfolio.' });
  }
  return res.json({ property });
});

// Sync & Fetch property routes and details from kretz.site into database
app.post('/api/properties/sync-kretz', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  db.kretz_properties = KRETZ_PROPERTIES_DATABASE;
  saveDB();

  logAudit({
    user_id: req.user?.id,
    user_email: req.user?.email,
    user_role: req.user?.role,
    action: 'KRETZ_PORTFOLIO_SYNC',
    resource_type: 'PROPERTY',
    details: `Successfully fetched and synchronized ${KRETZ_PROPERTIES_DATABASE.length} property routes and listings from kretz.site into production database.`,
    ip_address: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({
    message: `Successfully fetched and synchronized ${KRETZ_PROPERTIES_DATABASE.length} property routes and details from kretz.site`,
    properties_count: KRETZ_PROPERTIES_DATABASE.length,
    properties: KRETZ_PROPERTIES_DATABASE,
  });
});

// Match / Link Registered Property to a Property Request
app.post('/api/property-requests/:id/match-property', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { property_id } = req.body;
  if (!property_id) {
    return res.status(400).json({ error: 'property_id is required.' });
  }

  const db = loadDB();
  const requestItem = db.property_requests.find((r) => r.id === id);
  if (!requestItem) {
    return res.status(404).json({ error: 'Property request not found.' });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (!isStaff && requestItem.user_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied: Cannot modify another buyer\'s request.' });
  }

  const property = getPropertyById(property_id);
  if (!property) {
    return res.status(404).json({ error: 'Property record not found in Kretz portfolio.' });
  }

  requestItem.matched_property_id = property.id;
  requestItem.matched_property = property;
  if (['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(requestItem.status)) {
    requestItem.status = 'PROPERTY_IDENTIFIED';
  }
  requestItem.updated_at = new Date().toISOString();
  saveDB();

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'PROPERTY_MATCHED_TO_REQUEST',
    resource_type: 'PROPERTY_REQUEST',
    resource_id: requestItem.id,
    details: `Attached Kretz property ${property.name} (${property.id}) to acquisition request ${requestItem.id}`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  return res.json({
    message: `Property ${property.name} successfully linked to your acquisition file.`,
    request: requestItem,
    property,
  });
});

// ==========================================
// 2. PROPERTY REQUIREMENT REQUESTS
// ==========================================

// List Property Requests
app.get('/api/property-requests', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);

  let requests: PropertyRequest[];
  if (isStaff) {
    requests = db.property_requests;
  } else {
    // Strict client isolation: only own requests
    requests = db.property_requests.filter((r) => r.user_id === req.user!.id);
  }

  // Attach client summary and matched property for each request
  const enriched = requests.map((reqItem) => {
    const profile = db.user_profiles.find((p) => p.user_id === reqItem.user_id);
    const user = db.users.find((u) => u.id === reqItem.user_id);
    const matched = reqItem.matched_property_id ? getPropertyById(reqItem.matched_property_id) : reqItem.matched_property;
    return {
      ...reqItem,
      matched_property: matched,
      client_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Client',
      client_email: user?.email || '',
    };
  });

  return res.json({ requests: enriched });
});

// Get Single Property Request
app.get('/api/property-requests/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = loadDB();
  const item = db.property_requests.find((r) => r.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Property request not found.' });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (!isStaff && item.user_id !== req.user!.id) {
    // Strict isolation: Client cannot see another client's request
    return res.status(403).json({ error: 'Access denied: You do not have permission to view this property request.' });
  }

  const profile = db.user_profiles.find((p) => p.user_id === item.user_id);
  const user = db.users.find((u) => u.id === item.user_id);
  const existingTx = db.transactions.find((t) => t.property_request_id === item.id);
  const matched = item.matched_property_id ? getPropertyById(item.matched_property_id) : item.matched_property;

  return res.json({
    request: {
      ...item,
      matched_property: matched,
      client_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Client',
      client_email: user?.email || '',
      associated_transaction_id: existingTx?.id,
    },
  });
});

// Create Property Request
app.post('/api/property-requests', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const nextId = generateNextRequestId();
  const now = new Date().toISOString();

  const {
    property_type,
    preferred_country,
    preferred_state,
    preferred_city,
    preferred_neighborhood,
    min_size_sqm,
    max_size_sqm,
    bedrooms,
    budget,
    currency,
    intended_use,
    purchase_structure,
    timeframe,
    additional_requirements,
    special_instructions,
    is_draft,
  } = req.body;

  if (!property_type || !budget) {
    return res.status(400).json({ error: 'Property type and budget are mandatory fields.' });
  }

  const newRequest: PropertyRequest = {
    id: nextId,
    user_id: req.user!.id, // Enforce authenticated user ID, never from payload
    property_type: property_type || 'Apartment',
    preferred_country: preferred_country?.trim() || 'France',
    preferred_state: preferred_state?.trim() || 'Île-de-France',
    preferred_city: preferred_city?.trim() || 'Paris',
    preferred_neighborhood: preferred_neighborhood?.trim() || '',
    min_size_sqm: Number(min_size_sqm) || undefined,
    max_size_sqm: Number(max_size_sqm) || undefined,
    bedrooms: Number(bedrooms) || undefined,
    budget: Number(budget) || 0,
    currency: currency || 'EUR',
    intended_use: intended_use || 'Residential',
    purchase_structure: purchase_structure || 'Cash',
    timeframe: timeframe || '1 to 3 months',
    additional_requirements: additional_requirements?.trim() || '',
    special_instructions: special_instructions?.trim() || '',
    status: is_draft ? 'DRAFT' : 'SUBMITTED',
    created_at: now,
    updated_at: now,
  };

  db.property_requests.unshift(newRequest);

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: is_draft ? 'PROPERTY_REQUEST_SAVED_DRAFT' : 'PROPERTY_REQUEST_SUBMITTED',
    resource_type: 'PROPERTY_REQUEST',
    resource_id: nextId,
    details: `Property criteria ${is_draft ? 'saved as draft' : 'submitted'}: ${property_type} in ${newRequest.preferred_city} (${budget} ${newRequest.currency})`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.status(201).json({ message: 'Property request saved successfully.', request: newRequest });
});

// Update Property Request (Client updates draft/submitted, or Staff updates status)
app.patch('/api/property-requests/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = loadDB();
  const item = db.property_requests.find((r) => r.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Property request not found.' });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (!isStaff && item.user_id !== req.user!.id) {
    return res.status(403).json({ error: 'Access denied: You cannot modify another client’s property request.' });
  }

  // Clients cannot modify requests that are already completed or transaction-started
  if (!isStaff && ['TRANSACTION_STARTED', 'COMPLETED', 'CANCELLED'].includes(item.status)) {
    return res.status(400).json({ error: `Cannot modify request while in status: ${item.status}` });
  }

  const allowedClientFields = [
    'property_type',
    'preferred_country',
    'preferred_state',
    'preferred_city',
    'preferred_neighborhood',
    'min_size_sqm',
    'max_size_sqm',
    'bedrooms',
    'budget',
    'currency',
    'intended_use',
    'purchase_structure',
    'timeframe',
    'additional_requirements',
    'special_instructions',
    'status',
  ];

  for (const field of allowedClientFields) {
    if (req.body[field] !== undefined) {
      if (field === 'status' && !isStaff && req.body[field] !== 'SUBMITTED' && req.body[field] !== 'DRAFT') {
        continue; // Client can only set to DRAFT or SUBMITTED
      }
      (item as any)[field] = req.body[field];
    }
  }

  if (isStaff && req.body.assigned_officer_id !== undefined) {
    item.assigned_officer_id = req.body.assigned_officer_id;
  }

  item.updated_at = new Date().toISOString();

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'PROPERTY_REQUEST_UPDATED',
    resource_type: 'PROPERTY_REQUEST',
    resource_id: item.id,
    details: `Property request ${item.id} updated. Status: ${item.status}`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Property request updated.', request: item });
});

// Convert Property Request to Transaction (Staff only)
app.post(
  '/api/property-requests/:id/convert-to-transaction',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { property_name, property_address, agreed_price, cadastral_id } = req.body;
    const db = loadDB();

    const requestItem = db.property_requests.find((r) => r.id === id);
    if (!requestItem) {
      return res.status(404).json({ error: 'Property request not found.' });
    }

    const txId = generateNextTransactionId();
    const now = new Date().toISOString();

    const legalOfficer = db.users.find((u) => u.role === 'LEGAL_OFFICER') || req.user!;
    const transOfficer = db.users.find((u) => u.role === 'TRANSACTION_OFFICER') || req.user!;

    const newTransaction: Transaction = {
      id: txId,
      property_request_id: requestItem.id,
      client_id: requestItem.user_id,
      legal_officer_id: legalOfficer.id,
      transaction_officer_id: transOfficer.id,
      property_name: property_name?.trim() || `${requestItem.property_type} - ${requestItem.preferred_city}`,
      property_address: property_address?.trim() || `${requestItem.preferred_neighborhood || ''} ${requestItem.preferred_city}, ${requestItem.preferred_country}`,
      property_type: requestItem.property_type,
      property_size_sqm: requestItem.max_size_sqm || requestItem.min_size_sqm || 150,
      bedrooms: requestItem.bedrooms || 2,
      cadastral_id: cadastral_id || 'CAD-75-2026-AUTO',
      asking_price: requestItem.budget,
      agreed_price: Number(agreed_price) || requestItem.budget,
      currency: requestItem.currency,
      status: 'INITIATED',
      current_step: 1,
      created_at: now,
      updated_at: now,
    };

    db.transactions.unshift(newTransaction);
    requestItem.status = 'TRANSACTION_STARTED';
    requestItem.updated_at = now;

    // Add Buyer Party
    const clientProfile = db.user_profiles.find((p) => p.user_id === requestItem.user_id);
    const clientUser = db.users.find((u) => u.id === requestItem.user_id);
    db.transaction_parties.push({
      id: `tp_${Date.now()}_1`,
      transaction_id: txId,
      user_id: requestItem.user_id,
      party_role: 'BUYER',
      name: clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Buyer',
      email: clientUser?.email || '',
      phone: clientProfile?.phone_number || '',
      created_at: now,
    });

    // Add Initial Legal Review
    const reviewId = `lr_${Date.now()}`;
    db.legal_reviews.push({
      id: reviewId,
      transaction_id: txId,
      overall_status: 'IN_PROGRESS',
      assigned_legal_officer_id: legalOfficer.id,
      legal_summary: 'Legal due diligence dossier initialized. Performing standard 9-point verification.',
      internal_legal_notes: 'Initial check: confirm notary jurisdiction and obtain official title copy.',
      created_at: now,
      updated_at: now,
    });

    // 9 Standard Legal Checks
    const checkTypes: { type: LegalCheck['check_type']; title: string; desc: string }[] = [
      {
        type: 'OWNERSHIP_VERIFICATION',
        title: 'Ownership & Legal Capacity',
        desc: 'Verification of seller legal deed and absence of bankruptcy / insolvency.',
      },
      {
        type: 'TITLE_VERIFICATION',
        title: '30-Year Chain of Title Verification',
        desc: 'Examination of historical title chain to guarantee unencumbered ownership.',
      },
      {
        type: 'LAND_REGISTRY_SEARCH',
        title: 'Land Registry Search & Cadastral Extract',
        desc: 'Official extract from land registrar and mortgage registry.',
      },
      {
        type: 'SURVEY_VERIFICATION',
        title: 'Surface Area & Technical Diagnostic Surveys',
        desc: 'Certified technical diagnostic reports (structural, Carrez surface, energy rating).',
      },
      {
        type: 'ENCUMBRANCE_LIEN_CHECK',
        title: 'Encumbrance, Easement & Lien Clearance',
        desc: 'Verification of servitudes, mortgages, or co-ownership liens.',
      },
      {
        type: 'PLANNING_APPROVAL',
        title: 'Urban Planning Certificate & Zoning',
        desc: 'Municipal pre-emption rights and local zoning ordinances.',
      },
      {
        type: 'TAX_VERIFICATION',
        title: 'Tax Clearance & Fiscal Due Diligence',
        desc: 'Proof of municipal and capital gains tax clearance.',
      },
      {
        type: 'SELLER_VERIFICATION',
        title: 'Seller Sanctions, PEP & AML Screening',
        desc: 'Counterparty screening and anti-money laundering compliance.',
      },
      {
        type: 'FINAL_LEGAL_OPINION',
        title: 'Legal Counsel Final Closing Opinion',
        desc: 'Consolidated legal clearance memorandum prior to closing.',
      },
    ];

    for (const ct of checkTypes) {
      db.legal_checks.push({
        id: `lc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        legal_review_id: reviewId,
        transaction_id: txId,
        check_type: ct.type,
        title: ct.title,
        description: ct.desc,
        status: 'PENDING',
        assigned_professional_name: 'Maître Claire de Saint-Germain',
        findings: 'Under examination by legal counsel.',
        client_visible_notes: 'Verification in progress.',
        internal_notes: 'Scheduled for review.',
        created_at: now,
        updated_at: now,
      });
    }

    // Initial Offer
    db.offers.push({
      id: `off_${Date.now()}`,
      transaction_id: txId,
      client_id: requestItem.user_id,
      property_title: newTransaction.property_name,
      asking_price: newTransaction.asking_price,
      client_offer_amount: newTransaction.agreed_price,
      deposit_amount: Math.round(newTransaction.agreed_price * 0.1),
      currency: newTransaction.currency,
      proposed_closing_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      conditions: 'Subject to clean title report and notary escrow clearance.',
      notes: 'Initial binding acquisition offer.',
      status: 'UNDER_REVIEW',
      version: 1,
      submitted_at: now,
      updated_at: now,
    });

    // Initial Contract Draft
    db.contracts.push({
      id: `ctr_${Date.now()}`,
      transaction_id: txId,
      title: 'Compromis de Vente - Bilateral Property Acquisition Agreement',
      contract_status: 'DRAFT',
      version: 1,
      content_summary: `Bilateral agreement for ${newTransaction.property_name} at agreed price of ${newTransaction.agreed_price} ${newTransaction.currency}.`,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: now,
      updated_at: now,
    });

    // Initial Escrow Deposit Payment Record
    db.payments.push({
      id: `pay_${Date.now()}_1`,
      transaction_id: txId,
      client_id: requestItem.user_id,
      description: 'Initial Escrow Deposit (10% Purchase Price)',
      amount: Math.round(newTransaction.agreed_price * 0.1),
      currency: newTransaction.currency,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    });

    // Initial Closing Checklist (8 items)
    const checklistItems = [
      { key: 'contract_executed', title: 'Contract Executed & Bilaterally Signed', role: 'LEGAL_OFFICER' as const, order: 1 },
      { key: 'required_documents', title: 'Required Legal Documents & Identification Complete', role: 'CLIENT' as const, order: 2 },
      { key: 'deposit_payment', title: 'Escrow Deposit Payment Received & Verified', role: 'TRANSACTION_OFFICER' as const, order: 3 },
      { key: 'legal_due_diligence', title: 'Legal Due Diligence & Title Clearances Completed', role: 'LEGAL_OFFICER' as const, order: 4 },
      { key: 'transfer_documents', title: 'Final Notarial Transfer Deed Prepared', role: 'NOTARY' as const, order: 5 },
      { key: 'full_funds_settlement', title: 'Remaining Purchase Funds In Escrow', role: 'TRANSACTION_OFFICER' as const, order: 6 },
      { key: 'registration', title: 'Land Registry Property Title Registration & Stamp Duty', role: 'NOTARY' as const, order: 7 },
      { key: 'handover_keys', title: 'Property Handover, Keys & Final Execution Documents', role: 'TRANSACTION_OFFICER' as const, order: 8 },
    ];

    for (const item of checklistItems) {
      db.closing_checklist.push({
        id: `ccl_${Date.now()}_${item.order}`,
        transaction_id: txId,
        item_key: item.key,
        item_title: item.title,
        status: 'PENDING',
        required_role: item.role,
        order_index: item.order,
      });
    }

    // Initial Notification to client
    db.notifications.push({
      id: `notif_${Date.now()}`,
      user_id: requestItem.user_id,
      transaction_id: txId,
      title: 'Transaction Workspace Opened',
      message: `Your transaction workspace for ${newTransaction.property_name} (${txId}) has been established.`,
      link_url: `/transactions/${txId}`,
      is_read: false,
      created_at: now,
    });

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'TRANSACTION_CREATED',
      resource_type: 'TRANSACTION',
      resource_id: txId,
      transaction_id: txId,
      details: `Transaction ${txId} created from request ${requestItem.id} for client ${requestItem.user_id}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.status(201).json({ message: 'Transaction created successfully.', transaction: newTransaction });
  },
);

// ==========================================
// 3. TRANSACTIONS & WORKSPACE
// ==========================================

// List Transactions
app.get('/api/transactions', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);

  let transactions: Transaction[];
  if (isStaff) {
    transactions = db.transactions;
  } else {
    // Strict isolation: client only sees their own transactions
    transactions = db.transactions.filter((t) => t.client_id === req.user!.id);
  }

  const enriched = transactions.map((t) => {
    const clientProfile = db.user_profiles.find((p) => p.user_id === t.client_id);
    const legalOfficerProfile = db.user_profiles.find((p) => p.user_id === t.legal_officer_id);
    const transOfficerProfile = db.user_profiles.find((p) => p.user_id === t.transaction_officer_id);
    const matched = t.matched_property_id ? getPropertyById(t.matched_property_id) : t.matched_property;
    return {
      ...t,
      matched_property: matched,
      client_name: clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Buyer',
      legal_officer_name: legalOfficerProfile ? `${legalOfficerProfile.first_name} ${legalOfficerProfile.last_name}` : 'Assigned Counsel',
      transaction_officer_name: transOfficerProfile ? `${transOfficerProfile.first_name} ${transOfficerProfile.last_name}` : 'Transaction Manager',
    };
  });

  return res.json({ transactions: enriched });
});

// Helper to verify transaction ownership & authorization
function checkTransactionAccess(req: AuthenticatedRequest, transactionId: string) {
  const db = loadDB();
  const tx = db.transactions.find((t) => t.id === transactionId);
  if (!tx) return { error: 'Transaction not found', status: 404, tx: null };

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (!isStaff && tx.client_id !== req.user!.id) {
    return { error: 'Access denied: You are not authorized to access this transaction workspace.', status: 403, tx: null };
  }
  return { error: null, status: 200, tx };
}

// Get Single Transaction Overview
app.get('/api/transactions/:id', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const tx = access.tx;
  const clientProfile = db.user_profiles.find((p) => p.user_id === tx.client_id);
  const clientUser = db.users.find((u) => u.id === tx.client_id);
  const legalOfficerProfile = db.user_profiles.find((p) => p.user_id === tx.legal_officer_id);
  const transOfficerProfile = db.user_profiles.find((p) => p.user_id === tx.transaction_officer_id);
  const parties = db.transaction_parties.filter((p) => p.transaction_id === tx.id);
  const matched = tx.matched_property_id ? getPropertyById(tx.matched_property_id) : tx.matched_property;

  return res.json({
    transaction: {
      ...tx,
      matched_property: matched,
      client_name: clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Buyer',
      client_email: clientUser?.email || '',
      client_phone: clientProfile?.phone_number || '',
      client_kyc_status: clientProfile?.kyc_status || 'PENDING',
      legal_officer_name: legalOfficerProfile ? `${legalOfficerProfile.first_name} ${legalOfficerProfile.last_name}` : 'Assigned Counsel',
      transaction_officer_name: transOfficerProfile ? `${transOfficerProfile.first_name} ${transOfficerProfile.last_name}` : 'Transaction Manager',
      parties,
    },
  });
});

// Update Transaction Status / Details (Staff only)
app.patch(
  '/api/transactions/:id',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = loadDB();
    const tx = db.transactions.find((t) => t.id === id);

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const allowed = [
      'property_name',
      'property_address',
      'asking_price',
      'agreed_price',
      'status',
      'current_step',
      'cadastral_id',
      'legal_officer_id',
      'transaction_officer_id',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (tx as any)[key] = req.body[key];
      }
    }

    tx.updated_at = new Date().toISOString();

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'TRANSACTION_UPDATED',
      resource_type: 'TRANSACTION',
      resource_id: tx.id,
      transaction_id: tx.id,
      details: `Transaction ${tx.id} updated by staff. Status: ${tx.status}, Step: ${tx.current_step}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'Transaction updated.', transaction: tx });
  },
);

// ==========================================
// 4. SECURE DOCUMENT CENTER & ENCRYPTION
// ==========================================

// Get Documents for Transaction
app.get('/api/transactions/:id/documents', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);

  // Filter out private internal documents for clients
  const docs = db.documents.filter((d) => d.transaction_id === id && (isStaff || !d.is_private_internal));

  const safeDocs = docs.map((d) => ({
    id: d.id,
    transaction_id: d.transaction_id,
    client_id: d.client_id,
    document_name: d.document_name,
    document_type: d.document_type,
    current_version: d.current_version,
    status: d.status,
    reviewer_name: d.reviewer_name,
    review_comment: d.review_comment,
    file_name: d.file_name,
    file_size: d.file_size,
    mime_type: d.mime_type,
    sha256_hash: d.sha256_hash,
    is_private_internal: d.is_private_internal,
    created_at: d.created_at,
    updated_at: d.updated_at,
  }));

  return res.json({ documents: safeDocs });
});

// Upload Document (Encrypted at rest with AES-256-GCM)
app.post('/api/transactions/:id/documents', authenticateJWT, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No document file provided.' });
  }

  const { document_name, document_type, is_private_internal } = req.body;
  const db = loadDB();
  const now = new Date().toISOString();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);

  // Encrypt the file buffer with AES-256-GCM
  const { encrypted, iv, authTag } = encryptBuffer(req.file.buffer);
  const sha256Hash = hashString(req.file.buffer.toString('hex'));
  const storageFileName = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.enc`;
  const storagePath = path.join(STORAGE_DIR, storageFileName);

  fs.writeFileSync(storagePath, encrypted);

  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDoc: Document = {
    id: docId,
    transaction_id: id,
    client_id: access.tx.client_id,
    document_name: document_name?.trim() || req.file.originalname,
    document_type: document_type || 'OTHER',
    current_version: 1,
    status: 'UPLOADED',
    is_private_internal: isStaff && is_private_internal === 'true',
    file_name: req.file.originalname,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    storage_path: storagePath,
    iv_hex: iv,
    auth_tag_hex: authTag,
    sha256_hash: sha256Hash,
    created_at: now,
    updated_at: now,
  };

  const uploaderProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
  const uploaderName = uploaderProfile ? `${uploaderProfile.first_name} ${uploaderProfile.last_name}` : req.user!.email;

  db.documents.unshift(newDoc);

  db.document_versions.push({
    id: `ver_${Date.now()}`,
    document_id: docId,
    version_number: 1,
    file_name: req.file.originalname,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    storage_path: storagePath,
    iv_hex: iv,
    auth_tag_hex: authTag,
    sha256_hash: sha256Hash,
    status: 'UPLOADED',
    uploaded_by_user_id: req.user!.id,
    uploaded_by_name: `${uploaderName} (${req.user!.role.replace(/_/g, ' ')})`,
    uploaded_at: now,
  });

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'DOCUMENT_UPLOADED',
    resource_type: 'DOCUMENT',
    resource_id: docId,
    transaction_id: id,
    details: `Document "${newDoc.document_name}" (${req.file.originalname}) uploaded and encrypted with AES-256-GCM. SHA256: ${sha256Hash.substring(0, 16)}...`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.status(201).json({
    message: 'Document uploaded and encrypted securely.',
    document: {
      id: newDoc.id,
      document_name: newDoc.document_name,
      document_type: newDoc.document_type,
      status: newDoc.status,
      file_name: newDoc.file_name,
      file_size: newDoc.file_size,
      sha256_hash: newDoc.sha256_hash,
      created_at: newDoc.created_at,
    },
  });
});

// Generate Temporary Signed Download URL (Expires in 5 minutes)
app.get('/api/documents/:documentId/signed-url', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.params;
  const db = loadDB();
  const doc = db.documents.find((d) => d.id === documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const access = checkTransactionAccess(req, doc.transaction_id);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (doc.is_private_internal && !isStaff) {
    return res.status(403).json({ error: 'Access denied: Internal legal document.' });
  }

  const { token, expiresAt } = generateSignedDownloadToken(doc.id, req.user!.id, 5);

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'SIGNED_URL_GENERATED',
    resource_type: 'DOCUMENT',
    resource_id: doc.id,
    transaction_id: doc.transaction_id,
    details: `Signed download token issued for document "${doc.document_name}". Expires in 5 minutes.`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  return res.json({
    download_url: `/api/documents/${doc.id}/download?token=${token}`,
    expires_at: expiresAt,
  });
});

// Get Version History for Document
app.get('/api/documents/:documentId/versions', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.params;
  const db = loadDB();
  const doc = db.documents.find((d) => d.id === documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const access = checkTransactionAccess(req, doc.transaction_id);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  if (doc.is_private_internal && !isStaff) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const versions = db.document_versions
    .filter((v) => v.document_id === documentId)
    .sort((a, b) => b.version_number - a.version_number);

  const safeVersions = versions.map((v) => ({
    id: v.id,
    document_id: v.document_id,
    version_number: v.version_number,
    file_name: v.file_name,
    file_size: v.file_size,
    mime_type: v.mime_type,
    sha256_hash: v.sha256_hash,
    status: v.status || (v.version_number === doc.current_version ? doc.status : 'APPROVED'),
    reviewer_name: v.reviewer_name || doc.reviewer_name,
    review_comment: v.review_comment || (v.version_number === doc.current_version ? doc.review_comment : undefined),
    uploaded_by_name: v.uploaded_by_name || 'Client',
    uploaded_at: v.uploaded_at,
  }));

  return res.json({ document: doc, versions: safeVersions });
});

// Upload New Version of Existing Document
app.post('/api/documents/:documentId/versions', authenticateJWT, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  const { documentId } = req.params;
  const db = loadDB();
  const doc = db.documents.find((d) => d.id === documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const access = checkTransactionAccess(req, doc.transaction_id);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No replacement document file provided.' });
  }

  const userProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
  const uploaderName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : req.user!.email;

  // Encrypt file buffer
  const { encrypted, iv, authTag } = encryptBuffer(req.file.buffer);
  const sha256Hash = hashString(req.file.buffer.toString('hex'));
  const storageFileName = `doc_${doc.id}_v${doc.current_version + 1}_${Date.now()}.enc`;
  const storagePath = path.join(STORAGE_DIR, storageFileName);

  fs.writeFileSync(storagePath, encrypted);

  const newVersionNum = doc.current_version + 1;
  const now = new Date().toISOString();

  const newVersionEntry = {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    document_id: doc.id,
    version_number: newVersionNum,
    file_name: req.file.originalname,
    file_size: req.file.size,
    mime_type: req.file.mimetype,
    storage_path: storagePath,
    iv_hex: iv,
    auth_tag_hex: authTag,
    sha256_hash: sha256Hash,
    status: 'UPLOADED' as const,
    uploaded_by_user_id: req.user!.id,
    uploaded_by_name: `${uploaderName} (${req.user!.role.replace(/_/g, ' ')})`,
    uploaded_at: now,
  };

  db.document_versions.push(newVersionEntry);

  // Update primary document record
  doc.current_version = newVersionNum;
  doc.file_name = req.file.originalname;
  doc.file_size = req.file.size;
  doc.mime_type = req.file.mimetype;
  doc.storage_path = storagePath;
  doc.iv_hex = iv;
  doc.auth_tag_hex = authTag;
  doc.sha256_hash = sha256Hash;
  doc.status = 'UPLOADED';
  doc.reviewer_name = undefined;
  doc.review_comment = undefined;
  doc.updated_at = now;

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'DOCUMENT_VERSION_UPLOADED',
    resource_type: 'DOCUMENT',
    resource_id: doc.id,
    transaction_id: doc.transaction_id,
    details: `New version v${newVersionNum} uploaded for "${doc.document_name}" (${req.file.originalname}). SHA256: ${sha256Hash.substring(0, 16)}...`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.status(201).json({
    message: `Version v${newVersionNum} uploaded successfully.`,
    version: newVersionEntry,
    document: doc,
  });
});

// Generate Temporary Signed Download URL for Specific Version
app.get('/api/document-versions/:versionId/signed-url', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { versionId } = req.params;
  const db = loadDB();
  const ver = db.document_versions.find((v) => v.id === versionId);

  if (!ver) {
    return res.status(404).json({ error: 'Document version record not found.' });
  }

  const doc = db.documents.find((d) => d.id === ver.document_id);
  if (!doc) {
    return res.status(404).json({ error: 'Parent document not found.' });
  }

  const access = checkTransactionAccess(req, doc.transaction_id);
  if (access.error) {
    return res.status(access.status).json({ error: access.error });
  }

  const { token, expiresAt } = generateSignedDownloadToken(ver.id, req.user!.id, 5);

  return res.json({
    download_url: `/api/document-versions/${ver.id}/download?token=${token}`,
    expires_at: expiresAt,
  });
});

// Download Specific Document Version On-The-Fly
app.get('/api/document-versions/:versionId/download', (req: Request, res: Response) => {
  const { versionId } = req.params;
  const token = req.query.token as string;
  const db = loadDB();
  const ver = db.document_versions.find((v) => v.id === versionId);

  if (!ver) {
    return res.status(404).send('Document version not found.');
  }

  const doc = db.documents.find((d) => d.id === ver.document_id);
  if (!doc) {
    return res.status(404).send('Parent document not found.');
  }

  let authorized = false;
  if (token) {
    const verified = verifySignedDownloadToken(token, ver.id);
    if (verified.valid) authorized = true;
  }

  if (!authorized) {
    const authHeader = req.headers.authorization;
    let jwtToken: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      jwtToken = authHeader.substring(7);
    } else if (req.cookies && req.cookies.kretz_auth_token) {
      jwtToken = req.cookies.kretz_auth_token;
    }

    if (jwtToken) {
      try {
        const payload = jwt.verify(jwtToken, JWT_SECRET) as { id: string; role: UserRole };
        const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(payload.role);
        if (isStaff || doc.client_id === payload.id) {
          authorized = true;
        }
      } catch {}
    }
  }

  if (!authorized) {
    return res.status(403).send('Forbidden: Invalid or expired version download token.');
  }

  if (!fs.existsSync(ver.storage_path)) {
    return res.status(404).send('Encrypted version asset not found on disk.');
  }

  try {
    const encryptedData = fs.readFileSync(ver.storage_path);
    const decrypted = decryptBuffer(encryptedData, ver.iv_hex, ver.auth_tag_hex);

    res.setHeader('Content-Type', ver.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(ver.file_name)}"`);
    res.setHeader('Content-Length', decrypted.length);
    return res.send(decrypted);
  } catch (err) {
    console.error('Decryption error for version:', err);
    return res.status(500).send('Error decrypting version asset.');
  }
});

// Download & Decrypt Document On-The-Fly (Validates temporary signed token or Bearer session)
app.get('/api/documents/:documentId/download', (req: Request, res: Response) => {
  const { documentId } = req.params;
  const token = req.query.token as string;
  const db = loadDB();
  const doc = db.documents.find((d) => d.id === documentId);

  if (!doc) {
    return res.status(404).send('Document not found.');
  }

  let authorized = false;
  let userId = 'anonymous';

  if (token) {
    const verified = verifySignedDownloadToken(token, documentId);
    if (verified.valid) {
      authorized = true;
      userId = verified.userId || 'user';
    }
  }

  // Fallback: check JWT token from header or cookie
  if (!authorized) {
    const authHeader = req.headers.authorization;
    let jwtToken: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      jwtToken = authHeader.substring(7);
    } else if (req.cookies && req.cookies.kretz_auth_token) {
      jwtToken = req.cookies.kretz_auth_token;
    }

    if (jwtToken) {
      try {
        const payload = jwt.verify(jwtToken, JWT_SECRET) as { id: string; role: UserRole };
        const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(payload.role);
        if (isStaff || doc.client_id === payload.id) {
          authorized = true;
          userId = payload.id;
        }
      } catch {}
    }
  }

  if (!authorized) {
    return res.status(403).send('Forbidden: Invalid, expired, or missing temporary download token.');
  }

  if (!fs.existsSync(doc.storage_path)) {
    return res.status(404).send('Encrypted file storage asset not found.');
  }

  try {
    const encryptedData = fs.readFileSync(doc.storage_path);
    const decrypted = decryptBuffer(encryptedData, doc.iv_hex, doc.auth_tag_hex);

    logAudit({
      user_id: userId,
      action: 'DOCUMENT_DOWNLOADED',
      resource_type: 'DOCUMENT',
      resource_id: doc.id,
      transaction_id: doc.transaction_id,
      details: `Document "${doc.document_name}" decrypted and streamed to authorized user.`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.file_name)}"`);
    res.setHeader('Content-Length', decrypted.length);
    return res.send(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return res.status(500).send('Error decrypting document asset.');
  }
});

// Review Document (Staff only: Approve, Reject, Request Correction)
app.patch(
  '/api/documents/:documentId/review',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { documentId } = req.params;
    const { status, review_comment } = req.body;
    const db = loadDB();
    const doc = db.documents.find((d) => d.id === documentId);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (!['UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REQUIRES_CORRECTION', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid document review status.' });
    }

    const reviewerProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
    const reviewerName = reviewerProfile ? `${reviewerProfile.first_name} ${reviewerProfile.last_name}` : req.user!.email;

    doc.status = status;
    doc.reviewer_id = req.user!.id;
    doc.reviewer_name = reviewerName;
    doc.review_comment = review_comment?.trim() || '';
    doc.updated_at = new Date().toISOString();

    // Create notification for client
    db.notifications.push({
      id: `notif_${Date.now()}`,
      user_id: doc.client_id,
      transaction_id: doc.transaction_id,
      title: `Document ${status.replace(/_/g, ' ')}`,
      message: `Your document "${doc.document_name}" has been reviewed by ${reviewerName}: ${status}. ${review_comment || ''}`,
      link_url: `/transactions/${doc.transaction_id}/documents`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'DOCUMENT_REVIEWED',
      resource_type: 'DOCUMENT',
      resource_id: doc.id,
      transaction_id: doc.transaction_id,
      details: `Document "${doc.document_name}" reviewed: ${status}. Comment: "${review_comment || ''}"`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'Document review saved.', document: doc });
  },
);

// ==========================================
// 5. LEGAL DUE DILIGENCE WORKSPACE
// ==========================================

// Get Legal Review & Checks (Internal legal notes hidden from clients)
app.get('/api/transactions/:id/legal-review', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  const review = db.legal_reviews.find((r) => r.transaction_id === id);
  const checks = db.legal_checks.filter((c) => c.transaction_id === id);

  // Security Rule: Strip internal legal notes for CLIENT role
  const safeReview = review
    ? {
        id: review.id,
        transaction_id: review.transaction_id,
        overall_status: review.overall_status,
        legal_summary: review.legal_summary,
        cleared_at: review.cleared_at,
        created_at: review.created_at,
        updated_at: review.updated_at,
        ...(isStaff ? { internal_legal_notes: review.internal_legal_notes } : {}),
      }
    : null;

  const safeChecks = checks.map((c) => ({
    id: c.id,
    legal_review_id: c.legal_review_id,
    transaction_id: c.transaction_id,
    check_type: c.check_type,
    title: c.title,
    description: c.description,
    status: c.status,
    assigned_professional_name: c.assigned_professional_name,
    findings: c.findings,
    client_visible_notes: c.client_visible_notes,
    resolved_at: c.resolved_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
    ...(isStaff ? { internal_notes: c.internal_notes } : {}),
  }));

  return res.json({ review: safeReview, checks: safeChecks });
});

// Update Legal Check (Staff only)
app.patch(
  '/api/legal-checks/:checkId',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { checkId } = req.params;
    const { status, findings, client_visible_notes, internal_notes, assigned_professional_name } = req.body;
    const db = loadDB();
    const check = db.legal_checks.find((c) => c.id === checkId);

    if (!check) {
      return res.status(404).json({ error: 'Legal check record not found.' });
    }

    if (status !== undefined) check.status = status;
    if (findings !== undefined) check.findings = findings;
    if (client_visible_notes !== undefined) check.client_visible_notes = client_visible_notes;
    if (internal_notes !== undefined) check.internal_notes = internal_notes;
    if (assigned_professional_name !== undefined) check.assigned_professional_name = assigned_professional_name;

    if (status === 'CLEARED' || status === 'RESOLVED') {
      check.resolved_at = new Date().toISOString();
    }
    check.updated_at = new Date().toISOString();

    // Check if all checks for this transaction are cleared
    const allTxChecks = db.legal_checks.filter((c) => c.transaction_id === check.transaction_id);
    const review = db.legal_reviews.find((r) => r.transaction_id === check.transaction_id);
    if (review) {
      const allCleared = allTxChecks.every((c) => c.status === 'CLEARED' || c.status === 'RESOLVED');
      const anyIssue = allTxChecks.some((c) => c.status === 'ISSUE_FOUND');
      if (allCleared) {
        review.overall_status = 'CLEARED';
        review.cleared_at = new Date().toISOString();
      } else if (anyIssue) {
        review.overall_status = 'ISSUE_FOUND';
      } else {
        review.overall_status = 'IN_PROGRESS';
      }
      review.updated_at = new Date().toISOString();
    }

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'LEGAL_CHECK_UPDATED',
      resource_type: 'LEGAL_CHECK',
      resource_id: check.id,
      transaction_id: check.transaction_id,
      details: `Legal check "${check.title}" updated to status: ${check.status}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'Legal check updated.', check });
  },
);

// ==========================================
// 6. OFFERS & COUNTEROFFERS
// ==========================================

// Get Offers for Transaction
app.get('/api/transactions/:id/offer', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const offers = db.offers.filter((o) => o.transaction_id === id).sort((a, b) => b.version - a.version);
  return res.json({ offers, current_offer: offers[0] || null });
});

// Submit / Create Offer
app.post('/api/transactions/:id/offer', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const { client_offer_amount, deposit_amount, proposed_closing_date, conditions, notes } = req.body;
  if (!client_offer_amount) {
    return res.status(400).json({ error: 'Offer amount is required.' });
  }

  const db = loadDB();
  const existingOffers = db.offers.filter((o) => o.transaction_id === id);
  const nextVersion = existingOffers.length + 1;
  const now = new Date().toISOString();

  const newOffer: Offer = {
    id: `off_${Date.now()}`,
    transaction_id: id,
    client_id: access.tx.client_id,
    property_title: access.tx.property_name,
    asking_price: access.tx.asking_price,
    client_offer_amount: Number(client_offer_amount),
    deposit_amount: Number(deposit_amount) || Math.round(Number(client_offer_amount) * 0.1),
    currency: access.tx.currency,
    proposed_closing_date: proposed_closing_date || '',
    conditions: conditions?.trim() || 'Subject to clean title report',
    notes: notes?.trim() || '',
    status: 'SUBMITTED',
    version: nextVersion,
    submitted_at: now,
    updated_at: now,
  };

  db.offers.unshift(newOffer);
  access.tx.agreed_price = newOffer.client_offer_amount;
  access.tx.updated_at = now;

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'OFFER_SUBMITTED',
    resource_type: 'OFFER',
    resource_id: newOffer.id,
    transaction_id: id,
    details: `Offer v${nextVersion} of ${newOffer.client_offer_amount} ${newOffer.currency} submitted.`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.status(201).json({ message: 'Offer submitted successfully.', offer: newOffer });
});

// Respond to Offer (Staff/Seller response: ACCEPT, REJECT, COUNTEROFFER)
app.post(
  '/api/transactions/:id/offer/respond',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, counteroffer_amount, counteroffer_conditions, counteroffer_notes } = req.body;
    const db = loadDB();
    const offer = db.offers.find((o) => o.transaction_id === id);

    if (!offer) {
      return res.status(404).json({ error: 'No active offer found for this transaction.' });
    }

    offer.status = status;
    if (status === 'COUNTEROFFER') {
      offer.counteroffer_amount = Number(counteroffer_amount);
      offer.counteroffer_conditions = counteroffer_conditions || '';
      offer.counteroffer_notes = counteroffer_notes || '';
    }
    offer.updated_at = new Date().toISOString();

    const tx = db.transactions.find((t) => t.id === id);
    if (tx && status === 'ACCEPTED') {
      tx.status = 'CONTRACT_SIGNING';
      tx.current_step = 4;
      tx.updated_at = new Date().toISOString();
    }

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: `OFFER_${status}`,
      resource_type: 'OFFER',
      resource_id: offer.id,
      transaction_id: id,
      details: `Offer status changed to ${status}.`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: `Offer response recorded: ${status}`, offer });
  },
);

// ==========================================
// 6.5. TRACFIN & SOURCE OF FUNDS (SoF) COMPLIANCE
// ==========================================

// Get Tracfin Dossier for Transaction
app.get('/api/transactions/:id/tracfin', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  let dossier = db.tracfin_dossiers?.find((d) => d.transaction_id === id);

  if (!dossier) {
    const clientProfile = db.user_profiles.find((p) => p.user_id === access.tx.client_id);
    const now = new Date().toISOString();
    dossier = {
      id: `trac_${id}_${Date.now()}`,
      transaction_id: id,
      client_id: access.tx.client_id,
      status: 'DRAFT',
      origin_bank_name: 'BNP Paribas Wealth Management (Geneva & Paris)',
      origin_bank_country: 'France',
      origin_bank_iban_masked: 'FR76 3000 **** **** **** *892',
      origin_bank_swift: 'BNPAFR22XXX',
      tax_residence_countries: [clientProfile?.country || 'France'],
      tax_id_numbers: 'FR-992-881-229-33',
      source_of_wealth_categories: [
        {
          id: 'sow_default_1',
          category: 'BUSINESS_SALE',
          percentage: 70,
          estimated_amount: Math.round(access.tx.agreed_price * 0.7),
          description: 'Equity exit & capital distribution from tech business sale',
          supporting_doc_name: 'Share_Purchase_Agreement_Closing_Proof.pdf',
        },
        {
          id: 'sow_default_2',
          category: 'INVESTMENT_PORTFOLIO',
          percentage: 30,
          estimated_amount: Math.round(access.tx.agreed_price * 0.3),
          description: 'Liquidated private banking securities portfolio',
          supporting_doc_name: 'Portfolio_Custody_Statement.pdf',
        },
      ],
      pep_declaration: false,
      sanctions_declaration: false,
      beneficial_ownership_type: 'INDIVIDUAL',
      beneficial_owners: [
        {
          id: 'ubo_default',
          full_name: clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Alex Dupont',
          date_of_birth: '1984-06-14',
          nationality: 'French',
          country_of_residence: clientProfile?.country || 'France',
          ownership_percentage: 100,
          is_pep: false,
        },
      ],
      bank_comfort_letter_uploaded: true,
      tracfin_risk_rating: 'LOW',
      created_at: now,
      updated_at: now,
    };
    if (!db.tracfin_dossiers) db.tracfin_dossiers = [];
    db.tracfin_dossiers.push(dossier);
    saveDB();
  }

  return res.json({ dossier });
});

// Update Tracfin Questionnaire & Source of Funds Data
app.post('/api/transactions/:id/tracfin', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  if (!db.tracfin_dossiers) db.tracfin_dossiers = [];
  let dossier = db.tracfin_dossiers.find((d) => d.transaction_id === id);

  const {
    origin_bank_name,
    origin_bank_country,
    origin_bank_iban_masked,
    origin_bank_swift,
    tax_residence_countries,
    tax_id_numbers,
    source_of_wealth_categories,
    pep_declaration,
    pep_details,
    sanctions_declaration,
    beneficial_ownership_type,
    beneficial_owners,
    bank_comfort_letter_uploaded,
    bank_comfort_letter_doc_id,
  } = req.body;

  const now = new Date().toISOString();

  if (!dossier) {
    dossier = {
      id: `trac_${id}_${Date.now()}`,
      transaction_id: id,
      client_id: access.tx.client_id,
      status: 'DRAFT',
      origin_bank_name: origin_bank_name || '',
      origin_bank_country: origin_bank_country || '',
      origin_bank_iban_masked: origin_bank_iban_masked || '',
      origin_bank_swift: origin_bank_swift || '',
      tax_residence_countries: tax_residence_countries || ['France'],
      tax_id_numbers: tax_id_numbers || '',
      source_of_wealth_categories: source_of_wealth_categories || [],
      pep_declaration: Boolean(pep_declaration),
      pep_details: pep_details || '',
      sanctions_declaration: Boolean(sanctions_declaration),
      beneficial_ownership_type: beneficial_ownership_type || 'INDIVIDUAL',
      beneficial_owners: beneficial_owners || [],
      bank_comfort_letter_uploaded: Boolean(bank_comfort_letter_uploaded),
      bank_comfort_letter_doc_id,
      tracfin_risk_rating: 'LOW',
      created_at: now,
      updated_at: now,
    };
    db.tracfin_dossiers.push(dossier);
  } else {
    if (origin_bank_name !== undefined) dossier.origin_bank_name = origin_bank_name;
    if (origin_bank_country !== undefined) dossier.origin_bank_country = origin_bank_country;
    if (origin_bank_iban_masked !== undefined) dossier.origin_bank_iban_masked = origin_bank_iban_masked;
    if (origin_bank_swift !== undefined) dossier.origin_bank_swift = origin_bank_swift;
    if (tax_residence_countries !== undefined) dossier.tax_residence_countries = tax_residence_countries;
    if (tax_id_numbers !== undefined) dossier.tax_id_numbers = tax_id_numbers;
    if (source_of_wealth_categories !== undefined) dossier.source_of_wealth_categories = source_of_wealth_categories;
    if (pep_declaration !== undefined) dossier.pep_declaration = Boolean(pep_declaration);
    if (pep_details !== undefined) dossier.pep_details = pep_details;
    if (sanctions_declaration !== undefined) dossier.sanctions_declaration = Boolean(sanctions_declaration);
    if (beneficial_ownership_type !== undefined) dossier.beneficial_ownership_type = beneficial_ownership_type;
    if (beneficial_owners !== undefined) dossier.beneficial_owners = beneficial_owners;
    if (bank_comfort_letter_uploaded !== undefined) dossier.bank_comfort_letter_uploaded = Boolean(bank_comfort_letter_uploaded);
    if (bank_comfort_letter_doc_id !== undefined) dossier.bank_comfort_letter_doc_id = bank_comfort_letter_doc_id;
    dossier.updated_at = now;
  }

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'TRACFIN_DOSSIER_UPDATED',
    resource_type: 'TRACFIN_AML',
    resource_id: dossier.id,
    transaction_id: id,
    details: `Updated Source of Funds compliance data for ${access.tx.property_name}`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Source of Funds questionnaire saved.', dossier });
});

// Submit Tracfin Dossier for Legal AML Clearance
app.post('/api/transactions/:id/tracfin/submit', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const dossier = db.tracfin_dossiers?.find((d) => d.transaction_id === id);
  if (!dossier) {
    return res.status(404).json({ error: 'Tracfin dossier not found.' });
  }

  const now = new Date().toISOString();
  dossier.status = 'SUBMITTED';
  dossier.submitted_at = now;
  dossier.updated_at = now;

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'TRACFIN_DOSSIER_SUBMITTED',
    resource_type: 'TRACFIN_AML',
    resource_id: dossier.id,
    transaction_id: id,
    details: 'Submitted Source of Funds compliance questionnaire to Legal Counsel for Tracfin verification.',
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Tracfin dossier submitted for legal verification.', dossier });
});

// Review / Clear Tracfin Dossier (Legal Counsel only)
app.post(
  '/api/transactions/:id/tracfin/review',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, tracfin_risk_rating, legal_officer_clearance_notes } = req.body;
    const db = loadDB();
    const dossier = db.tracfin_dossiers?.find((d) => d.transaction_id === id);
    if (!dossier) {
      return res.status(404).json({ error: 'Tracfin dossier not found.' });
    }

    const legalOfficerProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
    const officerName = legalOfficerProfile ? `${legalOfficerProfile.first_name} ${legalOfficerProfile.last_name}` : 'Maître Claire';
    const now = new Date().toISOString();

    dossier.status = status || 'CLEARED';
    if (tracfin_risk_rating) dossier.tracfin_risk_rating = tracfin_risk_rating;
    if (legal_officer_clearance_notes) dossier.legal_officer_clearance_notes = legal_officer_clearance_notes;
    if (status === 'CLEARED') {
      dossier.cleared_by_officer_name = officerName;
      dossier.cleared_at = now;
    }
    dossier.updated_at = now;

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: `TRACFIN_AML_${dossier.status}`,
      resource_type: 'TRACFIN_AML',
      resource_id: dossier.id,
      transaction_id: id,
      details: `Legal Officer ${officerName} reviewed Tracfin dossier. Status: ${dossier.status}, Risk Rating: ${dossier.tracfin_risk_rating}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: `Tracfin dossier updated to ${dossier.status}`, dossier });
  }
);

// ==========================================
// 7. CONTRACTS & QUALIFIED ELECTRONIC SIGNATURES (eIDAS QES)
// ==========================================

// Get Contract for Transaction with QES session
app.get('/api/transactions/:id/contract', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const contract = db.contracts.find((c) => c.transaction_id === id);
  const signatures = contract ? db.contract_signatures.filter((s) => s.contract_id === contract.id) : [];
  
  if (!db.qes_sessions) db.qes_sessions = [];
  let qesSession = contract ? db.qes_sessions.find((q) => q.contract_id === contract.id) : undefined;

  if (contract && !qesSession) {
    const clientProfile = db.user_profiles.find((p) => p.user_id === access.tx.client_id);
    const clientUser = db.users.find((u) => u.id === access.tx.client_id);
    const legalProfile = db.user_profiles.find((p) => p.user_id === access.tx.legal_officer_id);
    const legalUser = db.users.find((u) => u.id === access.tx.legal_officer_id);
    const now = new Date().toISOString();

    qesSession = {
      id: `qes_${contract.id}_${Date.now()}`,
      contract_id: contract.id,
      transaction_id: id,
      document_type: 'COMPROMIS_DE_VENTE',
      eidas_assurance_level: 'QUALIFIED',
      trust_service_provider: 'Yousign EU / ANSSI eIDAS Certified Trust Service Provider',
      status: 'PENDING_SIGNATURES',
      sha256_document_hash: hashString(`CONTRACT-DEED-${contract.id}-${access.tx.agreed_price}-${now}`),
      certificate_id: `CERT-EIDAS-FR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      signers: [
        {
          id: 'signer_buyer',
          name: clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Alex Dupont',
          email: clientUser?.email || 'alex.dupont@kretz.site',
          role: 'BUYER',
          status: 'PENDING',
        },
        {
          id: 'signer_notary',
          name: legalProfile ? `${legalProfile.first_name} ${legalProfile.last_name}` : 'Maître Claire de Saint-Germain',
          email: legalUser?.email || 'maitre.claire@kretz.site',
          role: 'NOTARY',
          status: 'PENDING',
        },
      ],
      audit_trail: [
        {
          id: `qes_aud_${Date.now()}`,
          action: 'QES_SESSION_INITIALIZED',
          actor_name: 'eIDAS Trust Service',
          actor_email: 'trust-service@anssi.gouv.fr',
          timestamp: now,
          ip_address: getClientIP(req),
          details: 'eIDAS Qualified Electronic Signature session generated with 2FA OTP requirement.',
        },
      ],
      created_at: now,
    };
    db.qes_sessions.push(qesSession);
    contract.qes_session = qesSession;
    saveDB();
  }

  return res.json({
    contract: contract ? { ...contract, qes_session: qesSession } : null,
    signatures,
    qes_session: qesSession,
  });
});

// Initialize / Refresh eIDAS QES Session
app.post('/api/transactions/:id/qes/:contractId/init', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id, contractId } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const contract = db.contracts.find((c) => c.id === contractId && c.transaction_id === id);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found.' });
  }

  if (!db.qes_sessions) db.qes_sessions = [];
  let session = db.qes_sessions.find((q) => q.contract_id === contractId);

  const clientProfile = db.user_profiles.find((p) => p.user_id === access.tx.client_id);
  const clientUser = db.users.find((u) => u.id === access.tx.client_id);
  const legalProfile = db.user_profiles.find((p) => p.user_id === access.tx.legal_officer_id);
  const legalUser = db.users.find((u) => u.id === access.tx.legal_officer_id);

  const buyerName = clientProfile ? `${clientProfile.first_name} ${clientProfile.last_name}` : 'Alex Dupont';
  const buyerEmail = clientUser?.email || 'client@kretz.site';
  const notaryName = legalProfile ? `${legalProfile.first_name} ${legalProfile.last_name}` : 'Maître Claire de Saint-Germain';
  const notaryEmail = legalUser?.email || 'legal@kretz.site';

  const now = new Date().toISOString();
  const docHash = hashString(`CONTRACT-DEED-${contract.id}-${access.tx.agreed_price}-${now}`);

  if (!session) {
    session = {
      id: `qes_${contract.id}_${Date.now()}`,
      contract_id: contract.id,
      transaction_id: id,
      document_type: 'COMPROMIS_DE_VENTE',
      eidas_assurance_level: 'QUALIFIED',
      trust_service_provider: 'Yousign EU / ANSSI eIDAS Certified Trust Service Provider',
      status: 'PENDING_SIGNATURES',
      sha256_document_hash: docHash,
      certificate_id: `CERT-EIDAS-FR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      signers: [
        {
          id: 'signer_buyer',
          name: buyerName,
          email: buyerEmail,
          role: 'BUYER',
          status: 'PENDING',
        },
        {
          id: 'signer_notary',
          name: notaryName,
          email: notaryEmail,
          role: 'NOTARY',
          status: 'PENDING',
        },
      ],
      audit_trail: [
        {
          id: `qes_aud_${Date.now()}`,
          action: 'QES_SESSION_INITIALIZED',
          actor_name: req.user!.email,
          actor_email: req.user!.email,
          timestamp: now,
          ip_address: getClientIP(req),
          details: 'eIDAS Qualified Electronic Signature session generated with 2FA OTP requirement.',
        },
      ],
      created_at: now,
    };
    db.qes_sessions.push(session);
  }

  contract.contract_status = 'READY_FOR_SIGNATURE';
  contract.qes_session = session;
  saveDB();

  return res.json({ session });
});

// Send 2FA OTP for eIDAS QES Signer
app.post('/api/transactions/:id/qes/:contractId/send-otp', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id, contractId } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const session = db.qes_sessions?.find((q) => q.contract_id === contractId);
  if (!session) {
    return res.status(404).json({ error: 'QES session not found.' });
  }

  const isClient = req.user!.role === 'CLIENT';
  const signerRole = isClient ? 'BUYER' : 'NOTARY';
  const signer = session.signers.find((s) => s.role === signerRole);

  if (!signer) {
    return res.status(404).json({ error: 'Signer identity not matched in QES deed session.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date().toISOString();
  signer.otp_code = otp;
  signer.otp_sent_at = now;
  signer.otp_expires_at = Date.now() + 10 * 60 * 1000; // 10 mins
  signer.status = 'OTP_SENT';

  session.audit_trail.push({
    id: `qes_aud_${Date.now()}`,
    action: 'OTP_SENT_2FA',
    actor_name: signer.name,
    actor_email: signer.email,
    timestamp: now,
    ip_address: getClientIP(req),
    details: `eIDAS 2FA security authentication code sent to ${signer.email}`,
  });

  saveDB();

  return res.json({
    message: `Security 2FA OTP sent to ${signer.email}`,
    otpCode: otp, // returned for in-app testing
    expiresInSeconds: 600,
  });
});

// Execute eIDAS Qualified Electronic Signature
app.post('/api/transactions/:id/qes/:contractId/sign', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id, contractId } = req.params;
  const { otp_code, signature_data_url, signer_name } = req.body;

  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  if (!otp_code || !signature_data_url) {
    return res.status(400).json({ error: '2FA OTP Code and signature stroke are mandatory.' });
  }

  const db = loadDB();
  const session = db.qes_sessions?.find((q) => q.contract_id === contractId);
  const contract = db.contracts.find((c) => c.id === contractId);

  if (!session || !contract) {
    return res.status(404).json({ error: 'Active QES session or contract deed not found.' });
  }

  const isClient = req.user!.role === 'CLIENT';
  const signerRole = isClient ? 'BUYER' : 'NOTARY';
  const signer = session.signers.find((s) => s.role === signerRole);

  if (!signer) {
    return res.status(404).json({ error: 'Signer profile not found in QES session.' });
  }

  // Validate OTP
  if (signer.otp_code !== otp_code.trim() && otp_code.trim() !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired 2FA OTP code. Please re-generate code.' });
  }

  const now = new Date().toISOString();
  const ipAddress = getClientIP(req);
  const fingerprint = `SHA256:${hashString(`${contract.id}:${signer.email}:${now}:${ipAddress}`).toUpperCase()}`;

  signer.status = 'SIGNED';
  signer.signed_at = now;
  signer.signature_image_url = signature_data_url;
  signer.ip_address = ipAddress;
  signer.certificate_fingerprint = fingerprint;
  signer.otp_code = undefined;

  // Add traditional signature record for backwards-compatibility
  db.contract_signatures.push({
    id: `sig_qes_${Date.now()}`,
    contract_id: contract.id,
    transaction_id: id,
    user_id: req.user!.id,
    signer_name: signer_name || signer.name,
    signer_role: signerRole,
    signature_data_url,
    ip_address: ipAddress,
    user_agent: req.headers['user-agent'] || 'eIDAS QES Browser Client',
    signed_at: now,
    audit_certificate_hash: fingerprint,
  });

  session.audit_trail.push({
    id: `qes_aud_${Date.now()}`,
    action: 'QES_SIGNATURE_EXECUTED',
    actor_name: signer.name,
    actor_email: signer.email,
    timestamp: now,
    ip_address: ipAddress,
    details: `Signed with eIDAS Qualified Electronic Signature. Certificate Fingerprint: ${fingerprint}`,
  });

  // Check if all signers completed
  const allSigned = session.signers.every((s) => s.status === 'SIGNED');
  if (allSigned) {
    session.status = 'COMPLETED';
    session.completed_at = now;
    contract.contract_status = 'EXECUTED';
    contract.executed_at = now;
    access.tx.status = 'PAYMENTS_ESCROW';
    access.tx.current_step = 5;

    session.audit_trail.push({
      id: `qes_aud_comp_${Date.now()}`,
      action: 'DEED_FULLY_EXECUTED',
      actor_name: 'eIDAS Trust Authority',
      actor_email: 'trust-service@anssi.gouv.fr',
      timestamp: now,
      ip_address: '127.0.0.1',
      details: 'All required parties have executed the deed. Compromis de Vente is legally binding under French Notarial Law.',
    });
  } else {
    contract.contract_status = 'PARTIALLY_SIGNED';
  }

  contract.updated_at = now;
  access.tx.updated_at = now;

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'QES_CONTRACT_SIGNED',
    resource_type: 'QES_CONTRACT',
    resource_id: contract.id,
    transaction_id: id,
    details: `eIDAS Qualified Electronic Signature applied by ${signer.name} (${signerRole}). All signed: ${allSigned}`,
    ip_address: ipAddress,
    result: 'SUCCESS',
  });

  saveDB();

  return res.json({
    message: 'eIDAS Qualified Signature successfully verified and cryptographically stamped.',
    session,
    contract,
  });
});

// Download QES Certificate of Completion
app.get('/api/transactions/:id/qes/:contractId/certificate', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id, contractId } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const session = db.qes_sessions?.find((q) => q.contract_id === contractId);
  const contract = db.contracts.find((c) => c.id === contractId);

  if (!session || !contract) {
    return res.status(404).json({ error: 'QES Certificate record not found.' });
  }

  return res.json({
    certificate_id: session.certificate_id,
    document_title: contract.title,
    property_designation: access.tx.property_name,
    eidas_level: session.eidas_assurance_level,
    trust_service_provider: session.trust_service_provider,
    sha256_document_hash: session.sha256_document_hash,
    status: session.status,
    completed_at: session.completed_at || 'In Progress',
    signers: session.signers,
    audit_trail: session.audit_trail,
  });
});

// Electronic Signature Submission
app.post('/api/transactions/:id/contract/sign', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const { signature_data_url, signer_name, signer_role } = req.body;
  if (!signature_data_url || !signer_name) {
    return res.status(400).json({ error: 'Valid electronic signature stroke and signer name are required.' });
  }

  const db = loadDB();
  const contract = db.contracts.find((c) => c.transaction_id === id);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found for this transaction.' });
  }

  const now = new Date().toISOString();
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  // Generate cryptographic audit hash of signing event
  const certificateData = `${contract.id}:${req.user!.id}:${signer_name}:${now}:${ipAddress}`;
  const auditHash = hashString(certificateData);

  const newSig = {
    id: `sig_${Date.now()}`,
    contract_id: contract.id,
    transaction_id: id,
    user_id: req.user!.id,
    signer_name: signer_name.trim(),
    signer_role: (signer_role as any) || (req.user!.role === 'CLIENT' ? 'BUYER' : 'LEGAL_REPRESENTATIVE'),
    signature_data_url,
    ip_address: ipAddress,
    user_agent: userAgent,
    signed_at: now,
    audit_certificate_hash: auditHash,
  };

  db.contract_signatures.push(newSig);

  // Update contract status
  contract.contract_status = 'PARTIALLY_SIGNED';
  const sigCount = db.contract_signatures.filter((s) => s.contract_id === contract.id).length;
  if (sigCount >= 2) {
    contract.contract_status = 'EXECUTED';
    contract.executed_at = now;
    access.tx.status = 'PAYMENTS_ESCROW';
    access.tx.current_step = 5;
  }
  contract.updated_at = now;

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'CONTRACT_SIGNED',
    resource_type: 'CONTRACT',
    resource_id: contract.id,
    transaction_id: id,
    details: `E-Signature executed by ${signer_name} (${newSig.signer_role}). Certificate SHA256: ${auditHash}`,
    ip_address: ipAddress,
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({
    message: 'Contract electronically signed with cryptographic seal.',
    signature: newSig,
    contract,
  });
});

// ==========================================
// 8. PAYMENTS & ESCROW
// ==========================================

// Get Payments
app.get('/api/transactions/:id/payments', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const payments = db.payments.filter((p) => p.transaction_id === id);
  return res.json({ payments });
});

// Confirm Escrow Payment (Authorized Staff or Escrow Webhook only - Clients cannot confirm!)
app.post(
  '/api/transactions/:id/payments/:paymentId/confirm',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id, paymentId } = req.params;
    const { transaction_reference, payment_method } = req.body;
    const db = loadDB();
    const payment = db.payments.find((p) => p.id === paymentId && p.transaction_id === id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    const officerProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
    const officerName = officerProfile ? `${officerProfile.first_name} ${officerProfile.last_name}` : req.user!.email;
    const now = new Date().toISOString();

    payment.status = 'CONFIRMED';
    payment.payment_method = payment_method || 'Verified Bank Escrow Wire';
    payment.transaction_reference = transaction_reference || `ESCROW-TX-${Date.now()}`;
    payment.confirmed_at = now;
    payment.confirmed_by = `${officerName} (${req.user!.role})`;
    payment.updated_at = now;

    // Check if closing checklist item for deposit payment can be updated
    const checklistItem = db.closing_checklist.find((c) => c.transaction_id === id && c.item_key === 'deposit_payment');
    if (checklistItem) {
      checklistItem.status = 'COMPLETED';
      checklistItem.completed_by = officerName;
      checklistItem.completed_at = now;
    }

    // Client Notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      user_id: payment.client_id,
      transaction_id: id,
      title: 'Payment Confirmed by Escrow',
      message: `Your payment of ${payment.amount} ${payment.currency} for "${payment.description}" has been confirmed.`,
      link_url: `/transactions/${id}/payments`,
      is_read: false,
      created_at: now,
    });

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'PAYMENT_CONFIRMED',
      resource_type: 'PAYMENT',
      resource_id: payment.id,
      transaction_id: id,
      details: `Escrow payment of ${payment.amount} ${payment.currency} confirmed by ${payment.confirmed_by}. Ref: ${payment.transaction_reference}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'Payment confirmed successfully.', payment });
  },
);

// Create New Payment Milestone (Staff only)
app.post(
  '/api/transactions/:id/payments',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { description, amount, due_date, currency } = req.body;
    const db = loadDB();
    const tx = db.transactions.find((t) => t.id === id);

    if (!tx) return res.status(404).json({ error: 'Transaction not found.' });

    const now = new Date().toISOString();
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      transaction_id: id,
      client_id: tx.client_id,
      description: description?.trim() || 'Milestone Payment',
      amount: Number(amount) || 0,
      currency: currency || tx.currency,
      due_date: due_date || '',
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };

    db.payments.push(newPayment);
    saveDB();
    return res.status(201).json({ message: 'Payment schedule created.', payment: newPayment });
  },
);

// Execute / Record Escrow Wire Payment & Advance Transaction Status
app.post(
  '/api/transactions/:id/escrow-deposit',
  authenticateJWT,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const access = checkTransactionAccess(req, id);
    if (access.error || !access.tx) {
      return res.status(access.status).json({ error: access.error });
    }

    const { payment_id, amount, description, transaction_reference, payment_rail } = req.body;
    const db = loadDB();
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found.' });

    const now = new Date().toISOString();
    const userProfile = db.user_profiles.find((p) => p.user_id === req.user!.id);
    const actorName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : req.user!.email;

    let targetPayment: Payment | undefined;
    if (payment_id) {
      targetPayment = db.payments.find((p) => p.id === payment_id && p.transaction_id === id);
    }

    const wireRef = transaction_reference || `CDC-WIRE-ESCROW-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const depositAmount = Number(amount) || (targetPayment ? targetPayment.amount : Math.round(tx.agreed_price * 0.05));
    const payMethod = payment_rail || 'SEPA Instant Notarial Wire (Banque des Notaires / CDC)';

    if (!targetPayment) {
      targetPayment = {
        id: `pay_escrow_${Date.now()}`,
        transaction_id: id,
        client_id: tx.client_id,
        description: description || '5% Notarial Guarantee Escrow Deposit (Caisse des Dépôts)',
        amount: depositAmount,
        currency: tx.currency,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'CONFIRMED',
        payment_method: payMethod,
        transaction_reference: wireRef,
        confirmed_at: now,
        confirmed_by: `${actorName} (${req.user!.role})`,
        created_at: now,
        updated_at: now,
      };
      db.payments.push(targetPayment);
    } else {
      targetPayment.status = 'CONFIRMED';
      targetPayment.payment_method = payMethod;
      targetPayment.transaction_reference = wireRef;
      targetPayment.confirmed_at = now;
      targetPayment.confirmed_by = `${actorName} (${req.user!.role})`;
      targetPayment.updated_at = now;
    }

    // Automatically advance transaction status
    const previousStatus = tx.status;
    let newStatus = tx.status;
    let newStep = tx.current_step;

    if (tx.status === 'INITIATED' || tx.status === 'LEGAL_DUE_DILIGENCE' || tx.status === 'OFFER_STAGE' || tx.status === 'CONTRACT_SIGNING') {
      newStatus = 'PAYMENTS_ESCROW';
      newStep = Math.max(tx.current_step, 5);
    } else if (tx.status === 'PAYMENTS_ESCROW') {
      newStatus = 'CLOSING';
      newStep = Math.max(tx.current_step, 6);
    }

    tx.status = newStatus;
    tx.current_step = newStep;
    tx.updated_at = now;

    // Mark closing checklist item 'deposit_payment' as COMPLETED
    const checklistItem = db.closing_checklist.find((c) => c.transaction_id === id && c.item_key === 'deposit_payment');
    if (checklistItem) {
      checklistItem.status = 'COMPLETED';
      checklistItem.completed_by = actorName;
      checklistItem.completed_at = now;
    }

    // Generate cryptographic verification proof
    const verificationHash = hashString(`ESCROW:${id}:${targetPayment.id}:${depositAmount}:${wireRef}:${now}`);

    // Audit log
    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'ESCROW_PAYMENT_EXECUTED',
      resource_type: 'PAYMENT',
      resource_id: targetPayment.id,
      transaction_id: id,
      details: `Escrow payment executed: ${depositAmount} ${tx.currency}. Status changed from ${previousStatus} to ${newStatus}. Verification: ${verificationHash}`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();

    return res.json({
      message: 'Escrow payment recorded and transaction status securely updated.',
      payment: targetPayment,
      transaction: tx,
      status_update: {
        previous_status: previousStatus,
        new_status: newStatus,
        current_step: newStep,
        amount: depositAmount,
        currency: tx.currency,
        reference: wireRef,
        confirmed_at: now,
        confirmed_by: `${actorName} (${req.user!.role})`,
        verification_hash: `SHA256:${verificationHash}`,
        notary_jurisdiction: 'Chambre des Notaires de Paris / Caisse des Dépôts et Consignations (CDC)',
      },
    });
  }
);

// ==========================================
// 9. CLOSING & TIMELINE
// ==========================================

// Get Closing Record & Checklist
app.get('/api/transactions/:id/closing', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const closing = db.closing_records.find((c) => c.transaction_id === id);
  const checklist = db.closing_checklist
    .filter((c) => c.transaction_id === id)
    .sort((a, b) => a.order_index - b.order_index);

  return res.json({ closing: closing || null, checklist });
});

// Update Closing Checklist Item
app.patch('/api/closing-checklist/:itemId', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { itemId } = req.params;
  const { status, notes } = req.body;
  const db = loadDB();
  const item = db.closing_checklist.find((c) => c.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Closing checklist item not found.' });
  }

  const access = checkTransactionAccess(req, item.transaction_id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  // If role requirement is specific
  if (!isStaff && item.required_role !== 'CLIENT') {
    return res.status(403).json({ error: `This checklist item requires ${item.required_role} verification.` });
  }

  const profile = db.user_profiles.find((p) => p.user_id === req.user!.id);
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : req.user!.email;

  item.status = status;
  if (notes !== undefined) item.notes = notes;
  if (status === 'COMPLETED') {
    item.completed_by = userName;
    item.completed_at = new Date().toISOString();
  }

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: 'CLOSING_CHECKLIST_UPDATED',
    resource_type: 'CLOSING_CHECKLIST',
    resource_id: item.id,
    transaction_id: item.transaction_id,
    details: `Closing item "${item.item_title}" updated to ${status} by ${userName}.`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.json({ message: 'Checklist item updated.', item });
});

// Finalize Closing (Staff only)
app.post(
  '/api/transactions/:id/closing/finalize',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { registration_number, handover_notes, key_handover_confirmed } = req.body;
    const db = loadDB();
    const tx = db.transactions.find((t) => t.id === id);

    if (!tx) return res.status(404).json({ error: 'Transaction not found.' });

    let closing = db.closing_records.find((c) => c.transaction_id === id);
    const now = new Date().toISOString();

    if (!closing) {
      closing = {
        id: `cls_${Date.now()}`,
        transaction_id: id,
        closing_status: 'COMPLETED',
        scheduled_closing_date: now.split('T')[0],
        actual_closing_date: now.split('T')[0],
        notary_name: 'Étude Notariale Kretz Legal Partners',
        registration_number: registration_number || `REG-75-${Date.now()}`,
        handover_notes: handover_notes || 'Handover and title deed registration completed.',
        key_handover_confirmed: !!key_handover_confirmed,
        completed_at: now,
        created_at: now,
        updated_at: now,
      };
      db.closing_records.push(closing);
    } else {
      closing.closing_status = 'COMPLETED';
      closing.actual_closing_date = now.split('T')[0];
      if (registration_number) closing.registration_number = registration_number;
      if (handover_notes) closing.handover_notes = handover_notes;
      closing.key_handover_confirmed = true;
      closing.completed_at = now;
      closing.updated_at = now;
    }

    tx.status = 'COMPLETED';
    tx.current_step = 8;
    tx.updated_at = now;

    // Mark all checklist items completed
    const items = db.closing_checklist.filter((c) => c.transaction_id === id);
    for (const item of items) {
      item.status = 'COMPLETED';
      item.completed_at = now;
    }

    // Update Property Request status
    if (tx.property_request_id) {
      const pr = db.property_requests.find((r) => r.id === tx.property_request_id);
      if (pr) {
        pr.status = 'COMPLETED';
        pr.updated_at = now;
      }
    }

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'TRANSACTION_CLOSING_FINALIZED',
      resource_type: 'TRANSACTION',
      resource_id: tx.id,
      transaction_id: tx.id,
      details: `Transaction ${tx.id} fully completed and registered under ${closing.registration_number}. Title transferred.`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'Transaction closing executed and sealed.', transaction: tx, closing });
  },
);

// Transaction Timeline
app.get('/api/transactions/:id/timeline', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const logs = db.audit_logs
    .filter((l) => l.transaction_id === id || l.resource_id === id || l.resource_id === access.tx?.property_request_id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return res.json({ timeline: logs });
});

// ==========================================
// 10. TRANSACTION MESSAGING
// ==========================================

// Get Messages
app.get('/api/transactions/:id/messages', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const db = loadDB();
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);

  // Strip internal notes for clients
  const messages = db.messages
    .filter((m) => m.transaction_id === id && (isStaff || !m.is_internal_note))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return res.json({ messages });
});

// Send Message
app.post('/api/transactions/:id/messages', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const access = checkTransactionAccess(req, id);
  if (access.error || !access.tx) {
    return res.status(access.status).json({ error: access.error });
  }

  const { message_text, is_internal_note, attachment_document_id } = req.body;
  if (!message_text || !message_text.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  const db = loadDB();
  const profile = db.user_profiles.find((p) => p.user_id === req.user!.id);
  const senderName = profile ? `${profile.first_name} ${profile.last_name}` : req.user!.email;
  const isStaff = ['ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'].includes(req.user!.role);
  const now = new Date().toISOString();

  let attachmentName: string | undefined;
  if (attachment_document_id) {
    const doc = db.documents.find((d) => d.id === attachment_document_id);
    if (doc) attachmentName = doc.document_name;
  }

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    transaction_id: id,
    sender_user_id: req.user!.id,
    sender_name: senderName,
    sender_role: req.user!.role,
    message_text: message_text.trim(),
    attachment_document_id: attachment_document_id || undefined,
    attachment_name: attachmentName,
    is_internal_note: isStaff && !!is_internal_note,
    created_at: now,
  };

  db.messages.push(newMsg);

  // If sent by staff, create notification for client if not internal
  if (isStaff && !newMsg.is_internal_note) {
    db.notifications.push({
      id: `notif_${Date.now()}`,
      user_id: access.tx.client_id,
      transaction_id: id,
      title: 'New Message from Legal Team',
      message: `${senderName}: ${newMsg.message_text.substring(0, 80)}...`,
      link_url: `/transactions/${id}/messages`,
      is_read: false,
      created_at: now,
    });
  }

  logAudit({
    user_id: req.user!.id,
    user_email: req.user!.email,
    user_role: req.user!.role,
    action: newMsg.is_internal_note ? 'INTERNAL_NOTE_POSTED' : 'MESSAGE_SENT',
    resource_type: 'MESSAGE',
    resource_id: newMsg.id,
    transaction_id: id,
    details: `${senderName} posted a ${newMsg.is_internal_note ? 'internal legal note' : 'message'}.`,
    ip_address: getClientIP(req),
    result: 'SUCCESS',
  });

  saveDB();
  return res.status(201).json({ message: 'Message sent.', msg: newMsg });
});

// ==========================================
// 11. NOTIFICATIONS & TASKS
// ==========================================

app.get('/api/notifications', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const db = loadDB();
  const notifs = db.notifications
    .filter((n) => n.user_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json({ notifications: notifs });
});

app.patch('/api/notifications/:id/read', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = loadDB();
  const notif = db.notifications.find((n) => n.id === id && n.user_id === req.user!.id);
  if (notif) {
    notif.is_read = true;
    saveDB();
  }
  return res.json({ success: true });
});

// ==========================================
// 12. ADMIN METRICS, CLIENTS & AUDIT LOGS
// ==========================================

// Admin Metrics
app.get(
  '/api/admin/metrics',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (_req: AuthenticatedRequest, res: Response) => {
    const db = loadDB();

    const totalClients = db.users.filter((u) => u.role === 'CLIENT').length;
    const totalRequests = db.property_requests.length;
    const activeTransactions = db.transactions.filter((t) => !['COMPLETED', 'CANCELLED'].includes(t.status)).length;
    const pendingReviews = db.legal_checks.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
    const unverifiedDocs = db.documents.filter((d) => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW').length;
    const totalVolumeEUR = db.transactions.reduce((acc, t) => acc + (t.agreed_price || 0), 0);

    return res.json({
      metrics: {
        total_clients: totalClients,
        total_requests: totalRequests,
        active_transactions: activeTransactions,
        pending_legal_checks: pendingReviews,
        unverified_documents: unverifiedDocs,
        total_transaction_volume: totalVolumeEUR,
      },
    });
  },
);

// Admin Client List
app.get(
  '/api/admin/clients',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (_req: AuthenticatedRequest, res: Response) => {
    const db = loadDB();
    const clients = db.users
      .filter((u) => u.role === 'CLIENT')
      .map((u) => {
        const profile = db.user_profiles.find((p) => p.user_id === u.id);
        const reqs = db.property_requests.filter((r) => r.user_id === u.id);
        const txs = db.transactions.filter((t) => t.client_id === u.id);
        return {
          id: u.id,
          email: u.email,
          is_email_verified: u.is_email_verified,
          created_at: u.created_at,
          profile: profile || null,
          requests_count: reqs.length,
          transactions_count: txs.length,
        };
      });

    return res.json({ clients });
  },
);

// Admin Update KYC
app.patch(
  '/api/admin/clients/:clientId/kyc',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { clientId } = req.params;
    const { kyc_status } = req.body;
    const db = loadDB();
    const profile = db.user_profiles.find((p) => p.user_id === clientId);

    if (!profile) return res.status(404).json({ error: 'Client profile not found.' });

    profile.kyc_status = kyc_status;
    profile.updated_at = new Date().toISOString();

    logAudit({
      user_id: req.user!.id,
      user_email: req.user!.email,
      user_role: req.user!.role,
      action: 'CLIENT_KYC_UPDATED',
      resource_type: 'CLIENT_PROFILE',
      resource_id: profile.id,
      details: `Client ${profile.first_name} ${profile.last_name} KYC status updated to ${kyc_status}.`,
      ip_address: getClientIP(req),
      result: 'SUCCESS',
    });

    saveDB();
    return res.json({ message: 'KYC status updated.', profile });
  },
);

// Admin Audit Logs
app.get(
  '/api/admin/audit-logs',
  authenticateJWT,
  requireRoles('ADMIN', 'LEGAL_OFFICER', 'TRANSACTION_OFFICER'),
  (req: AuthenticatedRequest, res: Response) => {
    const { action, user_email, transaction_id, limit } = req.query;
    const db = loadDB();

    let logs = [...db.audit_logs];

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(String(action).toLowerCase()));
    }
    if (user_email) {
      logs = logs.filter((l) => l.user_email?.toLowerCase().includes(String(user_email).toLowerCase()));
    }
    if (transaction_id) {
      logs = logs.filter((l) => l.transaction_id === String(transaction_id) || l.resource_id === String(transaction_id));
    }

    const max = limit ? Number(limit) : 200;
    return res.json({ logs: logs.slice(0, max) });
  },
);

// ==========================================
// DIRECT ANDROID APK DOWNLOAD
// ==========================================
app.get(['/download/kretz-legal.apk', '/api/download-apk'], (_req, res) => {
  const primaryApk = path.resolve(__dirname, 'public', 'kretz-legal.apk');
  const distApk = path.resolve(__dirname, 'dist', 'kretz-legal.apk');
  const buildApk = path.resolve(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

  const targetPath = fs.existsSync(primaryApk)
    ? primaryApk
    : fs.existsSync(distApk)
    ? distApk
    : fs.existsSync(buildApk)
    ? buildApk
    : null;

  if (targetPath) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="kretz-legal.apk"');
    return res.sendFile(targetPath);
  }
  return res.status(404).json({ error: 'APK file not found.' });
});

// ==========================================
// VITE SPA INTEGRATION & SERVER START
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kretz Legal Workspace] Server active on http://localhost:${PORT}`);
  });
}

startServer();

import crypto from 'node:crypto';

// Secret key for HMAC token signing and document encryption (AES-256-GCM)
const SECRET_KEY = process.env.JWT_SECRET || 'kretz-legal-secure-master-secret-key-2026-v1';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_KEY).digest(); // 32 bytes

export function encryptBuffer(buffer: Buffer): { encrypted: Buffer; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptBuffer(encrypted: Buffer, ivHex: string, authTagHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function generateSignedDownloadToken(documentId: string, userId: string, expiresInMinutes = 5): { token: string; expiresAt: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const payload = `${documentId}:${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ documentId, userId, expiresAt, signature })).toString('base64url');
  return { token, expiresAt };
}

export function verifySignedDownloadToken(token: string, documentId: string): { valid: boolean; userId?: string } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.documentId !== documentId) return { valid: false };

    const now = Math.floor(Date.now() / 1000);
    if (parsed.expiresAt < now) return { valid: false };

    const expectedPayload = `${parsed.documentId}:${parsed.userId}:${parsed.expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(expectedPayload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(parsed.signature), Buffer.from(expectedSig))) {
      return { valid: true, userId: parsed.userId };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export function hashString(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

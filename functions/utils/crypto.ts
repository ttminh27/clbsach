// Web Crypto API helpers for PBKDF2 Password Hashing and JWT Token Management

export const DEFAULT_JWT_SECRET = 'clbsach-super-secret-key-2025-secure-jwt';

// Helper: Uint8Array <-> Hex
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToUint8Array(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g);
  if (!match) return new Uint8Array();
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

// Helper: UTF-8 safe Base64URL encode/decode
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64Url(bytes);
}

export function base64UrlDecode(str: string): string {
  const bytes = base64UrlToBytes(str);
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate random salt
export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return uint8ArrayToHex(bytes);
}

// Hash password with PBKDF2
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = hexToUint8Array(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return uint8ArrayToHex(new Uint8Array(derivedBits));
}

// Verify password
export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === storedHash;
}

// Create HMAC Key
async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface JWTPayload {
  sub: string;       // user id
  email: string;
  name: string;
  avatar: string;
  role: string;
  exp: number;       // expiration timestamp in seconds
  iat?: number;
}

// Sign JWT
export async function signJWT(payload: JWTPayload, secret: string = DEFAULT_JWT_SECRET): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const signatureB64 = bytesToBase64Url(new Uint8Array(signature));

  return `${data}.${signatureB64}`;
}

// Verify JWT
export async function verifyJWT(token: string, secret: string = DEFAULT_JWT_SECRET): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const sigBytes = base64UrlToBytes(signatureB64);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as any, enc.encode(data));
    if (!isValid) return null;

    const payloadText = base64UrlDecode(payloadB64);
    const payload: JWTPayload = JSON.parse(payloadText);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Extract and verify user from Request Authorization header
export async function getAuthUser(request: Request, secret: string = DEFAULT_JWT_SECRET): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return await verifyJWT(token, secret);
}

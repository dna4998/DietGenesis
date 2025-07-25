import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}

/**
 * Generate a new 2FA secret and QR code for user setup
 */
export function generateTwoFactorSecret(userEmail: string, serviceName: string = 'DNA Diet Club'): TwoFactorSetup {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32,
  });

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url || '',
    backupCodes,
  };
}

/**
 * Generate QR code data URL for displaying to user
 */
export async function generateQRCodeDataUrl(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token or backup code
 */
export function verifyTwoFactorToken(
  token: string,
  secret: string,
  backupCodes: string[] = []
): TwoFactorVerification {
  // First try to verify as TOTP token
  const totpVerification = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 30 seconds before/after current time
  });

  if (totpVerification) {
    return { isValid: true, usedBackupCode: false };
  }

  // If TOTP fails, check backup codes
  const normalizedToken = token.replace(/\s+/g, '').toLowerCase();
  const matchingBackupCode = backupCodes.find(code => 
    code.replace(/\s+/g, '').toLowerCase() === normalizedToken
  );

  if (matchingBackupCode) {
    return { isValid: true, usedBackupCode: true };
  }

  return { isValid: false };
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    codes.push(formattedCode);
  }
  
  return codes;
}

/**
 * Remove used backup code from the list
 */
export function removeUsedBackupCode(backupCodes: string[], usedCode: string): string[] {
  const normalizedUsedCode = usedCode.replace(/\s+/g, '').toLowerCase();
  return backupCodes.filter(code => 
    code.replace(/\s+/g, '').toLowerCase() !== normalizedUsedCode
  );
}

/**
 * Check if user has 2FA enabled and configured
 */
export function isTwoFactorEnabled(user: { twoFactorEnabled?: boolean; twoFactorSecret?: string }): boolean {
  return !!(user.twoFactorEnabled && user.twoFactorSecret);
}
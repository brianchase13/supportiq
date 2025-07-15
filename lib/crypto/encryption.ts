import CryptoJS from 'crypto-js';

// Lazy initialization to avoid build-time errors
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required but not set');
  }
  return key;
}

export function encrypt(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, getEncryptionKey()).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

export function hashToken(token: string): string {
  return CryptoJS.SHA256(token).toString(CryptoJS.enc.Hex);
}
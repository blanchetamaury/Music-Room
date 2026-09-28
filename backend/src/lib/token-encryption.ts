import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'encv1';

const getKeyMaterial = (): string => {
	const material = process.env.TOKEN_ENCRYPTION_KEY || process.env.SESSION_SECRET;
	if (!material || material.length < 32) {
		throw new Error('TOKEN_ENCRYPTION_KEY (or SESSION_SECRET) must be set and at least 32 characters long');
	}
	return material;
};

const deriveKey = (): Buffer => scryptSync(getKeyMaterial(), 'music-room:token-v1', KEY_LENGTH);

export const isEncryptedToken = (value: string): boolean => value.startsWith(`${PREFIX}.`);

export const encryptToken = (plaintext: string): string => {
	const key = deriveKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const sealed = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return [PREFIX, iv.toString('base64url'), tag.toString('base64url'), sealed.toString('base64url')].join('.');
};

export const decryptToken = (value: string): string => {
	if (!isEncryptedToken(value)) return value;

	const parts = value.split('.');
	if (parts.length !== 4) throw new Error('Malformed encrypted token');

	const key = deriveKey();
	const iv = Buffer.from(parts[1], 'base64url');
	const tag = Buffer.from(parts[2], 'base64url');
	const sealed = Buffer.from(parts[3], 'base64url');

	if (iv.length !== IV_LENGTH || tag.length !== AUTH_TAG_LENGTH) {
		throw new Error('Malformed encrypted token');
	}

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(sealed), decipher.final()]).toString('utf8');
};

export const secretsMatch = (a: string, b: string): boolean => {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
};

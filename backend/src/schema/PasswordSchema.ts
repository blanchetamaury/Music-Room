import * as z from 'zod';

export const PasswordSchema = z
	.string()
	.min(8, { error: 'Le mot de passe doit contenir au moins 8 caractères' })
	.regex(/[a-zA-Z]/, { error: 'Le mot doit contenir une lettre' })
	.regex(/[0-9]/, { error: 'Le mot de passe doit contenir un chiffre' })
	.regex(/[^a-zA-Z0-9]/, {
		error: 'Le mot de passe doit contenir un caractère spécial',
	});

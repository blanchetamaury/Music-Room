// eslint.config.mjs
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettierConfig,
	{
		ignores: ['node_modules/**', 'dist/**', 'prisma/migrations/**'],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			globals: {
				process: 'readonly',
				console: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': 'warn',
			'prefer-const': 'error',
		},
	},
];

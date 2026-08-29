import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
	...tseslint.configs.recommended,
	prettierConfig,
	{
		ignores: ['node_modules/**', 'dist/**', 'prisma/migrations/**'],
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'prefer-const': 'error',
			'no-console': 'off',
		},
	},
];

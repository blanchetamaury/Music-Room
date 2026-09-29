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
			// Type-only namespaces are still the documented way to augment Express's
			// Request, so declarations stay allowed; real runtime namespaces do not.
			'@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
			'prefer-const': 'error',
			'no-console': 'off',
		},
	},
];

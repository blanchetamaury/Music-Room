// eslint.config.mjs
import expoConfig from 'eslint-config-expo/flat.js';
import prettierConfig from 'eslint-config-prettier';

export default [
	...expoConfig,
	prettierConfig,
	{
		ignores: ['node_modules/**', '.expo/**', 'dist/**', 'build/**', 'android/**', 'ios/**'],
	},
	{
		rules: {
			'no-unused-vars': 'warn',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			globals: {
				jest: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeAll: 'readonly',
				beforeEach: 'readonly',
				afterAll: 'readonly',
				afterEach: 'readonly',
			},
		},
	},
];

// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // any 타입 명시적 사용 허용
      '@typescript-eslint/no-explicit-any': 'off',
      // await 없이 Promise 사용 허용
      '@typescript-eslint/no-floating-promises': 'off',
      // any 타입 인자 사용 허용
      '@typescript-eslint/no-unsafe-argument': 'off',
      // any 타입 할당 허용
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // any 타입 멤버 접근 허용
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // any 타입 함수 호출 허용
      '@typescript-eslint/no-unsafe-call': 'off',
      // any 타입 반환 허용
      '@typescript-eslint/no-unsafe-return': 'off',
      // 불필요한 타입 구성요소 허용 (예: string | any)
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      // require() import 사용 허용
      '@typescript-eslint/no-require-imports': 'off',
      // 바인딩되지 않은 메서드 참조 허용 (NestJS DI 패턴)
      '@typescript-eslint/unbound-method': 'off',
      // Prettier 포맷팅 규칙 (줄바꿈 자동 처리)
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);

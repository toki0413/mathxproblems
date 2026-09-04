import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // i18n.tsx / trpc.tsx 的结构性导出（字符串表、hook、router 类型）是合理设计，
      // 且仅影响 HMR 快刷体验、不阻塞生产，降为 warning。
      'react-refresh/only-export-components': 'warn',
    },
  },
  // 目录数据文件内嵌大量 LaTeX 数学文本（如 \{ 是 LaTeX 转义），JS 的
  // no-useless-escape 会误报；这些转义删除会破坏渲染语义，故豁免该规则。
  {
    files: ['src/data/**/*.ts'],
    rules: {
      'no-useless-escape': 'off',
    },
  },
])

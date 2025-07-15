import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: { js: { ignorePatterns: ["!**/*"] } },
  allConfig: { js: { ignorePatterns: ["!**/*"] } },
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable unescaped entities rule as it's too strict for text content
      'react/no-unescaped-entities': 'off',
      // Allow missing dependencies in useEffect for now
      'react-hooks/exhaustive-deps': 'warn',
      // Allow img elements for now
      '@next/next/no-img-element': 'warn',
    },
  },
];

export default eslintConfig; 
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';

const nextVitalsWithoutReactRules = nextVitals.map(config => {
  if (!config.rules) {
    return config;
  }

  const filteredRules = Object.fromEntries(
    Object.entries(config.rules).filter(
      ([ruleName]) => !ruleName.startsWith('react/')
    )
  );

  return {
    ...config,
    rules: filteredRules,
  };
});

const eslintConfig = defineConfig([
  ...nextVitalsWithoutReactRules,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
  ]),
]);

export default eslintConfig;

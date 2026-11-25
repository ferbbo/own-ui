/** @type {import('jest').Config} */

// Mapeo de los paquetes del workspace a su código fuente.
// Los `exports` de cada package.json apuntan a `dist/`, que no existe hasta
// construir: resolverlos a `src/` permite que los tests unitarios corran sin
// build previo y que la cobertura se atribuya al fuente, no al bundle.
const workspaceModuleMapper = {
  "^@ownui/tw-theme/variants$": "<rootDir>/packages/tw-theme/src/variants/index.ts",
  "^@ownui/tw-theme/theme$": "<rootDir>/packages/tw-theme/src/theme.ts",
  "^@ownui/tw-theme$": "<rootDir>/packages/tw-theme/src/index.ts",
  "^@ownui/dom-utils$": "<rootDir>/packages/utils/dom-utils/src/index.ts",
  "^@ownui/button$": "<rootDir>/packages/ui/src/Button/src/index.ts",
  "^@ownui/dropdown$": "<rootDir>/packages/ui/src/Dropdown/src/index.ts",
  "^@ownui/loader$": "<rootDir>/packages/ui/src/Loader/src/index.ts",
  "^@ownui/input$": "<rootDir>/packages/ui/src/Input/src/index.ts",
  "^@ownui/checkbox$": "<rootDir>/packages/ui/src/Checkbox/src/index.ts",
  "^@ownui/radio$": "<rootDir>/packages/ui/src/Radio/src/index.ts",
  "^@ownui/switch$": "<rootDir>/packages/ui/src/Switch/src/index.ts",
  "^@ownui/ui$": "<rootDir>/packages/ui/src/index.ts",
};

module.exports = {
  projects: [
    // Componentes React (Button, Dropdown, Loader) y utilidades de DOM.
    // Los componentes viven en packages/ui/src/<Name>/ y las utilidades en
    // packages/utils/<util>/ — no en packages/components/, que no existe.
    {
      displayName: "components",
      preset: "ts-jest/presets/default-esm",
      testEnvironment: "jsdom",
      extensionsToTreatAsEsm: [".ts", ".tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      testMatch: [
        "<rootDir>/packages/ui/**/__test__/**/*.{test,spec}.{ts,tsx}",
        "<rootDir>/packages/ui/**/*.{test,spec}.{ts,tsx}",
        "<rootDir>/packages/utils/**/__test__/**/*.{test,spec}.{ts,tsx}",
        "<rootDir>/packages/utils/**/*.{test,spec}.{ts,tsx}",
      ],
      testPathIgnorePatterns: ["/node_modules/", "/dist/"],
      moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        ...workspaceModuleMapper,
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            useESM: true,
            tsconfig: "<rootDir>/tsconfig.jest.json",
          },
        ],
      },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      collectCoverageFrom: [
        "packages/ui/src/**/src/**/*.{ts,tsx}",
        "packages/utils/**/src/**/*.{ts,tsx}",
        "!packages/**/*.stories.{ts,tsx}",
        "!packages/**/src/**/index.ts",
        "!packages/**/*.d.ts",
        "!packages/**/*.types.ts",
      ],
    },

    // Configuration for tw-theme package
    {
      displayName: "tw-theme",
      preset: "ts-jest/presets/default-esm",
      testEnvironment: "node",
      extensionsToTreatAsEsm: [".ts"],
      setupFilesAfterEnv: ["<rootDir>/packages/tw-theme/jest.setup.js"],
      testMatch: ["<rootDir>/packages/tw-theme/src/**/*.{test,spec}.{ts,tsx}"],
      testPathIgnorePatterns: ["test-utils.ts"],
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            tsconfig: "<rootDir>/packages/tw-theme/tsconfig.test.json",
          },
        ],
      },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      collectCoverageFrom: [
        "packages/tw-theme/src/**/*.{ts,tsx}",
        "!packages/tw-theme/src/**/*.d.ts",
        "!packages/tw-theme/src/**/__tests__/**",
        "!packages/tw-theme/src/**/index.ts",
        "!packages/tw-theme/src/build/**",
        "!packages/tw-theme/src/**/*.config.{ts,js}",
        "!packages/tw-theme/src/**/*test-utils*",
      ],
    },
    // Scripts de mantenimiento del repo (`scripts/*.mjs`). Son CLIs sin
    // dependencias, y sus tests los invocan como procesos para verificar
    // también el código de salida: es lo que los convierte en puerta de CI.
    // Viven aquí y no en el proyecto "components" porque no necesitan jsdom ni
    // los alias del workspace.
    {
      displayName: "scripts",
      preset: "ts-jest/presets/default-esm",
      testEnvironment: "node",
      extensionsToTreatAsEsm: [".ts"],
      testMatch: ["<rootDir>/scripts/__tests__/**/*.{test,spec}.ts"],
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      transform: {
        "^.+\\.ts$": [
          "ts-jest",
          {
            useESM: true,
            tsconfig: "<rootDir>/tsconfig.jest.json",
          },
        ],
      },
      moduleFileExtensions: ["ts", "js", "json", "node"],
      collectCoverageFrom: [],
    },
  ],

  // Global configuration
  // `collectCoverage` NO va aquí: encarece cada corrida de `pnpm test`.
  // La cobertura se pide explícitamente con `pnpm test:coverage`.
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json"],
  testTimeout: 10000,
  maxWorkers: "50%",
};

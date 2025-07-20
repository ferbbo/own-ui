# Testing Setup for @ownui/tw-theme

This package includes a comprehensive testing setup using Jest and TypeScript.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Structure

```
src/
├── functions/
│   ├── __tests__/
│   │   ├── generateThemeProperties.test.ts
│   │   └── generateThemeProperties.integration.test.ts
│   └── generateThemeProperties.ts
└── __tests__/
    └── test-utils.ts
```

## Test Categories

### Unit Tests
- **generateThemeProperties.test.ts**: Tests the core functionality of theme property generation
- Covers basic functionality, different color formats, edge cases, type safety, and performance

### Integration Tests
- **generateThemeProperties.integration.test.ts**: Tests integration with other utilities
- Tests real-world scenarios with complete light/dark themes
- Validates CSS custom property generation

### Test Utilities
- **test-utils.ts**: Contains mock data, fixtures, and helper functions for testing
- Includes predefined themes, color formats, and validation utilities

## Test Coverage

The test setup includes coverage reporting with the following exclusions:
- TypeScript declaration files (*.d.ts)
- Test files themselves
- Index files
- Build scripts
- Configuration files

## Configuration Files

- **jest.config.js**: Main Jest configuration with ESM support
- **jest.setup.js**: Jest setup file for additional configurations
- **tsconfig.test.json**: TypeScript configuration for tests

## Writing New Tests

When adding new tests:

1. Create test files in `__tests__` directories next to the source files
2. Use the `.test.ts` or `.spec.ts` suffix
3. Import utilities from `test-utils.ts` for consistency
4. Follow the existing test structure and naming conventions
5. Include both unit tests and integration tests where applicable

## Mock Data

The `test-utils.ts` file provides several mock themes and utilities:
- `mockThemes.light`: Complete light theme
- `mockThemes.dark`: Complete dark theme
- `mockThemes.minimal`: Minimal theme for basic tests
- `mockColorFormats`: Various color format examples
- Helper functions for generating test data and validation

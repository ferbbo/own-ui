import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E del plugin @ownui/tw-theme
 * 
 * Los tests validan que el CSS compilado funciona correctamente en un navegador real.
 */
export default defineConfig({
  // Directorio de tests
  testDir: './tests',
  
  // Timeout para cada test
  timeout: 30000,
  
  // Configuración de reintentos
  retries: process.env.CI ? 2 : 0,
  
  // Número de workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  
  // Configuración compartida
  use: {
    // URL base del servidor de desarrollo
    baseURL: 'http://localhost:3456',
    
    // Screenshots en caso de fallo
    screenshot: 'only-on-failure',
    
    // Videos solo en primera prueba fallida
    video: 'retain-on-failure',
    
    // Trace
    trace: 'on-first-retry',
  },

  // Configuración de proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Descomentar para probar en más navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Servidor web
  webServer: {
    command: 'cd .. && npx sirv e2e/dist --port 3456 --cors --single',
    port: 3456,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

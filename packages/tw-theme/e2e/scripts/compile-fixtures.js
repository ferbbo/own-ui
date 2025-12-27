#!/usr/bin/env node

/**
 * Script de compilación de fixtures para tests E2E
 * 
 * Este script:
 * 1. Construye el plugin @ownui/tw-theme
 * 2. Compila cada fixture usando Tailwind CSS
 * 3. Genera CSS de salida en e2e/dist/
 */

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '../..');
const FIXTURES_DIR = join(__dirname, '../fixtures');
const DIST_DIR = join(__dirname, '../dist');

/**
 * Ejecuta un comando y muestra el output
 */
function exec(command, cwd = ROOT_DIR) {
  console.log(`> ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (error) {
    console.error(`Error ejecutando: ${command}`);
    throw error;
  }
}

/**
 * Limpia el directorio de distribución
 */
function cleanDist() {
  console.log('\n📦 Limpiando directorio de distribución...');
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true, force: true });
  }
  mkdirSync(DIST_DIR, { recursive: true });
}

/**
 * Construye el plugin
 */
function buildPlugin() {
  console.log('\n🔨 Construyendo plugin @ownui/tw-theme...');
  exec('pnpm build', ROOT_DIR);
}

/**
 * Obtiene todos los directorios de fixtures
 */
function getFixtures() {
  if (!existsSync(FIXTURES_DIR)) {
    console.warn(`⚠️  Directorio de fixtures no existe: ${FIXTURES_DIR}`);
    return [];
  }
  
  return readdirSync(FIXTURES_DIR).filter(item => {
    const itemPath = join(FIXTURES_DIR, item);
    return statSync(itemPath).isDirectory();
  });
}

/**
 * Compila un fixture individual
 */
function compileFixture(fixtureName) {
  console.log(`\n⚙️  Compilando fixture: ${fixtureName}`);
  
  const fixtureDir = join(FIXTURES_DIR, fixtureName);
  const outputDir = join(DIST_DIR, fixtureName);
  
  // Check if this is a Vite project (react-components)
  const isViteProject = existsSync(join(fixtureDir, 'vite.config.ts'));
  
  if (isViteProject) {
    console.log(`📦 Detectado proyecto Vite: ${fixtureName}`);
    
    // Crear directorio de salida
    mkdirSync(outputDir, { recursive: true });
    
    try {
      // Build with Vite
      exec('pnpm install', fixtureDir);
      exec('pnpm vite build', fixtureDir);
      
      // Copy build output
      const viteDist = join(fixtureDir, 'dist');
      if (existsSync(viteDist)) {
        cpSync(viteDist, outputDir, { recursive: true });
        console.log(`✅ Compilado con Vite: ${fixtureName}`);
      }
    } catch (error) {
      console.error(`❌ Error compilando proyecto Vite ${fixtureName}`);
      throw error;
    }
    return;
  }
  
  // Verificar que existe input.css (para fixtures estáticos)
  const inputCss = join(fixtureDir, 'input.css');
  if (!existsSync(inputCss)) {
    console.warn(`⚠️  Saltando ${fixtureName}: no existe input.css`);
    return;
  }
  
  // Crear directorio de salida
  mkdirSync(outputDir, { recursive: true });
  
  // Compilar con Tailwind CSS
  const outputCss = join(outputDir, 'output.css');
  
  try {
    exec(
      `npx @tailwindcss/cli -i input.css -o ${outputCss}`,
      fixtureDir
    );
    
    console.log(`✅ Compilado: ${fixtureName}/output.css`);
  } catch (error) {
    console.error(`❌ Error compilando ${fixtureName}`);
    throw error;
  }
  
  // Copiar archivos HTML
  const htmlFiles = readdirSync(fixtureDir).filter(file => file.endsWith('.html'));
  htmlFiles.forEach(htmlFile => {
    const src = join(fixtureDir, htmlFile);
    const dest = join(outputDir, htmlFile);
    cpSync(src, dest);
    console.log(`📄 Copiado: ${htmlFile}`);
  });
}

/**
 * Compila todos los fixtures
 */
function compileAllFixtures() {
  console.log('\n🔍 Buscando fixtures...');
  
  const fixtures = getFixtures();
  
  if (fixtures.length === 0) {
    console.warn('⚠️  No se encontraron fixtures para compilar');
    return;
  }
  
  console.log(`Encontrados ${fixtures.length} fixture(s): ${fixtures.join(', ')}`);
  
  for (const fixture of fixtures) {
    compileFixture(fixture);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Iniciando compilación de fixtures E2E\n');
  console.log(`Root: ${ROOT_DIR}`);
  console.log(`Fixtures: ${FIXTURES_DIR}`);
  console.log(`Output: ${DIST_DIR}`);
  
  try {
    cleanDist();
    buildPlugin();
    compileAllFixtures();
    
    console.log('\n✨ ¡Compilación completada exitosamente!\n');
  } catch (error) {
    console.error('\n❌ Error durante la compilación:', error.message);
    process.exit(1);
  }
}

main();

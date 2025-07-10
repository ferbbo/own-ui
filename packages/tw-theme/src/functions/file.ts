// src/services/file.ts
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Lee un archivo de texto.
 */
export const readFile = async (relativePath: string): Promise<string> => {
  const abs = path.resolve(process.cwd(), relativePath);
  return fs.readFile(abs, 'utf8');
};

/**
 * Escribe un archivo de texto, creando carpetas si es necesario.
 */
export const  writeFile = async (relativePath: string, content: string): Promise<void> => {
  const abs = path.resolve(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  return fs.writeFile(abs, content, 'utf8');
};

export const jsonFileToJS = async (filePath: string): Promise<Record<string, any>> => {
  const json = await readFile(filePath);
  return JSON.parse(json);
};

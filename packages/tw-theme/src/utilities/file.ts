// src/services/file.ts
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Reads a text file from the given relative path.
 */
export const readTextFile = async (relativePath: string): Promise<string> => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  return fs.readFile(absolutePath, 'utf8');
};

/**
 * Writes a text file, creating directories if necessary.
 */
export const writeTextFile = async (relativePath: string, content: string): Promise<void> => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  return fs.writeFile(absolutePath, content, 'utf8');
};

/**
 * Loads and parses a JSON file into a JavaScript object.
 */
export const loadJsonFile = async (filePath: string): Promise<Record<string, any>> => {
  const jsonContent = await readTextFile(filePath);
  return JSON.parse(jsonContent);
};

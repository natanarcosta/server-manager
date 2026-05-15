import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class FilesystemService {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  async exists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }

  async readDir(dirPath: string): Promise<string[]> {
    const dirExists = await fs.pathExists(dirPath);
    if (!dirExists) return [];
    return fs.readdir(dirPath);
  }

  async stat(filePath: string): Promise<fs.Stats> {
    return fs.stat(filePath);
  }

  async remove(filePath: string): Promise<void> {
    await fs.remove(filePath);
  }

  resolvePath(...segments: string[]): string {
    return path.resolve(...segments);
  }

  joinPath(...segments: string[]): string {
    return path.join(...segments);
  }
}

/**
 * storage.ts - File-based storage for memos
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Memo } from './memo.js';

export interface StorageOptions {
  dataDir?: string;
  fileName?: string;
}

/**
 * MemoStorage - Handles persistent storage of memos
 */
export class MemoStorage {
  private dataDir: string;
  private fileName: string;
  private filePath: string;

  constructor(options: StorageOptions = {}) {
    this.dataDir = options.dataDir || path.join(process.cwd(), 'data');
    this.fileName = options.fileName || 'memos.json';
    this.filePath = path.join(this.dataDir, this.fileName);
  }

  /**
   * Initialize storage (create data directory if needed)
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      // Create empty file if it doesn't exist
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
      }
    } catch (error) {
      throw new Error(`Failed to initialize storage: ${error}`);
    }
  }

  /**
   * Load all memos from storage
   */
  async loadMemos(): Promise<Memo[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      return parsed.map((memo: any) => ({
        ...memo,
        createdAt: new Date(memo.createdAt),
        updatedAt: new Date(memo.updatedAt),
      }));
    } catch (error) {
      throw new Error(`Failed to load memos: ${error}`);
    }
  }

  /**
   * Save all memos to storage
   */
  async saveMemos(memos: Memo[]): Promise<void> {
    try {
      const data = JSON.stringify(memos, null, 2);
      await fs.writeFile(this.filePath, data, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save memos: ${error}`);
    }
  }

  /**
   * Add a new memo
   */
  async addMemo(memo: Memo): Promise<void> {
    const memos = await this.loadMemos();
    memos.push(memo);
    await this.saveMemos(memos);
  }

  /**
   * Get a memo by ID
   */
  async getMemo(id: string): Promise<Memo | null> {
    const memos = await this.loadMemos();
    return memos.find((memo) => memo.id === id) || null;
  }

  /**
   * Update a memo
   */
  async updateMemo(updatedMemo: Memo): Promise<boolean> {
    const memos = await this.loadMemos();
    const index = memos.findIndex((memo) => memo.id === updatedMemo.id);

    if (index === -1) {
      return false;
    }

    memos[index] = updatedMemo;
    await this.saveMemos(memos);
    return true;
  }

  /**
   * Delete a memo by ID
   */
  async deleteMemo(id: string): Promise<boolean> {
    const memos = await this.loadMemos();
    const filteredMemos = memos.filter((memo) => memo.id !== id);

    if (filteredMemos.length === memos.length) {
      return false; // Memo not found
    }

    await this.saveMemos(filteredMemos);
    return true;
  }

  /**
   * Clear all memos (use with caution!)
   */
  async clearAll(): Promise<void> {
    await this.saveMemos([]);
  }
}

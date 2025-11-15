/**
 * storage.test.ts - Tests for memo storage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoStorage } from '../src/storage.js';
import { createMemo } from '../src/memo.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('MemoStorage', () => {
  const testDataDir = path.join(process.cwd(), 'test-data');
  let storage: MemoStorage;

  beforeEach(async () => {
    storage = new MemoStorage({
      dataDir: testDataDir,
      fileName: 'test-memos.json',
    });
    await storage.init();
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('init', () => {
    it('should create data directory', async () => {
      const stats = await fs.stat(testDataDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create empty memos file', async () => {
      const filePath = path.join(testDataDir, 'test-memos.json');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(JSON.parse(content)).toEqual([]);
    });
  });

  describe('addMemo and loadMemos', () => {
    it('should add and load a memo', async () => {
      const memo = createMemo({
        title: 'Test Memo',
        content: 'Test content',
        tags: ['test'],
      });

      await storage.addMemo(memo);
      const memos = await storage.loadMemos();

      expect(memos).toHaveLength(1);
      expect(memos[0].id).toBe(memo.id);
      expect(memos[0].title).toBe('Test Memo');
      expect(memos[0].content).toBe('Test content');
      expect(memos[0].tags).toEqual(['test']);
    });

    it('should preserve date objects', async () => {
      const memo = createMemo({
        title: 'Test',
        content: 'Test',
        tags: [],
      });

      await storage.addMemo(memo);
      const loaded = await storage.loadMemos();

      expect(loaded[0].createdAt).toBeInstanceOf(Date);
      expect(loaded[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getMemo', () => {
    it('should get a memo by ID', async () => {
      const memo = createMemo({
        title: 'Test Memo',
        content: 'Test content',
        tags: [],
      });

      await storage.addMemo(memo);
      const retrieved = await storage.getMemo(memo.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(memo.id);
      expect(retrieved?.title).toBe('Test Memo');
    });

    it('should return null if memo not found', async () => {
      const retrieved = await storage.getMemo('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('updateMemo', () => {
    it('should update a memo', async () => {
      const memo = createMemo({
        title: 'Original',
        content: 'Original content',
        tags: [],
      });

      await storage.addMemo(memo);

      const updated = { ...memo, title: 'Updated' };
      const success = await storage.updateMemo(updated);

      expect(success).toBe(true);

      const retrieved = await storage.getMemo(memo.id);
      expect(retrieved?.title).toBe('Updated');
    });

    it('should return false if memo not found', async () => {
      const memo = createMemo({
        title: 'Test',
        content: 'Test',
        tags: [],
      });

      const success = await storage.updateMemo(memo);
      expect(success).toBe(false);
    });
  });

  describe('deleteMemo', () => {
    it('should delete a memo', async () => {
      const memo = createMemo({
        title: 'To Delete',
        content: 'This will be deleted',
        tags: [],
      });

      await storage.addMemo(memo);
      const success = await storage.deleteMemo(memo.id);

      expect(success).toBe(true);

      const memos = await storage.loadMemos();
      expect(memos).toHaveLength(0);
    });

    it('should return false if memo not found', async () => {
      const success = await storage.deleteMemo('nonexistent');
      expect(success).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all memos', async () => {
      const memo1 = createMemo({ title: 'Memo 1', content: 'Content 1', tags: [] });
      const memo2 = createMemo({ title: 'Memo 2', content: 'Content 2', tags: [] });

      await storage.addMemo(memo1);
      await storage.addMemo(memo2);

      await storage.clearAll();

      const memos = await storage.loadMemos();
      expect(memos).toHaveLength(0);
    });
  });
});

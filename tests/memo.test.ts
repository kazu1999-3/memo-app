/**
 * memo.test.ts - Tests for memo business logic
 */

import { describe, it, expect } from 'vitest';
import { createMemo, updateMemo, searchMemos, filterMemosByTag, sortMemosByDate } from '../src/memo.js';
import type { Memo } from '../src/memo.js';

describe('Memo Functions', () => {
  describe('createMemo', () => {
    it('should create a memo with all required fields', () => {
      const input = {
        title: 'Test Memo',
        content: 'This is a test memo',
        tags: ['test'],
      };

      const memo = createMemo(input);

      expect(memo.id).toBeDefined();
      expect(memo.title).toBe('Test Memo');
      expect(memo.content).toBe('This is a test memo');
      expect(memo.tags).toEqual(['test']);
      expect(memo.createdAt).toBeInstanceOf(Date);
      expect(memo.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for different memos', () => {
      const input = {
        title: 'Test',
        content: 'Test',
        tags: [],
      };

      const memo1 = createMemo(input);
      const memo2 = createMemo(input);

      expect(memo1.id).not.toBe(memo2.id);
    });
  });

  describe('updateMemo', () => {
    it('should update memo fields', () => {
      const memo = createMemo({
        title: 'Original',
        content: 'Original content',
        tags: ['old'],
      });

      const updated = updateMemo(memo, {
        title: 'Updated',
        content: 'Updated content',
      });

      expect(updated.title).toBe('Updated');
      expect(updated.content).toBe('Updated content');
      expect(updated.tags).toEqual(['old']);
      expect(updated.id).toBe(memo.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(memo.updatedAt.getTime());
    });

    it('should update only specified fields', () => {
      const memo = createMemo({
        title: 'Original',
        content: 'Original content',
        tags: ['tag1'],
      });

      const updated = updateMemo(memo, {
        title: 'New Title',
      });

      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('Original content');
      expect(updated.tags).toEqual(['tag1']);
    });
  });

  describe('searchMemos', () => {
    const memos: Memo[] = [
      createMemo({ title: 'TypeScript Tutorial', content: 'Learn TypeScript', tags: ['coding'] }),
      createMemo({ title: 'Meeting Notes', content: 'Discuss project timeline', tags: ['work'] }),
      createMemo({ title: 'Shopping List', content: 'Buy groceries', tags: ['personal'] }),
    ];

    it('should find memos by title', () => {
      const results = searchMemos(memos, 'TypeScript');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('TypeScript Tutorial');
    });

    it('should find memos by content', () => {
      const results = searchMemos(memos, 'timeline');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Meeting Notes');
    });

    it('should find memos by tag', () => {
      const results = searchMemos(memos, 'work');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Meeting Notes');
    });

    it('should be case insensitive', () => {
      const results = searchMemos(memos, 'typescript');
      expect(results).toHaveLength(1);
    });

    it('should return empty array if no matches', () => {
      const results = searchMemos(memos, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('filterMemosByTag', () => {
    const memos: Memo[] = [
      createMemo({ title: 'Memo 1', content: 'Content 1', tags: ['work', 'urgent'] }),
      createMemo({ title: 'Memo 2', content: 'Content 2', tags: ['personal'] }),
      createMemo({ title: 'Memo 3', content: 'Content 3', tags: ['work'] }),
    ];

    it('should filter memos by tag', () => {
      const results = filterMemosByTag(memos, 'work');
      expect(results).toHaveLength(2);
    });

    it('should return empty array if tag not found', () => {
      const results = filterMemosByTag(memos, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('sortMemosByDate', () => {
    it('should sort memos in descending order by default', async () => {
      const memo1 = createMemo({ title: 'First', content: 'First', tags: [] });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo2 = createMemo({ title: 'Second', content: 'Second', tags: [] });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo3 = createMemo({ title: 'Third', content: 'Third', tags: [] });

      const sorted = sortMemosByDate([memo1, memo2, memo3]);

      expect(sorted[0].title).toBe('Third');
      expect(sorted[1].title).toBe('Second');
      expect(sorted[2].title).toBe('First');
    });

    it('should sort memos in ascending order', async () => {
      const memo1 = createMemo({ title: 'First', content: 'First', tags: [] });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo2 = createMemo({ title: 'Second', content: 'Second', tags: [] });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const memo3 = createMemo({ title: 'Third', content: 'Third', tags: [] });

      const sorted = sortMemosByDate([memo1, memo2, memo3], 'asc');

      expect(sorted[0].title).toBe('First');
      expect(sorted[1].title).toBe('Second');
      expect(sorted[2].title).toBe('Third');
    });
  });
});

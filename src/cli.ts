/**
 * cli.ts - Command-line interface for the memo app
 */

import { createMemo, updateMemo, searchMemos, sortMemosByDate, filterMemosByTag } from './memo.js';
import { MemoStorage } from './storage.js';
import type { CreateMemoInput } from './memo.js';

/**
 * MemoCLI - Command-line interface for managing memos
 */
export class MemoCLI {
  private storage: MemoStorage;

  constructor(storage?: MemoStorage) {
    this.storage = storage || new MemoStorage();
  }

  /**
   * Initialize the CLI
   */
  async init(): Promise<void> {
    await this.storage.init();
  }

  /**
   * Add a new memo
   */
  async add(input: CreateMemoInput): Promise<string> {
    const memo = createMemo(input);
    await this.storage.addMemo(memo);
    return memo.id;
  }

  /**
   * List all memos
   */
  async list(options?: { tag?: string; sortOrder?: 'asc' | 'desc' }): Promise<void> {
    let memos = await this.storage.loadMemos();

    // Filter by tag if specified
    if (options?.tag) {
      memos = filterMemosByTag(memos, options.tag);
    }

    // Sort by date
    memos = sortMemosByDate(memos, options?.sortOrder);

    if (memos.length === 0) {
      console.log('No memos found.');
      return;
    }

    console.log(`\nFound ${memos.length} memo(s):\n`);
    memos.forEach((memo, index) => {
      console.log(`[${index + 1}] ${memo.title}`);
      console.log(`    ID: ${memo.id}`);
      console.log(`    Created: ${memo.createdAt.toLocaleString()}`);
      console.log(`    Tags: ${memo.tags.join(', ') || 'None'}`);
      console.log(`    Content: ${memo.content.substring(0, 100)}${memo.content.length > 100 ? '...' : ''}`);
      console.log('');
    });
  }

  /**
   * Show a specific memo
   */
  async show(id: string): Promise<void> {
    const memo = await this.storage.getMemo(id);

    if (!memo) {
      console.log(`Memo with ID "${id}" not found.`);
      return;
    }

    console.log('\n--- Memo Details ---');
    console.log(`Title: ${memo.title}`);
    console.log(`ID: ${memo.id}`);
    console.log(`Created: ${memo.createdAt.toLocaleString()}`);
    console.log(`Updated: ${memo.updatedAt.toLocaleString()}`);
    console.log(`Tags: ${memo.tags.join(', ') || 'None'}`);
    console.log(`\nContent:\n${memo.content}`);
    console.log('-------------------\n');
  }

  /**
   * Update a memo
   */
  async update(id: string, updates: { title?: string; content?: string; tags?: string[] }): Promise<boolean> {
    const memo = await this.storage.getMemo(id);

    if (!memo) {
      console.log(`Memo with ID "${id}" not found.`);
      return false;
    }

    const updatedMemo = updateMemo(memo, updates);
    const success = await this.storage.updateMemo(updatedMemo);

    if (success) {
      console.log(`Memo "${memo.title}" updated successfully.`);
    }

    return success;
  }

  /**
   * Delete a memo
   */
  async delete(id: string): Promise<boolean> {
    const memo = await this.storage.getMemo(id);

    if (!memo) {
      console.log(`Memo with ID "${id}" not found.`);
      return false;
    }

    const success = await this.storage.deleteMemo(id);

    if (success) {
      console.log(`Memo "${memo.title}" deleted successfully.`);
    }

    return success;
  }

  /**
   * Search memos by keyword
   */
  async search(keyword: string): Promise<void> {
    const memos = await this.storage.loadMemos();
    const results = searchMemos(memos, keyword);

    if (results.length === 0) {
      console.log(`No memos found matching "${keyword}".`);
      return;
    }

    console.log(`\nFound ${results.length} memo(s) matching "${keyword}":\n`);
    results.forEach((memo, index) => {
      console.log(`[${index + 1}] ${memo.title}`);
      console.log(`    ID: ${memo.id}`);
      console.log(`    Created: ${memo.createdAt.toLocaleString()}`);
      console.log(`    Content: ${memo.content.substring(0, 100)}${memo.content.length > 100 ? '...' : ''}`);
      console.log('');
    });
  }

  /**
   * Display help information
   */
  help(): void {
    console.log(`
📝 Memo App - CLI Commands

Usage:
  npm run dev <command> [options]

Commands:
  add <title> <content> [tags]  Add a new memo
  list [--tag <tag>]            List all memos
  show <id>                     Show a specific memo
  update <id> [options]         Update a memo
  delete <id>                   Delete a memo
  search <keyword>              Search memos by keyword
  help                          Show this help message

Examples:
  npm run dev add "Meeting Notes" "Discuss project timeline" work,meeting
  npm run dev list --tag work
  npm run dev show memo_1234567890_abc123
  npm run dev search "timeline"
  npm run dev delete memo_1234567890_abc123
`);
  }
}

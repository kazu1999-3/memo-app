/**
 * memo.ts - Memo type definitions and business logic
 */

export interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export type CreateMemoInput = Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMemoInput = Partial<Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Generate a unique ID for a memo
 */
export function generateId(): string {
  return `memo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new memo
 */
export function createMemo(input: CreateMemoInput): Memo {
  const now = new Date();
  return {
    id: generateId(),
    title: input.title,
    content: input.content,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing memo
 */
export function updateMemo(memo: Memo, updates: UpdateMemoInput): Memo {
  return {
    ...memo,
    ...updates,
    updatedAt: new Date(),
  };
}

/**
 * Search memos by keyword
 */
export function searchMemos(memos: Memo[], keyword: string): Memo[] {
  const lowerKeyword = keyword.toLowerCase();
  return memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(lowerKeyword) ||
      memo.content.toLowerCase().includes(lowerKeyword) ||
      memo.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Filter memos by tag
 */
export function filterMemosByTag(memos: Memo[], tag: string): Memo[] {
  return memos.filter((memo) => memo.tags.includes(tag));
}

/**
 * Sort memos by creation date
 */
export function sortMemosByDate(memos: Memo[], order: 'asc' | 'desc' = 'desc'): Memo[] {
  return [...memos].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return order === 'asc' ? aTime - bTime : bTime - aTime;
  });
}

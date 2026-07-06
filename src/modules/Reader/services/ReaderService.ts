import { dbService } from '@/core/database/DatabaseService';
import type { Book } from '@/core/models/Database.types';

export class ReaderService {
  async getBookById(id: string): Promise<Book | null> {
    const query = `SELECT * FROM Books WHERE id = $1 LIMIT 1`;
    const results = await dbService.select<Book>(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  async updateCurrentPage(id: string, page: number): Promise<void> {
    const query = `UPDATE Books SET current_page = $1, updated_at = $2 WHERE id = $3`;
    await dbService.execute(query, [page, new Date().toISOString(), id]);
  }

  async updateReadingHistory(bookId: string, durationSeconds: number, pagesRead: number): Promise<void> {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const query = `
      INSERT INTO ReadingHistory (id, book_id, read_date, duration_seconds, pages_read)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT(book_id, read_date) DO UPDATE SET
        duration_seconds = duration_seconds + excluded.duration_seconds,
        pages_read = pages_read + excluded.pages_read;
    `;
    // Note: SQLite ON CONFLICT requires a unique index/constraint.
    // In our migrations: UNIQUE(book_id, read_date).
    await dbService.execute(query, [crypto.randomUUID(), bookId, date, durationSeconds, pagesRead]);
  }
}

export const readerService = new ReaderService();

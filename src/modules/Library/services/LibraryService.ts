import { dbService } from '@/core/database/DatabaseService';
import type { Book } from '@/core/models/Database.types';

export class LibraryService {
  /**
   * Lấy danh sách toàn bộ sách trong thư viện, sắp xếp theo thời gian thêm mới nhất.
   */
  async getAllBooks(): Promise<Book[]> {
    const query = `SELECT * FROM Books ORDER BY added_at DESC`;
    return await dbService.select<Book>(query);
  }

  /**
   * Thêm một cuốn sách mới vào cơ sở dữ liệu.
   */
  async addBook(file: { name: string; path: string; type: string }): Promise<Book> {
    const id = crypto.randomUUID();
    const newBook: Book = {
      id,
      title: file.name,
      filename: file.name,
      file_path: file.path,
      file_type: file.type as 'pdf' | 'docx' | 'txt',
      total_pages: 0,
      current_page: 1,
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: 0,
      author: '',
      genre: '',
      published_year: '',
      description: '',
      cover_image: '',
      sort_order: 0,
    };

    const query = `
      INSERT INTO Books (id, title, filename, file_path, file_type, total_pages, current_page, added_at, updated_at, is_pinned, author, genre, published_year, description, cover_image, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;
    
    await dbService.execute(query, [
      newBook.id, newBook.title, newBook.filename, newBook.file_path, newBook.file_type, 
      newBook.total_pages, newBook.current_page, newBook.added_at, newBook.updated_at,
      newBook.is_pinned, newBook.author, newBook.genre, newBook.published_year,
      newBook.description, newBook.cover_image, newBook.sort_order
    ]);

    return newBook;
  }

  async updateBook(book: Book): Promise<void> {
    book.updated_at = new Date().toISOString();
    const query = `
      UPDATE Books SET 
        title = $1, author = $2, genre = $3, published_year = $4, 
        description = $5, cover_image = $6, updated_at = $7, is_pinned = $8, sort_order = $9, deleted_at = $10
      WHERE id = $11
    `;
    await dbService.execute(query, [
      book.title, book.author, book.genre, book.published_year, 
      book.description, book.cover_image, book.updated_at, book.is_pinned, book.sort_order, book.deleted_at || null, book.id
    ]);
  }

  async softDeleteBook(id: string): Promise<void> {
    const deletedAt = new Date().toISOString();
    const query = `UPDATE Books SET deleted_at = $1 WHERE id = $2`;
    await dbService.execute(query, [deletedAt, id]);
  }

  async restoreBook(id: string): Promise<void> {
    const query = `UPDATE Books SET deleted_at = NULL WHERE id = $1`;
    await dbService.execute(query, [id]);
  }

  async hardDeleteBook(id: string): Promise<void> {
    const query = `DELETE FROM Books WHERE id = $1`;
    await dbService.execute(query, [id]);
  }

  async getAllReadingHistory(): Promise<any[]> {
    const query = `
      SELECT h.*, b.title as book_title
      FROM ReadingHistory h
      JOIN Books b ON h.book_id = b.id
      ORDER BY h.read_date DESC
    `;
    return await dbService.select(query);
  }
}

export const libraryService = new LibraryService();

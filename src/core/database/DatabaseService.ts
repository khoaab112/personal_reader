import Database from '@tauri-apps/plugin-sql';
import { INITIAL_SCHEMA } from './migrations';

class DatabaseService {
  private db: Database | null = null;
  private readonly dbName = 'sqlite:personal_reader.db';

  async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        this.db = await Database.load(this.dbName);
        await this.runMigrations();
      } else {
        if (!localStorage.getItem('mock_Books')) {
          localStorage.setItem('mock_Books', JSON.stringify([]));
          localStorage.setItem('mock_Annotations', JSON.stringify([]));
          localStorage.setItem('mock_Notes', JSON.stringify([]));
          localStorage.setItem('mock_ReadingHistory', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;
    const statements = INITIAL_SCHEMA.split(';').filter(stmt => stmt.trim() !== '');
    for (const stmt of statements) {
      try {
        await this.db.execute(stmt);
      } catch (e) {
      }
    }
  }

  private getMockTable(tableName: string): any[] {
    const data = localStorage.getItem(`mock_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private setMockTable(tableName: string, data: any[]) {
    localStorage.setItem(`mock_${tableName}`, JSON.stringify(data));
  }

  async execute(query: string, bindValues: any[] = []): Promise<any> {
    if (!this.db) {
      const upperQuery = query.trim().toUpperCase();
      if (upperQuery.startsWith('INSERT INTO BOOKS')) {
        const books = this.getMockTable('Books');
        books.push({
          id: bindValues[0], title: bindValues[1], filename: bindValues[2],
          file_path: bindValues[3], file_type: bindValues[4], total_pages: bindValues[5],
          current_page: bindValues[6], added_at: bindValues[7], updated_at: bindValues[8],
          is_pinned: bindValues[9], author: bindValues[10], genre: bindValues[11],
          published_year: bindValues[12], description: bindValues[13], cover_image: bindValues[14],
          sort_order: bindValues[15]
        });
        this.setMockTable('Books', books);
      } else if (upperQuery.startsWith('UPDATE BOOKS SET CURRENT_PAGE')) {
        const books = this.getMockTable('Books');
        const book = books.find((b: any) => b.id === bindValues[2]);
        if (book) {
          book.current_page = bindValues[0];
          book.updated_at = bindValues[1];
          this.setMockTable('Books', books);
        }
      } else if (upperQuery.includes('UPDATE BOOKS SET') && upperQuery.includes('TITLE = $1')) {
        const books = this.getMockTable('Books');
        const book = books.find((b: any) => b.id === bindValues[10]);
        if (book) {
          book.title = bindValues[0];
          book.author = bindValues[1];
          book.genre = bindValues[2];
          book.published_year = bindValues[3];
          book.description = bindValues[4];
          book.cover_image = bindValues[5];
          book.updated_at = bindValues[6];
          book.is_pinned = bindValues[7];
          book.sort_order = bindValues[8];
          book.deleted_at = bindValues[9];
          this.setMockTable('Books', books);
        }
      } else if (upperQuery.startsWith('INSERT INTO ANNOTATIONS')) {
        const annotations = this.getMockTable('Annotations');
        annotations.push({
          id: bindValues[0], book_id: bindValues[1], type: bindValues[2],
          content: bindValues[3], page: bindValues[4], position_data: bindValues[5],
          color: bindValues[6], created_at: bindValues[7]
        });
        this.setMockTable('Annotations', annotations);
      } else if (upperQuery.startsWith('DELETE FROM ANNOTATIONS')) {
        let annotations = this.getMockTable('Annotations');
        annotations = annotations.filter((a: any) => a.id !== bindValues[0]);
        this.setMockTable('Annotations', annotations);
      } else if (upperQuery.startsWith('INSERT INTO NOTES')) {
        const notes = this.getMockTable('Notes');
        notes.push({
          id: bindValues[0], book_id: bindValues[1], target_text: bindValues[2],
          note_content: bindValues[3], page: bindValues[4], position_data: bindValues[5],
          created_at: bindValues[6], updated_at: bindValues[7]
        });
        this.setMockTable('Notes', notes);
      } else if (upperQuery.startsWith('DELETE FROM NOTES')) {
        let notes = this.getMockTable('Notes');
        notes = notes.filter((n: any) => n.id !== bindValues[0]);
        this.setMockTable('Notes', notes);
      } else if (upperQuery.startsWith('INSERT INTO READINGHISTORY')) {
        const history = this.getMockTable('ReadingHistory');
        const existingIdx = history.findIndex((h: any) => h.book_id === bindValues[1] && h.read_date === bindValues[2]);
        if (existingIdx !== -1) {
          history[existingIdx].duration_seconds += bindValues[3];
          history[existingIdx].pages_read += bindValues[4];
        } else {
          history.push({
            id: bindValues[0], book_id: bindValues[1], read_date: bindValues[2],
            duration_seconds: bindValues[3], pages_read: bindValues[4]
          });
        }
        this.setMockTable('ReadingHistory', history);
      }
      return [];
    }
    return this.db.execute(query, bindValues);
  }

  async select<T>(query: string, bindValues: any[] = []): Promise<T[]> {
    if (!this.db) {
      const upperQuery = query.trim().toUpperCase();
      if (upperQuery.startsWith('SELECT * FROM BOOKS ORDER BY ADDED_AT DESC')) {
        const books = this.getMockTable('Books');
        return books.sort((a: any, b: any) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()) as unknown as T[];
      } else if (upperQuery.startsWith('SELECT * FROM BOOKS WHERE ID = $1 LIMIT 1')) {
        const books = this.getMockTable('Books');
        return books.filter((b: any) => b.id === bindValues[0]) as unknown as T[];
      } else if (upperQuery.startsWith('SELECT * FROM BOOKS WHERE ID')) {
        const books = this.getMockTable('Books');
        return books.filter((b: any) => b.id === bindValues[0]) as unknown as T[];
      } else if (upperQuery.startsWith('SELECT * FROM ANNOTATIONS')) {
        const annotations = this.getMockTable('Annotations');
        return annotations.filter((a: any) => a.book_id === bindValues[0]) as unknown as T[];
      } else if (upperQuery.startsWith('SELECT * FROM NOTES')) {
        const notes = this.getMockTable('Notes');
        return notes.filter((n: any) => n.book_id === bindValues[0]) as unknown as T[];
      } else if (upperQuery.includes('SELECT H.*, B.TITLE AS BOOK_TITLE')) {
        const history = this.getMockTable('ReadingHistory');
        const books = this.getMockTable('Books');
        const result = history.map((h: any) => {
          const book = books.find((b: any) => b.id === h.book_id);
          return { ...h, book_title: book ? book.title : 'Unknown' };
        }).sort((a: any, b: any) => new Date(b.read_date).getTime() - new Date(a.read_date).getTime());
        return result as unknown as T[];
      }
      return [];
    }
    return this.db.select<T[]>(query, bindValues);
  }

  async restoreBackup(data: any): Promise<void> {
    if (this.db) {
      const tables = ['Books', 'Annotations', 'Notes', 'ReadingHistory', 'Bookmarks', 'TableOfContents', 'Settings'];
      for (const table of tables) {
        if (data[table] && Array.isArray(data[table])) {
          await this.execute('DELETE FROM ' + table);
          for (const row of data[table]) {
            const keys = Object.keys(row);
            const values = Object.values(row);
            const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');
            const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
            await this.execute(query, values);
          }
        }
      }
    } else {
      const tables = ['Books', 'Annotations', 'Notes', 'ReadingHistory', 'Bookmarks', 'TableOfContents', 'Settings'];
      for (const table of tables) {
        if (data[table]) {
          this.setMockTable(table, data[table]);
        }
      }
    }
  }

  async clearAllData(): Promise<void> {
    if (this.db) {
      const tables = ['Books', 'Annotations', 'Notes', 'ReadingHistory', 'Bookmarks', 'TableOfContents', 'Settings'];
      for (const table of tables) {
        try {
          await this.execute('DELETE FROM ' + table);
        } catch (e) {}
      }
    } else {
      const tables = ['Books', 'Annotations', 'Notes', 'ReadingHistory', 'Bookmarks', 'TableOfContents', 'Settings'];
      for (const table of tables) {
        localStorage.removeItem('mock_' + table);
      }
      localStorage.setItem('mock_Books', JSON.stringify([]));
      localStorage.setItem('mock_Annotations', JSON.stringify([]));
      localStorage.setItem('mock_Notes', JSON.stringify([]));
      localStorage.setItem('mock_ReadingHistory', JSON.stringify([]));
    }
  }

  async exportBackup(): Promise<any> {
    if (this.db) {
      const tables = ['Books', 'Annotations', 'Notes', 'ReadingHistory', 'Bookmarks', 'TableOfContents', 'Settings'];
      const data: any = {};
      for (const table of tables) {
        data[table] = await this.select('SELECT * FROM ' + table);
      }
      return data;
    } else {
      return {
        Books: this.getMockTable('Books'),
        Annotations: this.getMockTable('Annotations'),
        Notes: this.getMockTable('Notes'),
        ReadingHistory: this.getMockTable('ReadingHistory'),
        Bookmarks: this.getMockTable('Bookmarks'),
        TableOfContents: this.getMockTable('TableOfContents'),
        Settings: this.getMockTable('Settings')
      };
    }
  }

  async getStorageUsage(): Promise<number> {
    if (this.db) {
      const backup = await this.exportBackup();
      return new Blob([JSON.stringify(backup)]).size;
    } else {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mock_')) {
          total += (localStorage.getItem(key) || '').length * 2;
        }
      }
      return total;
    }
  }
}

export const dbService = new DatabaseService();

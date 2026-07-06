import { dbService } from '@/core/database/DatabaseService';
import type { Annotation, Note } from '@/core/models/Database.types';

export class AnnotationService {
  async getAnnotationsByBook(bookId: string): Promise<Annotation[]> {
    const query = `SELECT * FROM Annotations WHERE book_id = $1`;
    return await dbService.select<Annotation>(query, [bookId]);
  }

  async addAnnotation(annotation: Omit<Annotation, 'id' | 'created_at'>): Promise<Annotation> {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    
    const newAnnotation: Annotation = {
      ...annotation,
      id,
      created_at
    };

    const query = `
      INSERT INTO Annotations (id, book_id, type, content, page, position_data, color, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await dbService.execute(query, [
      newAnnotation.id,
      newAnnotation.book_id,
      newAnnotation.type,
      newAnnotation.content,
      newAnnotation.page,
      newAnnotation.position_data,
      newAnnotation.color,
      newAnnotation.created_at
    ]);

    return newAnnotation;
  }

  async deleteAnnotation(id: string): Promise<void> {
    const query = `DELETE FROM Annotations WHERE id = $1`;
    await dbService.execute(query, [id]);
  }

  // --- Notes ---
  async getNotesByBook(bookId: string): Promise<Note[]> {
    const query = `SELECT * FROM Notes WHERE book_id = $1`;
    return await dbService.select<Note>(query, [bookId]);
  }

  async addNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newNote: Note = {
      ...note,
      id,
      created_at: now,
      updated_at: now
    };

    const query = `
      INSERT INTO Notes (id, book_id, target_text, note_content, page, position_data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await dbService.execute(query, [
      newNote.id,
      newNote.book_id,
      newNote.target_text,
      newNote.note_content,
      newNote.page,
      newNote.position_data,
      newNote.created_at,
      newNote.updated_at
    ]);

    return newNote;
  }

  async deleteNote(id: string): Promise<void> {
    const query = `DELETE FROM Notes WHERE id = $1`;
    await dbService.execute(query, [id]);
  }
}

export const annotationService = new AnnotationService();

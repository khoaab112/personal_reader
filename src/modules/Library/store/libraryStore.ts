import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Book } from '@/core/models/Database.types';
import { libraryService } from '../services/LibraryService';
import { selectBookFile, processBookFile } from '@/core/utils/fileSystem';
import { getFileFromSandbox } from '@/core/utils/sandboxFileStore';
import { generatePDFCover } from '@/core/utils/pdfHelpers';

export const useLibraryStore = defineStore('library', () => {
  const books = ref<Book[]>([]);
  const isLoading = ref(false);
  const isAdding = ref(false); // For add book loading state
  const searchQuery = ref('');
  const history = ref<any[]>([]);

  const loadBooks = async () => {
    isLoading.value = true;
    try {
      const fetchedBooks = await libraryService.getAllBooks();
      history.value = await libraryService.getAllReadingHistory();
      // Sort: pinned first, then by sort_order, then by added_at
      // Auto hard-delete books older than 30 days
      const now = new Date().getTime();
      for (const b of fetchedBooks) {
        if (b.deleted_at) {
          const diffDays = Math.ceil(Math.abs(now - new Date(b.deleted_at).getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 30) {
            await libraryService.hardDeleteBook(b.id);
          }
        }
      }

      const validBooks = fetchedBooks.filter(b => !(b.deleted_at && Math.ceil(Math.abs(now - new Date(b.deleted_at).getTime()) / (1000 * 60 * 60 * 24)) > 30));
      books.value = validBooks.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return (b.is_pinned || 0) - (a.is_pinned || 0);
        if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      });
    } catch (e) {
      console.error('Failed to load books', e);
    } finally {
      isLoading.value = false;
    }
  };

  const addBook = async () => {
    const file = await selectBookFile();
    if (file) {
      isAdding.value = true;
      try {
        const newBook = await libraryService.addBook(file);
        
        if (file.type === 'pdf') {
          try {
            const f = await getFileFromSandbox(file.path);
            if (f) {
              const fileUrl = URL.createObjectURL(f);
              const cover = await generatePDFCover(fileUrl, 1);
              URL.revokeObjectURL(fileUrl);
              if (cover) {
                newBook.cover_image = cover;
                await libraryService.updateBook(newBook);
              }
            }
          } catch (err) {
            console.warn('Failed to auto-generate PDF cover', err);
          }
        }
        
        // Cập nhật state nội bộ
        books.value.unshift(newBook);
        return newBook; // Return to open modal
      } catch (e) {
        console.error('Failed to add book', e);
      } finally {
        isAdding.value = false;
      }
    }
    return null;
  };

  const addBookFromFile = async (fileObj: File) => {
    isAdding.value = true;
    try {
      const file = await processBookFile(fileObj);
      const newBook = await libraryService.addBook(file);
      
      if (file.type === 'pdf') {
        try {
          const f = await getFileFromSandbox(file.path);
          if (f) {
            const fileUrl = URL.createObjectURL(f);
            const cover = await generatePDFCover(fileUrl, 1);
            URL.revokeObjectURL(fileUrl);
            if (cover) {
              newBook.cover_image = cover;
              await libraryService.updateBook(newBook);
            }
          }
        } catch (err) {
          console.warn('Failed to auto-generate PDF cover', err);
        }
      }
      
      books.value.unshift(newBook);
      return newBook;
    } catch (e) {
      console.error('Failed to add book from file', e);
      return null;
    } finally {
      isAdding.value = false;
    }
  };

  const updateBook = async (book: Book) => {
    try {
      await libraryService.updateBook(book);
      const index = books.value.findIndex(b => b.id === book.id);
      if (index !== -1) {
        books.value[index] = { ...book };
      }
      // Re-sort
      books.value = [...books.value].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return (b.is_pinned || 0) - (a.is_pinned || 0);
        if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      });
    } catch (e) {
      console.error('Failed to update book', e);
    }
  };

  const togglePin = async (book: Book) => {
    const updatedBook = { ...book, is_pinned: book.is_pinned ? 0 : 1 };
    await updateBook(updatedBook);
  };

  const updateOrder = async (newOrder: Book[]) => {
    books.value = newOrder;
    // Update sort_order for each book
    for (let i = 0; i < newOrder.length; i++) {
      if (newOrder[i].sort_order !== i) {
        newOrder[i].sort_order = i;
        await libraryService.updateBook(newOrder[i]);
      }
    }
  };

  const softDeleteBook = async (id: string) => {
    try {
      await libraryService.softDeleteBook(id);
      const book = books.value.find(b => b.id === id);
      if (book) {
        book.deleted_at = new Date().toISOString();
      }
    } catch (e) {
      console.error('Failed to soft delete book', e);
    }
  };

  const restoreBook = async (id: string) => {
    try {
      await libraryService.restoreBook(id);
      const book = books.value.find(b => b.id === id);
      if (book) {
        book.deleted_at = null;
      }
    } catch (e) {
      console.error('Failed to restore book', e);
    }
  };

  const hardDeleteBook = async (id: string) => {
    try {
      await libraryService.hardDeleteBook(id);
      books.value = books.value.filter(b => b.id !== id);
    } catch (e) {
      console.error('Failed to hard delete book', e);
    }
  };

  return { 
    books, isLoading, isAdding, searchQuery, history, 
    loadBooks, addBook, addBookFromFile, updateBook, togglePin, updateOrder,
    softDeleteBook, restoreBook, hardDeleteBook
  };
});

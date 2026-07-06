import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Book } from '@/core/models/Database.types';
import { readerService } from '../services/ReaderService';

export const useReaderStore = defineStore('reader', () => {
  const currentBook = ref<Book | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const scale = ref(parseFloat(localStorage.getItem('reader_scale') || '0'));
  const isLoading = ref(false);
  const outline = ref<any[]>([]);
  
  const visitedPages = new Set<number>();
  let sessionStartTime = 0;
  let saveInterval: any = null;
  
  const saveReadingSession = async () => {
    if (!currentBook.value || sessionStartTime === 0) return;
    const now = Date.now();
    const durationSeconds = Math.floor((now - sessionStartTime) / 1000);
    const pagesRead = visitedPages.size;
    
    if (durationSeconds > 0 || pagesRead > 0) {
      await readerService.updateReadingHistory(currentBook.value.id, durationSeconds, pagesRead);
    }
    
    // Reset for next interval
    sessionStartTime = now;
    visitedPages.clear();
  };

  const setScale = (newScale: number) => {
    scale.value = newScale;
    localStorage.setItem('reader_scale', newScale.toString());
  };

  const loadBook = async (id: string) => {
    isLoading.value = true;
    try {
      const book = await readerService.getBookById(id);
      if (book) {
        currentBook.value = book;
        currentPage.value = book.current_page || 1;
      }
    } catch (e) {
      console.error('Failed to load book', e);
    } finally {
      isLoading.value = false;
    }
    sessionStartTime = Date.now();
    visitedPages.clear();
    visitedPages.add(currentPage.value);
    
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(saveReadingSession, 60000); // save every minute
  };

  const setTotalPages = (total: number) => {
    totalPages.value = total;
  };

  const setOutline = (newOutline: any[]) => {
    outline.value = newOutline;
  };

  const changePage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      visitedPages.add(page);
      if (currentBook.value) {
        // Save reading progress automatically to SQLite
        await readerService.updateCurrentPage(currentBook.value.id, page);
      }
    }
  };

  const zoomIn = () => {
    if (scale.value < 3.0) setScale(parseFloat((scale.value + 0.2).toFixed(1)));
  };

  const zoomOut = () => {
    if (scale.value > 0.5) setScale(parseFloat((scale.value - 0.2).toFixed(1)));
  };

  const reset = async () => {
    await saveReadingSession();
    if (saveInterval) clearInterval(saveInterval);
    sessionStartTime = 0;
    currentBook.value = null;
    currentPage.value = 1;
    totalPages.value = 0;
    // Don't reset scale, keep user's preference
    outline.value = [];
  };

  return { 
    currentBook, currentPage, totalPages, scale, isLoading, outline,
    loadBook, setTotalPages, setOutline, changePage, zoomIn, zoomOut, reset, setScale
  };
});

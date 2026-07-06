import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Annotation, Note } from '@/core/models/Database.types';
import { annotationService } from '../services/AnnotationService';

export type HistoryAction = 
  | { type: 'add_highlight', item: Annotation }
  | { type: 'remove_highlight', item: Annotation }
  | { type: 'add_note', item: Note }
  | { type: 'remove_note', item: Note };

export const useAnnotationStore = defineStore('annotation', () => {
  const annotations = ref<Annotation[]>([]);
  const notes = ref<Note[]>([]);
  const isLoading = ref(false);
  
  const history = ref<HistoryAction[]>([]);
  const historyIndex = ref(-1);

  const pushHistory = (action: HistoryAction) => {
    if (historyIndex.value < history.value.length - 1) {
      history.value.splice(historyIndex.value + 1);
    }
    history.value.push(action);
    historyIndex.value++;
  };

  const undo = async () => {
    if (historyIndex.value < 0) return;
    const action = history.value[historyIndex.value];
    
    if (action.type === 'add_highlight') {
      await annotationService.deleteAnnotation(action.item.id);
      annotations.value = annotations.value.filter(a => a.id !== action.item.id);
    } else if (action.type === 'remove_highlight') {
      const newAnn = await annotationService.addAnnotation(action.item);
      action.item = newAnn;
      annotations.value.push(newAnn);
    } else if (action.type === 'add_note') {
      await annotationService.deleteNote(action.item.id);
      notes.value = notes.value.filter(n => n.id !== action.item.id);
    } else if (action.type === 'remove_note') {
      const newNote = await annotationService.addNote(action.item);
      action.item = newNote;
      notes.value.push(newNote);
    }
    historyIndex.value--;
  };

  const redo = async () => {
    if (historyIndex.value >= history.value.length - 1) return;
    historyIndex.value++;
    const action = history.value[historyIndex.value];
    
    if (action.type === 'add_highlight') {
      const newAnn = await annotationService.addAnnotation(action.item);
      action.item = newAnn;
      annotations.value.push(newAnn);
    } else if (action.type === 'remove_highlight') {
      await annotationService.deleteAnnotation(action.item.id);
      annotations.value = annotations.value.filter(a => a.id !== action.item.id);
    } else if (action.type === 'add_note') {
      const newNote = await annotationService.addNote(action.item);
      action.item = newNote;
      notes.value.push(newNote);
    } else if (action.type === 'remove_note') {
      await annotationService.deleteNote(action.item.id);
      notes.value = notes.value.filter(n => n.id !== action.item.id);
    }
  };

  const loadForBook = async (bookId: string) => {
    isLoading.value = true;
    try {
      const [loadedAnnotations, loadedNotes] = await Promise.all([
        annotationService.getAnnotationsByBook(bookId),
        annotationService.getNotesByBook(bookId)
      ]);
      annotations.value = loadedAnnotations;
      notes.value = loadedNotes;
      history.value = [];
      historyIndex.value = -1;
    } catch (e) {
      console.error('Failed to load annotations and notes', e);
    } finally {
      isLoading.value = false;
    }
  };

  const getAnnotationsByPage = (page: number) => {
    return annotations.value.filter(a => a.page === page && a.type !== 'marker');
  };

  const getMarkerByPage = (page: number) => {
    return annotations.value.find(a => a.type === 'marker' && a.page === page);
  };
  
  const getMarker = () => {
    return annotations.value.find(a => a.type === 'marker');
  };

  const setMarker = async (bookId: string, page: number, positionData: string) => {
    try {
      const existingMarker = getMarker();
      if (existingMarker) {
        await annotationService.deleteAnnotation(existingMarker.id);
        annotations.value = annotations.value.filter(a => a.id !== existingMarker.id);
      }
      const newMarker = await annotationService.addAnnotation({
        book_id: bookId,
        type: 'marker',
        content: 'Reading Marker',
        page,
        position_data: positionData,
        color: 'marker'
      });
      annotations.value.push(newMarker);
    } catch (e) {
      console.error('Failed to set marker', e);
    }
  };

  const getNotesByPage = (page: number) => {
    return notes.value.filter(n => n.page === page);
  };

  const addHighlight = async (bookId: string, page: number, content: string, positionData: string, color: string) => {
    try {
      const newAnn = await annotationService.addAnnotation({
        book_id: bookId,
        type: 'highlight',
        content,
        page,
        position_data: positionData,
        color
      });
      annotations.value.push(newAnn);
      pushHistory({ type: 'add_highlight', item: newAnn });
    } catch (e) {
      console.error('Failed to add highlight', e);
    }
  };

  const removeAnnotation = async (id: string) => {
    try {
      const ann = annotations.value.find(a => a.id === id);
      await annotationService.deleteAnnotation(id);
      annotations.value = annotations.value.filter(a => a.id !== id);
      if (ann) pushHistory({ type: 'remove_highlight', item: ann });
    } catch (e) {
      console.error('Failed to remove annotation', e);
    }
  };

  const addNote = async (bookId: string, page: number, targetText: string, noteContent: string, positionData: string) => {
    try {
      const newNote = await annotationService.addNote({
        book_id: bookId,
        target_text: targetText,
        note_content: noteContent,
        page,
        position_data: positionData
      });
      notes.value.push(newNote);
      pushHistory({ type: 'add_note', item: newNote });
    } catch (e) {
      console.error('Failed to add note', e);
    }
  };

  const removeNote = async (id: string) => {
    try {
      const note = notes.value.find(n => n.id === id);
      await annotationService.deleteNote(id);
      notes.value = notes.value.filter(n => n.id !== id);
      if (note) pushHistory({ type: 'remove_note', item: note });
    } catch (e) {
      console.error('Failed to remove note', e);
    }
  };

  const clear = () => {
    annotations.value = [];
    notes.value = [];
    history.value = [];
    historyIndex.value = -1;
  };

  return {
    annotations,
    notes,
    isLoading,
    history,
    historyIndex,
    undo,
    redo,
    loadForBook,
    getAnnotationsByPage,
    getNotesByPage,
    getMarker,
    getMarkerByPage,
    setMarker,
    addHighlight,
    removeAnnotation,
    addNote,
    removeNote,
    clear
  };
});

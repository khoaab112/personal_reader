<template>
  <div class="annotation-sidebar">
    <div class="sidebar-header">
      <h3>Tools</h3>
      <button class="close-btn" @click="emit('close')" title="Hide Tools">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 18 6-6-6-6"/><path d="M19 12H5"/></svg>
      </button>
    </div>
    
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'outline' }"
        @click="activeTab = 'outline'"
      >
        Mục lục
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'highlights' }"
        @click="activeTab = 'highlights'"
      >
        Highlights
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'notes' }"
        @click="activeTab = 'notes'"
      >
        Notes
      </button>
    </div>

    <div class="list-container">
      <!-- Outline List -->
      <div v-if="activeTab === 'outline'" class="list outline-list">
        <div v-if="readerStore.outline.length === 0" class="empty-state">
          Không có mục lục.
        </div>
        <div 
          v-for="(item, index) in readerStore.outline" 
          :key="index"
          class="outline-item"
          @click="emit('jumpToDest', item.dest)"
        >
          <div class="outline-content">
            <span class="outline-title" :title="item.title">{{ item.title }}</span>
            <span v-if="item.pageNum" class="outline-page">{{ item.pageNum }}</span>
          </div>
          <div v-if="item.items && item.items.length > 0" class="sub-outline">
             <div 
               v-for="(subItem, subIndex) in item.items" 
               :key="subIndex"
               class="outline-item sub-item"
               @click.stop="emit('jumpToDest', subItem.dest)"
             >
               <div class="outline-content">
                 <span class="outline-title" :title="subItem.title">{{ subItem.title }}</span>
                 <span v-if="subItem.pageNum" class="outline-page">{{ subItem.pageNum }}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Highlights List -->
      <div v-if="activeTab === 'highlights'" class="list">
        <div v-if="annotations.length === 0" class="empty-state">
          No highlights yet.
        </div>
        <div 
          v-for="ann in annotations" 
          :key="ann.id"
          class="list-item"
          @click="emit('jumpToPage', ann.page)"
        >
          <div class="item-header">
            <span class="page-badge">Page {{ ann.page }}</span>
            <div class="color-dot" :class="['yellow', 'green', 'blue', 'red'].includes(ann.color) ? ann.color : ''" :style="['yellow', 'green', 'blue', 'red', 'bold', 'italic'].includes(ann.color) ? {} : { backgroundColor: ann.color }"></div>
            <button class="delete-btn" @click.stop="store.removeAnnotation(ann.id)">×</button>
          </div>
          <p class="item-content">{{ ann.content }}</p>
        </div>
      </div>

      <!-- Notes List -->
      <div v-if="activeTab === 'notes'" class="list">
        <div v-if="notes.length === 0" class="empty-state">
          No notes yet.
        </div>
        <div 
          v-for="note in notes" 
          :key="note.id"
          class="list-item"
          @click="emit('jumpToPage', note.page)"
        >
          <div class="item-header">
            <span class="page-badge">Page {{ note.page }}</span>
            <button class="delete-btn" @click.stop="store.removeNote(note.id)">×</button>
          </div>
          <p class="note-target">"{{ note.target_text }}"</p>
          <p class="note-content">{{ note.note_content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAnnotationStore } from '../store/annotationStore';
import { useReaderStore } from '../../Reader/store/readerStore';

const emit = defineEmits<{
  (e: 'jumpToPage', page: number): void;
  (e: 'jumpToDest', dest: any): void;
  (e: 'close'): void;
}>();

const store = useAnnotationStore();
const readerStore = useReaderStore();
const activeTab = ref<'outline' | 'highlights' | 'notes'>('outline');

// Sort by page number
const annotations = computed(() => {
  return [...store.annotations].sort((a, b) => a.page - b.page);
});

const notes = computed(() => {
  return [...store.notes].sort((a, b) => a.page - b.page);
});
</script>

<style scoped>
.annotation-sidebar {
  width: 300px;
  background: var(--n-color);
  border-left: 1px solid var(--n-border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--n-border-color, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--n-border-color, #f3f4f6);
  color: var(--n-text-color);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--n-border-color, #e5e7eb);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--n-text-color);
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  opacity: 0.8;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  opacity: 1;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  padding: 12px;
  background: var(--n-card-color, #f9fafb);
  border: 1px solid var(--n-border-color, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.list-item:hover {
  border-color: var(--n-border-hover-color, #d1d5db);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.page-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--n-text-color);
  background: var(--n-border-color, #e5e7eb);
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: auto;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}

.color-dot.yellow { background: #fef08a; }
.color-dot.green { background: #bbf7d0; }
.color-dot.blue { background: #bfdbfe; }
.color-dot.red { background: #fecaca; }

.delete-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
  cursor: pointer;
}

.delete-btn:hover {
  color: #ef4444;
}

.item-content {
  margin: 0;
  font-size: 13px;
  color: var(--n-text-color);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-target {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: var(--n-text-color);
  opacity: 0.7;
  font-style: italic;
  padding-left: 8px;
  border-left: 2px solid var(--n-border-color, #e5e7eb);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.note-content {
  margin: 0;
  font-size: 13px;
  color: var(--n-text-color);
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.empty-state {
  text-align: center;
  color: var(--n-text-color);
  opacity: 0.6;
  font-size: 14px;
  padding: 24px 0;
}

.outline-item {
  padding: 2px 8px;
  font-size: 14px;
  color: var(--n-text-color);
  cursor: pointer;
  border-radius: 0px;
  transition: background 0.2s;
}

.outline-item:hover {
  background: var(--n-border-color, #f3f4f6);
  color: #2563eb;
}

.outline-content {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.outline-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.outline-page {
  font-size: 12px;
  color: var(--n-text-color);
  opacity: 0.6;
}

.sub-outline {
  margin-top: 0px;
  padding-left: 12px;
  border-left: 1px solid var(--n-border-color, #e5e7eb);
}

.sub-item {
  font-size: 13px;
  color: var(--n-text-color);
  opacity: 0.8;
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>

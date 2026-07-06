<template>
  <div class="book-card" @click="openBook">
    <div class="cover" :style="book.cover_image ? { backgroundImage: `url(${book.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
      <span v-if="!book.cover_image" class="extension">{{ book.file_type.toUpperCase() }}</span>
      <div class="card-actions" @click.stop>
        <button class="action-btn" :class="{ 'pinned': book.is_pinned }" @click.stop="emit('toggle-pin', book)">
          <span class="icon">📌</span>
        </button>
        <button class="action-btn edit-btn" @click.stop="emit('edit-book', book)">
          <span class="icon">✏️</span>
        </button>
        <button class="action-btn delete-btn" @click.stop="emit('delete-book', book)">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>
    <div class="info">
      <div class="title" :title="book.title">{{ book.title }}</div>
      <div class="author" v-if="book.author">{{ book.author }}</div>
      <div class="meta">
        <span class="progress" v-if="book.total_pages > 0">
          {{ Math.round((book.current_page / book.total_pages) * 100) }}%
        </span>
        <span class="progress" v-else>Mới thêm</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Book } from '@/core/models/Database.types';

const props = defineProps<{
  book: Book;
}>();

const emit = defineEmits<{
  (e: 'toggle-pin', book: Book): void;
  (e: 'edit-book', book: Book): void;
  (e: 'delete-book', book: Book): void;
}>();

const router = useRouter();

const openBook = () => {
  router.push({ name: 'Reader', params: { id: props.book.id } });
};
</script>

<style scoped>
.book-card {
  border: 1px solid var(--n-border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: var(--n-card-color, white);
  display: flex;
  flex-direction: column;
  position: relative;
}
.book-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
.cover {
  height: 220px;
  background: linear-gradient(135deg, var(--n-border-color, #f3f4f6) 0%, var(--n-color, #e5e7eb) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 700;
  font-size: 28px;
  border-bottom: 1px solid var(--n-border-color, #f3f4f6);
  position: relative;
}
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.book-card:hover .card-actions,
.card-actions:has(.pinned) {
  opacity: 1;
}
.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 14px;
}
.action-btn:hover {
  background: #fff;
}
.action-btn.pinned {
  background: #fef08a;
}
.info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.title {
  font-weight: 600;
  font-size: 14px;
  color: var(--n-text-color, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.author {
  font-size: 13px;
  color: var(--n-text-color, #6b7280);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: -4px;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress {
  font-size: 12px;
  color: var(--n-text-color, #6b7280);
  opacity: 0.8;
}
</style>

<template>
  <div class="reports-content p-10 max-w-7xl mx-auto">
    <div class="header mb-10">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Báo cáo</h1>
      <p class="text-gray-500 mt-2">Tổng quan quá trình đọc sách của bạn.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stat-card border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div class="text-sm font-medium text-gray-500 mb-1">Thời gian đọc</div>
        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ formatDuration(totalSeconds) }}</div>
      </div>
      
      <div class="stat-card border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div class="text-sm font-medium text-gray-500 mb-1">Số sách đã đọc</div>
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ totalBooksRead }}</div>
      </div>
      
      <div class="stat-card border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div class="text-sm font-medium text-gray-500 mb-1">Số trang đã đọc</div>
        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ totalPagesRead }}</div>
      </div>
      
      <div class="stat-card border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div class="text-sm font-medium text-gray-500 mb-1">TB mỗi ngày</div>
        <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ formatDuration(avgSecondsPerDay) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLibraryStore } from '../store/libraryStore';

const libraryStore = useLibraryStore();

const totalSeconds = computed(() => {
  return libraryStore.history.reduce((sum, item) => sum + (item.duration_seconds || 0), 0);
});

const totalBooksRead = computed(() => {
  const books = new Set();
  libraryStore.history.forEach(item => {
    if (item.pages_read > 0) books.add(item.book_id);
  });
  return books.size;
});

const totalPagesRead = computed(() => {
  return libraryStore.history.reduce((sum, item) => sum + (item.pages_read || 0), 0);
});

const avgSecondsPerDay = computed(() => {
  const days = new Set();
  libraryStore.history.forEach(item => days.add(item.read_date));
  if (days.size === 0) return 0;
  return Math.floor(totalSeconds.value / days.size);
});

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};
</script>

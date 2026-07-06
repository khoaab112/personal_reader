<template>
  <div class="history-content p-10 max-w-7xl mx-auto">
    <div class="header mb-10">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Lịch sử đọc</h1>
      <p class="text-gray-500 mt-2">Hoạt động trong 7 ngày qua.</p>
    </div>

    <div v-if="recentHistory.length === 0" class="flex justify-center items-center h-[50vh]">
      <n-empty description="Không có lịch sử đọc trong 7 ngày qua." />
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="item in recentHistory" 
        :key="item.id"
        class="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 flex justify-between items-center"
      >
        <div class="info">
          <div class="font-medium text-gray-800 dark:text-gray-200 text-lg">{{ item.book_title }}</div>
          <div class="text-sm text-gray-500 mt-1">Ngày: {{ formatDate(item.read_date) }}</div>
        </div>
        <div class="stats flex gap-8 text-right">
          <div>
            <div class="text-xs text-gray-500 uppercase">Thời gian đọc</div>
            <div class="font-semibold text-blue-600 dark:text-blue-400">{{ formatDuration(item.duration_seconds) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase">Số trang</div>
            <div class="font-semibold text-purple-600 dark:text-purple-400">{{ item.pages_read }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NEmpty } from 'naive-ui';
import { useLibraryStore } from '../store/libraryStore';

const libraryStore = useLibraryStore();

const recentHistory = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return libraryStore.history.filter(item => {
    const readDate = new Date(item.read_date);
    return readDate >= sevenDaysAgo;
  });
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

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

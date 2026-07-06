<template>
  <div class="trash-content p-10 max-w-7xl mx-auto">
    <div class="header mb-10">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Sách đã xóa</h1>
      <p class="text-gray-500 mt-2">Sách trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.</p>
    </div>
    
    <div v-if="deletedBooks.length === 0" class="flex justify-center items-center h-[50vh]">
      <n-empty description="Thùng rác trống." />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="book in deletedBooks" 
        :key="book.id" 
        class="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 flex justify-between items-center"
      >
        <div class="info overflow-hidden">
          <div class="font-medium text-gray-800 dark:text-gray-200 truncate" :title="book.title">{{ book.title }}</div>
          <div class="text-sm text-gray-500 mt-1">Xóa: {{ formatDate(book.deleted_at) }}</div>
          <div class="text-xs text-red-500 mt-1">{{ getDaysLeft(book.deleted_at) }} ngày nữa sẽ bị xóa</div>
        </div>
        <div class="actions flex gap-2 ml-4">
          <n-button size="small" type="primary" @click="handleRestore(book.id)">Khôi phục</n-button>
          <n-button size="small" type="error" @click="handleHardDelete(book.id)">Xóa hẳn</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NButton, NEmpty, useDialog, useMessage } from 'naive-ui';
import { useLibraryStore } from '../store/libraryStore';

const libraryStore = useLibraryStore();
const dialog = useDialog();
const message = useMessage();

const deletedBooks = computed(() => {
  return libraryStore.books.filter(b => b.deleted_at);
});

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getDaysLeft = (deletedAt?: string | null) => {
  if (!deletedAt) return 0;
  const deletedDate = new Date(deletedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
};

const handleRestore = async (id: string) => {
  await libraryStore.restoreBook(id);
  message.success('Đã khôi phục sách');
};

const handleHardDelete = async (id: string) => {
  dialog.warning({
    title: 'Xóa vĩnh viễn',
    content: 'Bạn có chắc chắn muốn xóa vĩnh viễn cuốn sách này? Hành động này không thể hoàn tác.',
    positiveText: 'Xóa',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      await libraryStore.hardDeleteBook(id);
      message.success('Đã xóa vĩnh viễn');
    }
  });
};
</script>

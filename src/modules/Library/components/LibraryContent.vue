<template>
  <div class="library-content p-10 max-w-7xl mx-auto">
    <div class="header flex justify-between items-center mb-10">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Thư viện của tôi</h1>
      <div class="actions flex items-center gap-3">
        <n-input 
          v-model:value="libraryStore.searchQuery" 
          placeholder="Tìm kiếm sách..." 
          class="w-64"
          clearable
        />
        
      </div>
    </div>

    <!-- Upload Area -->
    <div class="mb-10">
      <n-upload
        multiple
        directory-dnd
        accept=".pdf"
        :show-file-list="false"
        @before-upload="handleBeforeUpload"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5l5 5h-3z"/>
              </svg>
            </n-icon>
          </div>
          <n-text style="font-size: 16px; color: #6b7280;">
            Kéo, thả hoặc <span style="color: #3b82f6;">click để thêm file</span>
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </div>
    <div v-if="libraryStore.isLoading" class="state-container flex justify-center items-center h-[50vh]">
      <n-spin size="large" />
    </div>
    
    <div v-else-if="filteredBooks.length === 0 && !libraryStore.isLoading" class="state-container flex justify-center items-center h-[50vh]">
      <n-empty description="Không tìm thấy sách nào." />
    </div>

    <div v-else class="book-grid-container">
      <draggable 
        v-model="draggableBooks" 
        item-key="id"
        class="book-grid grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8"
        handle=".book-card"
        :animation="200"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <book-card 
            :book="element" 
            @toggle-pin="handleTogglePin"
            @edit-book="handleEditBook"
            @delete-book="handleDeleteBook"
          />
        </template>
      </draggable>
    </div>

    <BookEditModal 
      ref="editModalRef"
      :book="selectedBook"
      v-model:show="showEditModal"
      @save="handleSaveBook"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { NButton, NSpin, NEmpty, NInput, NUpload, NUploadDragger, NIcon, NText, useMessage, useDialog } from 'naive-ui';
import draggable from 'vuedraggable';
import { useLibraryStore } from '../store/libraryStore';
import BookCard from './BookCard.vue';
import BookEditModal from './BookEditModal.vue';
import type { Book } from '@/core/models/Database.types';

const libraryStore = useLibraryStore();
const message = useMessage();
const dialog = useDialog();
const showEditModal = ref(false);
const selectedBook = ref<Book | null>(null);
const editModalRef = ref<any>(null);
const draggableBooks = ref<Book[]>([]);

const filteredBooks = computed(() => {
  const query = libraryStore.searchQuery.toLowerCase();
  return libraryStore.books.filter(b => 
    !b.deleted_at && // exclude deleted books
    (b.title.toLowerCase().includes(query) || 
    (b.author && b.author.toLowerCase().includes(query)))
  );
});

// Update draggable list when books change, if not actively dragging/searching
watch(filteredBooks, (newBooks) => {
  draggableBooks.value = [...newBooks];
}, { immediate: true });

const handleBeforeUpload = async (data: { file: any }) => {
  const file = data.file.file as File;
  if (file) {
    const validExtensions = ['.pdf'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      message.error('File không hợp lệ. Vui lòng chọn file .pdf');
      return false;
    }

    const newBook = await libraryStore.addBookFromFile(file);
    if (newBook) {
      message.success('Đã thêm sách thành công!');
      selectedBook.value = newBook;
      showEditModal.value = true;
    } else {
      message.error('Lỗi khi thêm sách.');
    }
  }
  return false; // Prevent default upload behavior
};

const handleAddBook = async () => {
  const newBook = await libraryStore.addBook();
  if (newBook) {
    selectedBook.value = newBook;
    showEditModal.value = true;
  }
};

const handleTogglePin = (book: Book) => {
  libraryStore.togglePin(book);
};

const handleDeleteBook = async (book: Book) => {
  dialog.warning({
    title: 'Xác nhận xóa',
    content: `Bạn có chắc muốn xóa cuốn "${book.title}" vào thùng rác?`,
    positiveText: 'Xóa',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      await libraryStore.softDeleteBook(book.id);
      message.success('Đã chuyển sách vào thùng rác');
    }
  });
};

const handleEditBook = (book: Book) => {
  selectedBook.value = book;
  showEditModal.value = true;
};

const handleSaveBook = async (updatedBook: Book) => {
  await libraryStore.updateBook(updatedBook);
};

const onDragEnd = () => {
  // Only update order if not filtering
  if (!libraryStore.searchQuery) {
    libraryStore.updateOrder(draggableBooks.value);
  }
};
</script>

<template>
  <div class="reader-layout">
    <div class="toolbar">
      <div class="left">
        <n-button @click="goBack" type="default" secondary>
          <template #icon>
            <span>←</span>
          </template>
          Thư viện
        </n-button>
        <span class="title" v-if="readerStore.currentBook">{{ readerStore.currentBook.title }}</span>
      </div>
      
      <div class="center" v-if="readerStore.totalPages > 0">
        <n-button @click="readerStore.changePage(readerStore.currentPage - 1)" :disabled="readerStore.currentPage <= 1">
          Trước
        </n-button>
        <span class="page-info">Trang {{ readerStore.currentPage }} / {{ readerStore.totalPages }}</span>
        <n-button @click="readerStore.changePage(readerStore.currentPage + 1)" :disabled="readerStore.currentPage >= readerStore.totalPages">
          Sau
        </n-button>
      </div>

      <div class="right">
        <n-button @click="handleCaptureCover" :loading="isCapturing" title="Cắt trang hiện tại làm ảnh bìa" class="mr-2">
          ✂️ Ảnh bìa
        </n-button>
        <n-button-group>
          <n-button @click="readerStore.zoomOut()">
            <template #icon><span>−</span></template>
          </n-button>
          <n-button @click="readerStore.setScale(1.0)" style="width: 70px;">
            {{ Math.round((readerStore.scale || 1.0) * 100) }}%
          </n-button>
          <n-button @click="readerStore.zoomIn()">
            <template #icon><span>+</span></template>
          </n-button>
        </n-button-group>
      </div>
    </div>

    <div class="main-body" v-if="!readerStore.isLoading && fileUrl">
      <div class="content">
        <PDFViewer 
          ref="pdfViewerRef"
          v-if="readerStore.currentBook?.file_type === 'pdf'"
          :file-url="fileUrl"
          :page="readerStore.currentPage"
          :scale="readerStore.scale"
          :book-id="readerStore.currentBook.id"
          @loaded="handlePdfLoaded"
          @add-note="handleOpenNoteDialog"
          @outline-loaded="handleOutlineLoaded"
          @page-rendered="handlePageRendered"
        />
        <div v-else class="not-supported">
          Định dạng {{ readerStore.currentBook?.file_type }} chưa được hỗ trợ trong bản preview.
        </div>
      </div>
      <AnnotationSidebar 
        v-if="showSidebar"
        @jump-to-page="(p) => readerStore.changePage(p)"
        @jump-to-dest="handleJumpToDest"
        @close="showSidebar = false"
      />
    </div>
    
    <!-- Floating Show Tools Button when sidebar is hidden -->
    <div class="toggle-sidebar-btn" v-if="!showSidebar" @click="showSidebar = true" title="Hiện Tools">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </div>

    <NoteDialog 
      v-model:visible="isNoteDialogOpen"
      :target-text="noteTargetText"
      @save="handleSaveNote"
    />

    <!-- Edit Mode Toggle & Tools -->
    <div class="edit-tools" v-if="isEditMode">
      <div class="tool-btn" @click="annotationStore.undo()" :class="{ disabled: annotationStore.historyIndex < 0 }" title="Hoàn tác (Undo)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </div>
      <div class="tool-btn" @click="annotationStore.redo()" :class="{ disabled: annotationStore.historyIndex >= annotationStore.history.length - 1 }" title="Làm lại (Redo)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
      </div>
    </div>
    
    <div class="toggle-edit-btn" :class="{ active: isEditMode }" @click="isEditMode = !isEditMode" title="Bật/Tắt Lịch sử thao tác">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
    </div>

    <!-- Help Button -->
    <div class="help-btn" @click="showHelp = true" title="Phím tắt">
      <span>?</span>
    </div>

    <n-modal v-model:show="showHelp" preset="dialog" title="Phím tắt">
      <ul class="shortcuts-list mt-4">
        <li><strong>Ctrl/Cmd +</strong> : Phóng to</li>
        <li><strong>Ctrl/Cmd -</strong> : Thu nhỏ</li>
        <li><strong>Ctrl/Cmd 0</strong> : Đặt lại tỷ lệ 100%</li>
        <li><strong>Phím mũi tên Trái / Phải</strong> : Chuyển trang</li>
      </ul>
      <template #action>
        <n-button @click="showHelp = false">Đóng</n-button>
      </template>
    </n-modal>
    
    <CropperModal 
      v-model:visible="showCropper" 
      :image-url="cropImageUrl" 
      @save="handleSaveCover" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NButtonGroup, NModal, useMessage } from 'naive-ui';
import { useReaderStore } from '../store/readerStore';
import { useLibraryStore } from '../../Library/store/libraryStore';
import { useAnnotationStore } from '../../Annotation/store/annotationStore';
import PDFViewer from '../components/PDFViewer.vue';
import AnnotationSidebar from '../../Annotation/components/AnnotationSidebar.vue';
import NoteDialog from '../../Annotation/components/NoteDialog.vue';
import CropperModal from '@/components/CropperModal.vue';
import { getFileFromSandbox } from '@/core/utils/sandboxFileStore';
import { generatePDFCover } from '@/core/utils/pdfHelpers';

const route = useRoute();
const router = useRouter();
const readerStore = useReaderStore();
const libraryStore = useLibraryStore();
const annotationStore = useAnnotationStore();
const message = useMessage();

const pdfViewerRef = ref<any>(null);

const isNoteDialogOpen = ref(false);
const noteTargetText = ref('');
const notePositionData = ref('');
const showHelp = ref(false);
const showSidebar = ref(true);
const isEditMode = ref(false);
const fileUrl = ref('');

const showCropper = ref(false);
const cropImageUrl = ref('');
const isCapturing = ref(false);

const handleCaptureCover = async () => {
  if (!fileUrl.value) return;
  isCapturing.value = true;
  try {
    const dataUrl = await generatePDFCover(fileUrl.value, readerStore.currentPage);
    if (dataUrl) {
      cropImageUrl.value = dataUrl;
      showCropper.value = true;
    } else {
      message.error('Không thể tải trang');
    }
  } catch (error) {
    console.error(error);
    message.error('Lỗi khi tải trang');
  } finally {
    isCapturing.value = false;
  }
};

const handleSaveCover = async (base64: string) => {
  if (readerStore.currentBook) {
    const updatedBook = { ...readerStore.currentBook, cover_image: base64 };
    await libraryStore.updateBook(updatedBook);
    readerStore.currentBook = updatedBook;
    message.success('Đã cập nhật ảnh bìa');
  }
};

const handlePageRendered = (unscaledHeight: number) => {
  if (readerStore.scale === 0) {
    // 64 for toolbar, 40 for padding (20px top and bottom)
    const containerHeight = window.innerHeight - 64 - 40; 
    let fitScale = containerHeight / unscaledHeight;
    fitScale = Math.max(0.5, Math.min(3.0, fitScale));
    readerStore.setScale(parseFloat(fitScale.toFixed(1)));
  }
};

watch(() => readerStore.currentBook, async (book) => {
  if (!book) {
    fileUrl.value = '';
    return;
  }
  const path = book.file_path;
  if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
    fileUrl.value = `asset://${path}`;
  } else {
    // Attempt to load from sandbox
    try {
      const file = await getFileFromSandbox(path);
      if (file) {
        if (fileUrl.value && fileUrl.value.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl.value);
        }
        fileUrl.value = URL.createObjectURL(file);
        return;
      }
    } catch (e) {
      console.error('Error fetching file from sandbox', e);
    }
    // Fallback
    fileUrl.value = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
  }
}, { immediate: true });

const handleOpenNoteDialog = (text: string, pos: string) => {
  noteTargetText.value = text;
  notePositionData.value = pos;
  isNoteDialogOpen.value = true;
};

const handleSaveNote = async (text: string) => {
  if (readerStore.currentBook) {
    await annotationStore.addNote(
      readerStore.currentBook.id,
      readerStore.currentPage,
      noteTargetText.value,
      text,
      notePositionData.value
    );
  }
};

const handleOutlineLoaded = (outline: any[]) => {
  readerStore.setOutline(outline);
};

const handleJumpToDest = async (dest: any) => {
  if (pdfViewerRef.value) {
    const pageNum = await pdfViewerRef.value.resolveDestination(dest);
    if (pageNum) {
      readerStore.changePage(pageNum);
    }
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      readerStore.zoomIn();
    } else if (e.key === '-') {
      e.preventDefault();
      readerStore.zoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      readerStore.setScale(1.0);
    }
  } else {
    // Left / Right arrow keys for page navigation
    if (e.key === 'ArrowLeft') {
      readerStore.changePage(readerStore.currentPage - 1);
    } else if (e.key === 'ArrowRight') {
      readerStore.changePage(readerStore.currentPage + 1);
    }
  }
};

onMounted(() => {
  const bookId = route.params.id as string;
  if (bookId) {
    readerStore.loadBook(bookId);
  }
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  readerStore.reset();
  window.removeEventListener('keydown', handleKeyDown);
});

const goBack = () => {
  router.push({ name: 'Library' });
};

const handlePdfLoaded = (totalPages: number) => {
  readerStore.setTotalPages(totalPages);
};
</script>

<style scoped>
.reader-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--n-color, #ffffff);
  border-bottom: 1px solid var(--n-border-color, #e5e7eb);
  height: 64px;
}
.left, .center, .right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.title {
  font-weight: 600;
  color: var(--n-text-color, #374151);
  margin-left: 16px;
  border-left: 1px solid var(--n-border-color, #e5e7eb);
  padding-left: 16px;
}
.page-info {
  font-size: 14px;
  color: var(--n-text-color, #4b5563);
  min-width: 80px;
  text-align: center;
}
.main-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}
.content {
  flex: 1;
  overflow: hidden;
}
.not-supported {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--n-text-color, #6b7280);
  background: var(--n-color, #f9fafb);
}

.toggle-sidebar-btn {
  position: fixed;
  top: 80px;
  right: 0;
  width: 36px;
  height: 48px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
  color: #4b5563;
  z-index: 90;
  transition: all 0.2s;
}

.toggle-sidebar-btn:hover {
  background-color: #f9fafb;
  width: 40px;
  color: #2563eb;
}

.help-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
  transition: transform 0.2s, background-color 0.2s;
}

.help-btn:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}


.toggle-edit-btn { position: fixed; bottom: 80px; right: 24px; width: 44px; height: 44px; border-radius: 50%; background-color: white; color: #4b5563; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); z-index: 100; border: 1px solid #e5e7eb; transition: all 0.2s; }
.toggle-edit-btn:hover { background-color: #f3f4f6; transform: scale(1.05); }
.toggle-edit-btn.active { background-color: #10b981; color: white; border-color: #10b981; }
.edit-tools { position: fixed; bottom: 136px; right: 24px; display: flex; flex-direction: column; gap: 12px; z-index: 100; }
.tool-btn { width: 44px; height: 44px; border-radius: 50%; background-color: white; color: #374151; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; transition: all 0.2s; }
.tool-btn:hover:not(.disabled) { background-color: #f3f4f6; transform: scale(1.05); }
.tool-btn.disabled { opacity: 0.5; cursor: not-allowed; }
.shortcuts-list {
  padding-left: 20px;
  line-height: 2;
  color: var(--n-text-color);
}
</style>

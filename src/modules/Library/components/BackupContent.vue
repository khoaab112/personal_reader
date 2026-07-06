<template>
  <div class="backup-content p-10 max-w-7xl mx-auto">
    <div class="header mb-10">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Sao lưu & Phục hồi</h1>
      <p class="text-gray-500 mt-2">Bảo vệ dữ liệu đọc sách của bạn.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Storage Usage -->
      <div class="border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Dung lượng sử dụng</h2>
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
          </div>
          <div>
            <div class="text-sm text-gray-500">Tổng dữ liệu ứng dụng</div>
            <div class="text-3xl font-bold">{{ formatBytes(storageUsage) }}</div>
          </div>
        </div>
        <p class="text-sm text-gray-500">Bao gồm sách, lịch sử đọc, ghi chú, và đánh dấu.</p>
      </div>

      <!-- Backup Actions -->
      <div class="border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tạo bản sao lưu</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Tải xuống toàn bộ dữ liệu của bạn dưới dạng tệp JSON. Bạn có thể sử dụng tệp này để khôi phục dữ liệu sau này.
        </p>
        <n-button type="primary" size="large" @click="handleExport" :loading="isExporting">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </template>
          Tải file Backup
        </n-button>
        
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Phục hồi dữ liệu</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tải lên tệp JSON sao lưu trước đó để khôi phục. <strong>Lưu ý: Dữ liệu hiện tại sẽ bị ghi đè.</strong>
          </p>
          
          <n-upload
            accept=".json"
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
          
          <div class="mt-4 flex items-center gap-4" v-if="selectedFile">
            <span class="text-sm text-gray-500">{{ selectedFile.name }}</span>
            <n-button type="warning" @click="handleRestore" :loading="isRestoring">
              Xác nhận Phục hồi
            </n-button>
          </div>

        </div>

        <!-- Danger Zone -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Xóa dữ liệu</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Xóa toàn bộ dữ liệu hiện hành bao gồm sách, lịch sử, ghi chú. <strong>Hành động này không thể hoàn tác.</strong>
          </p>
          <n-button type="error" @click="handleClearData" :loading="isClearing">
            Xóa toàn bộ dữ liệu
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NButton, NUpload, NUploadDragger, NIcon, NText, useMessage, useDialog } from 'naive-ui';
import { dbService } from '@/core/database/DatabaseService';

const message = useMessage();
const dialog = useDialog();
const storageUsage = ref(0);
const isExporting = ref(false);
const isRestoring = ref(false);
const isClearing = ref(false);
const selectedFile = ref<File | null>(null);

onMounted(async () => {
  storageUsage.value = await dbService.getStorageUsage();
});

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const handleExport = async () => {
  isExporting.value = true;
  try {
    const data = await dbService.exportBackup();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_reader_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export failed', e);
    message.error('Xuất dữ liệu thất bại.');
  } finally {
    isExporting.value = false;
  }
};

const handleBeforeUpload = (data: { file: any }) => {
  const file = data.file.file as File;
  if (file) {
    if (!file.name.toLowerCase().endsWith('.json')) {
      message.error('File không hợp lệ. Vui lòng chọn file .json');
      return false;
    }
    selectedFile.value = file;
  }
  return false; // Prevent default upload
};



const handleRestore = async () => {
  if (!selectedFile.value) return;
  
  dialog.warning({
    title: 'Phục hồi dữ liệu',
    content: 'Dữ liệu hiện tại sẽ bị xóa và ghi đè bằng dữ liệu từ bản sao lưu. Bạn có chắc chắn muốn tiếp tục?',
    positiveText: 'Tiếp tục',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      isRestoring.value = true;
      try {
        const text = await selectedFile.value!.text();
        const data = JSON.parse(text);
        await dbService.restoreBackup(data);
        message.success('Khôi phục dữ liệu thành công! Ứng dụng sẽ tải lại.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (e) {
        console.error('Restore failed', e);
        message.error('Khôi phục dữ liệu thất bại. File không hợp lệ hoặc lỗi hệ thống.');
      } finally {
        isRestoring.value = false;
      }
    }
  });
};

const handleClearData = async () => {
  dialog.error({
    title: 'Xóa toàn bộ dữ liệu',
    content: 'Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu không? Hành động này KHÔNG THỂ hoàn tác!',
    positiveText: 'Xóa',
    negativeText: 'Hủy',
    onPositiveClick: async () => {
      isClearing.value = true;
      try {
        await dbService.clearAllData();
        message.success('Đã xóa toàn bộ dữ liệu!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        console.error('Clear data failed', e);
        message.error('Lỗi khi xóa dữ liệu.');
      } finally {
        isClearing.value = false;
      }
    }
  });
};
</script>

<template>
  <n-modal v-model:show="show" preset="dialog" title="Chỉnh sửa thông tin sách" style="width: 500px">
    <div class="edit-form mt-4">
      <n-form :model="formValue" label-placement="top">
        <n-form-item label="Tên sách">
          <n-input v-model:value="formValue.title" placeholder="Nhập tên sách" />
        </n-form-item>
        <n-form-item label="Tác giả">
          <n-input v-model:value="formValue.author" placeholder="Nhập tác giả" />
        </n-form-item>
        <n-form-item label="Thể loại">
          <n-input v-model:value="formValue.genre" placeholder="Nhập thể loại" />
        </n-form-item>
        <n-form-item label="Năm xuất bản">
          <n-input v-model:value="formValue.published_year" placeholder="Nhập năm xuất bản" />
        </n-form-item>
        <n-form-item label="Mô tả">
          <n-input type="textarea" v-model:value="formValue.description" placeholder="Nhập mô tả" />
        </n-form-item>
        <n-form-item label="Nguồn ảnh bìa">
          <n-radio-group v-model:value="coverMode">
            <n-radio-button value="url">URL</n-radio-button>
            <n-radio-button value="upload">Chọn ảnh</n-radio-button>
            <n-radio-button value="extract">Lấy trong sách</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item v-if="coverMode === 'url'" label="URL ảnh bìa">
          <n-input v-model:value="formValue.cover_image" placeholder="Nhập URL hoặc Base64 ảnh bìa" />
        </n-form-item>

        <n-form-item v-if="coverMode === 'upload'" label="Tải ảnh lên">
          <div class="cover-upload-container">
            <input type="file" accept="image/*" class="hidden-file-input" ref="fileInputRef" @change="handleImageUpload" />
            <n-button @click="triggerFileInput" type="primary">Chọn ảnh từ máy</n-button>
          </div>
        </n-form-item>

        <n-form-item v-if="coverMode === 'extract'" label="Trích xuất từ sách">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex gap-2 items-center" style="display: flex; align-items: center; gap: 8px;">
              <span>Trang: </span>
              <n-input-number v-model:value="extractPage" :min="1" placeholder="Trang" style="width: 120px" />
              <n-button @click="handleExtractCover" :loading="isExtracting" type="primary">Lấy ảnh</n-button>
            </div>
            <div v-if="formValue.cover_image && formValue.cover_image.length < 500" class="mt-2 text-xs text-gray-500">
              *Ảnh hiện tại không phải là ảnh trích xuất
            </div>
          </div>
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <div class="actions">
        <n-button @click="show = false">Hủy</n-button>
        <n-button type="primary" @click="handleSave">Lưu</n-button>
      </div>
    </template>
  </n-modal>

  <CropperModal 
    v-model:visible="showCropper" 
    :image-url="cropImageUrl" 
    @save="handleSaveCroppedCover" 
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { NModal, NForm, NFormItem, NInput, NInputNumber, NButton, NRadioGroup, NRadioButton, useMessage } from 'naive-ui';
import type { Book } from '@/core/models/Database.types';
import CropperModal from '@/components/CropperModal.vue';
import { getFileFromSandbox } from '@/core/utils/sandboxFileStore';
import { generatePDFCover } from '@/core/utils/pdfHelpers';

const props = defineProps<{
  book: Book | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'save', book: Book): void;
}>();

const message = useMessage();
const show = ref(false);
const formValue = ref<Partial<Book>>({});
const fileInputRef = ref<HTMLInputElement | null>(null);

const coverMode = ref('url');
const extractPage = ref(1);
const isExtracting = ref(false);

const showCropper = ref(false);
const cropImageUrl = ref('');

watch(() => props.book, (newBook) => {
  if (newBook) {
    formValue.value = { ...newBook };
    show.value = true;
  }
});

watch(show, (val) => {
  emit('update:show', val);
  if (!val && !props.book) {
    formValue.value = {};
  }
});

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) { // Limit 2MB
    message.error('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      formValue.value.cover_image = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

const handleExtractCover = async () => {
  if (!props.book?.file_path) {
    message.error('Sách không có đường dẫn tệp.');
    return;
  }
  
  isExtracting.value = true;
  try {
    const file = await getFileFromSandbox(props.book.file_path);
    if (!file) {
      message.error('Không tìm thấy tệp sách trong sandbox.');
      isExtracting.value = false;
      return;
    }
    
    const fileUrl = URL.createObjectURL(file);
    const dataUrl = await generatePDFCover(fileUrl, extractPage.value);
    
    URL.revokeObjectURL(fileUrl);
    
    if (dataUrl) {
      cropImageUrl.value = dataUrl;
      showCropper.value = true;
    } else {
      message.error(`Không thể tải trang ${extractPage.value}`);
    }
  } catch (error) {
    console.error('Lỗi khi tải trang:', error);
    message.error('Đã xảy ra lỗi khi tải trang.');
  } finally {
    isExtracting.value = false;
  }
};

const handleSaveCroppedCover = (base64: string) => {
  formValue.value.cover_image = base64;
  message.success('Đã lưu ảnh trích xuất thành công');
};

const handleSave = () => {
  if (props.book && formValue.value.title) {
    emit('save', formValue.value as Book);
    show.value = false;
  }
};

defineExpose({
  open: (book: Book) => {
    formValue.value = { ...book };
    show.value = true;
  }
});
</script>

<style scoped>
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
.cover-upload-container {
  display: flex;
  align-items: center;
  width: 100%;
}
.hidden-file-input {
  display: none;
}
.ml-2 {
  margin-left: 8px;
}
</style>

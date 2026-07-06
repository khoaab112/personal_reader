<template>
  <n-modal v-model:show="show" preset="card" title="Cắt ảnh bìa" style="width: 800px; max-width: 90vw;">
    <div class="cropper-container">
      <img ref="imgRef" :src="imageUrl" style="max-width: 100%; display: block;" />
    </div>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <n-button @click="show = false">Hủy</n-button>
        <n-button type="primary" @click="handleSave">Lưu ảnh bìa</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { NModal, NButton } from 'naive-ui';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps<{
  visible: boolean;
  imageUrl: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'save', croppedBase64: string): void;
}>();

const show = ref(props.visible);
const imgRef = ref<HTMLImageElement | null>(null);
let cropper: Cropper | null = null;

watch(() => props.visible, (val) => {
  show.value = val;
  if (val) {
    nextTick(() => {
      initCropper();
    });
  } else {
    destroyCropper();
  }
});

watch(show, (val) => {
  emit('update:visible', val);
});

const initCropper = () => {
  if (imgRef.value) {
    cropper = new Cropper(imgRef.value, {
      aspectRatio: 2 / 3,
      viewMode: 1,
      autoCropArea: 0.8,
    });
  }
};

const destroyCropper = () => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
};

const handleSave = () => {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({
      maxWidth: 600,
      maxHeight: 900,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    emit('save', base64);
    show.value = false;
  }
};
</script>

<style scoped>
.cropper-container {
  height: 500px;
  max-height: 60vh;
  background-color: #f0f0f0;
}
.dark .cropper-container {
  background-color: #1e1e1e;
}
</style>

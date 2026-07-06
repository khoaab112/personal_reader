<template>
  <div v-if="error" class="error-screen">
    <h2>Đã xảy ra lỗi không mong muốn</h2>
    <p>{{ error.message }}</p>
    <button @click="reloadApp">Tải lại trang</button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  console.error('Captured by AppGlobalError:', err);
  error.value = err;
  return false; // Ngăn lỗi tiếp tục lan truyền
});

const reloadApp = () => {
  window.location.reload();
};
</script>

<style scoped>
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}
.error-screen h2 {
  color: #ef4444;
  margin-bottom: 12px;
}
.error-screen p {
  color: #4b5563;
  margin-bottom: 24px;
}
.error-screen button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error-screen button:hover {
  background-color: #2563eb;
}
</style>

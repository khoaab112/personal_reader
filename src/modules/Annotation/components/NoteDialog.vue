<template>
  <div v-if="visible" class="note-dialog-overlay" @click.self="handleCancel">
    <div class="note-dialog">
      <div class="dialog-header">
        <h3>Add Note</h3>
        <button class="close-btn" @click="handleCancel">×</button>
      </div>
      <div class="dialog-content">
        <div class="target-text-preview">
          "{{ targetText }}"
        </div>
        <textarea 
          v-model="noteContent" 
          placeholder="Type your note here..."
          rows="4"
          autofocus
        ></textarea>
      </div>
      <div class="dialog-actions">
        <button class="btn-cancel" @click="handleCancel">Cancel</button>
        <button class="btn-save" @click="handleSave" :disabled="!noteContent.trim()">Save Note</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  targetText: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', text: string): void;
}>();

const noteContent = ref('');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    noteContent.value = '';
  }
});

const handleCancel = () => {
  emit('update:visible', false);
};

const handleSave = () => {
  if (!noteContent.value.trim()) return;
  emit('save', noteContent.value.trim());
  emit('update:visible', false);
};
</script>

<style scoped>
.note-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s;
}

.note-dialog {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.close-btn:hover {
  color: #111827;
}

.dialog-content {
  padding: 20px;
}

.target-text-preview {
  font-size: 13px;
  color: #4b5563;
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 3px solid #2563eb;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dialog-actions {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-save {
  padding: 8px 16px;
  background: #2563eb;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

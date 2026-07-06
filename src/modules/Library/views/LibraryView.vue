<template>
  <div class="library-layout bg-white dark:bg-gray-900">
    <div class="sidebar border-r border-gray-200 dark:border-gray-800">
      <div class="p-4 text-xl font-bold text-gray-800 dark:text-white">Personal Reader</div>
      <div class="menu-list">
        <div 
          v-for="item in menuItems" 
          :key="item.id"
          class="menu-item"
          :class="{ active: activeMenu === item.id }"
          @click="activeMenu = item.id"
        >
          <div class="icon" v-html="item.icon"></div>
          <span class="label">{{ item.label }}</span>
        </div>
      </div>
      
      <!-- General Settings -->
      <div class="absolute bottom-4 left-4 right-4">
        <n-button block @click="settingsStore.toggleDarkMode">
          {{ settingsStore.isDarkMode ? 'Giao diện Sáng' : 'Giao diện Tối' }}
        </n-button>
      </div>
    </div>
    
    <div class="main-content">
      <LibraryContent v-if="activeMenu === 'library'" />
      <ReportsContent v-if="activeMenu === 'reports'" />
      <HistoryContent v-if="activeMenu === 'history'" />
      <TrashContent v-if="activeMenu === 'trash'" />
      <BackupContent v-if="activeMenu === 'backup'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NButton } from 'naive-ui';
import { useSettingsStore } from '../../Settings/store/settingsStore';
import { useLibraryStore } from '../store/libraryStore';

import LibraryContent from '../components/LibraryContent.vue';
import ReportsContent from '../components/ReportsContent.vue';
import HistoryContent from '../components/HistoryContent.vue';
import TrashContent from '../components/TrashContent.vue';
import BackupContent from '../components/BackupContent.vue';

const settingsStore = useSettingsStore();
const libraryStore = useLibraryStore();
const activeMenu = ref('library');

onMounted(() => {
  libraryStore.loadBooks();
});

const menuItems = [
  { id: 'library', label: 'Thư viện của tôi', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
  { id: 'reports', label: 'Báo cáo', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>' },
  { id: 'history', label: 'Lịch sử đọc', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' },
  { id: 'trash', label: 'Đã xóa', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' },
  { id: 'backup', label: 'Sao lưu', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>' }
];
</script>

<style scoped>
.library-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.menu-list {
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  color: #4b5563; /* text-gray-600 */
  transition: background-color 0.2s, color 0.2s;
}

.dark .menu-item {
  color: #9ca3af; /* text-gray-400 */
}

.menu-item:hover {
  background-color: #f3f4f6; /* bg-gray-100 */
}

.dark .menu-item:hover {
  background-color: #1f2937; /* bg-gray-800 */
}

.menu-item.active {
  background-color: #eff6ff; /* bg-blue-50 */
  color: #2563eb; /* text-blue-600 */
  border-right: 3px solid #2563eb;
}

.dark .menu-item.active {
  background-color: #1e3a8a; /* bg-blue-900 */
  color: #60a5fa; /* text-blue-400 */
  border-right: 3px solid #3b82f6;
}

.menu-item .icon {
  margin-right: 12px;
  display: flex;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
</style>

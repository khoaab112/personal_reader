<template>
  <div 
    v-if="visible" 
    class="selection-menu"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
  >
    <div class="menu-items">
      <button class="menu-btn copy icon-btn" @click="handleCopy" title="Copy">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <div class="divider"></div>
      <button class="menu-btn highlight highlight-yellow" @click="handleHighlight('yellow')"></button>
      <button class="menu-btn highlight highlight-green" @click="handleHighlight('green')"></button>
      <button class="menu-btn highlight highlight-blue" @click="handleHighlight('blue')"></button>
      <button class="menu-btn highlight highlight-red" @click="handleHighlight('red')"></button>
      
      <!-- Custom Color Picker -->
      <div class="color-picker-wrapper" title="Chọn màu tuỳ chỉnh">
        <input type="color" v-model="customColor" @change="handleCustomHighlight" class="custom-color-picker" />
      </div>
      <div class="divider"></div>
      <button class="menu-btn action icon-btn" @click="handleHighlight('bold')" title="Gạch dưới đậm">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
          <line x1="4" y1="20" x2="20" y2="20" stroke-width="5"/>
        </svg>
      </button>
      <button class="menu-btn action icon-btn" @click="handleHighlight('italic')" title="Gạch đứt">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
          <line x1="4" y1="20" x2="20" y2="20" stroke-dasharray="4 4"/>
        </svg>
      </button>
      <div class="divider"></div>
      <button class="menu-btn action icon-btn" @click="handleTranslate" title="Dịch (Google Translate)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#4285F4">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
      </button>
      <button class="menu-btn action icon-btn" @click="handleSearch" title="Tìm kiếm (Google Search)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
          <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
          <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 11.36l3.98-3.69z"/>
          <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
        </svg>
      </button>
      <div class="divider"></div>
      <button class="menu-btn action icon-btn" @click="handleNote" title="Note">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  bookId: string;
  page: number;
  scale: number;
}>();

const emit = defineEmits<{
  (e: 'highlight', color: string, text: string, positionData: string): void;
  (e: 'addNote', text: string, positionData: string): void;
}>();

const visible = ref(false);
const position = ref({ x: 0, y: 0 });
const selectedText = ref('');
const selectedRects = ref<DOMRect[]>([]);
const customColor = ref('#ff00ff');

const handleCustomHighlight = () => {
  handleHighlight(customColor.value);
};

const mergeRects = (rects: DOMRect[]) => {
  if (rects.length === 0) return [];
  // Sort by Y, then by X
  const sorted = [...rects].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 8) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const merged: DOMRect[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    // If on the same line (y difference is small) and overlapping or close horizontally
    if (Math.abs(current.y - next.y) < 10 && current.x + current.width >= next.x - 24) {
      const newX = Math.min(current.x, next.x);
      const newWidth = Math.max(current.x + current.width, next.x + next.width) - newX;
      const newHeight = Math.max(current.height, next.height);
      const newY = Math.min(current.y, next.y);
      current = new DOMRect(newX, newY, newWidth, newHeight);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  return merged;
};

const handleSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    visible.value = false;
    return;
  }

  const text = selection.toString().trim();
  if (!text) {
    visible.value = false;
    return;
  }

  selectedText.value = text;
  
  // Calculate position for menu
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Save rects for highlight relative to page-container
  const pageContainer = document.querySelector('.page-container');
  if (pageContainer) {
    const containerRect = pageContainer.getBoundingClientRect();
    const rects = Array.from(range.getClientRects()).map(r => {
      return new DOMRect(
        (r.x - containerRect.x) / props.scale,
        (r.y - containerRect.y) / props.scale,
        r.width / props.scale,
        r.height / props.scale
      );
    });
    selectedRects.value = rects;
  }

  position.value = {
    x: rect.left + (rect.width / 2),
    y: rect.top - 10
  };
  visible.value = true;
};

const handleCopy = () => {
  navigator.clipboard.writeText(selectedText.value);
  window.getSelection()?.removeAllRanges();
  visible.value = false;
};

const handleHighlight = (color: string) => {
  const merged = mergeRects(selectedRects.value);
  const positionData = JSON.stringify(merged.map(r => ({
    x: r.x, y: r.y, width: r.width, height: r.height
  })));
  
  emit('highlight', color, selectedText.value, positionData);
  window.getSelection()?.removeAllRanges();
  visible.value = false;
};

const handleTranslate = () => {
  const url = `https://translate.google.com/?sl=auto&tl=vi&text=${encodeURIComponent(selectedText.value)}&op=translate`;
  window.open(url, '_blank');
  visible.value = false;
};

const handleSearch = () => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(selectedText.value)}`;
  window.open(url, '_blank');
  visible.value = false;
};

const handleNote = () => {
  const merged = mergeRects(selectedRects.value);
  const positionData = JSON.stringify(merged.map(r => ({
    x: r.x, y: r.y, width: r.width, height: r.height
  })));
  emit('addNote', selectedText.value, positionData);
  window.getSelection()?.removeAllRanges();
  visible.value = false;
};

onMounted(() => {
  document.addEventListener('mouseup', handleSelection);
});

onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelection);
});
</script>

<style scoped>
.selection-menu {
  position: fixed;
  transform: translate(-50%, -100%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 8px;
  z-index: 1000;
  display: flex;
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-items {
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.15s;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.menu-btn:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}

.divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 4px;
}

.highlight {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  padding: 0;
  margin: 0 2px;
  border: 1px solid rgba(0,0,0,0.1);
}

.highlight:hover {
  transform: scale(1.1);
}

.highlight-yellow { background: #fef08a; }
.highlight-green { background: #bbf7d0; }
.highlight-blue { background: #bfdbfe; }
.highlight-red { background: #fecaca; }

.color-picker-wrapper {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 2px;
  background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
  border: 1px solid rgba(0,0,0,0.15);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-picker-wrapper:hover {
  transform: scale(1.1);
}

.custom-color-picker {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0;
  cursor: pointer;
}

@keyframes popIn {
  from { opacity: 0; transform: translate(-50%, -90%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
}

/* Tooltip arrow */
.selection-menu::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: white transparent transparent transparent;
}
</style>

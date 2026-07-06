<template>
  <div class="highlight-layer">
    <template v-for="ann in annotations" :key="ann.id">
      <div 
        v-for="(rect, i) in getRects(ann.position_data)" 
        :key="i"
        class="highlight-rect"
        :class="['yellow', 'green', 'blue', 'red', 'bold', 'italic'].includes(ann.color) ? ann.color : ''"
        :style="getStyle(rect, ann.color, scale)"
        :title="ann.content"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Annotation } from '@/core/models/Database.types';

const props = defineProps<{
  annotations: Annotation[];
  scale: number;
}>();

const getRects = (positionData: string) => {
  try {
    return JSON.parse(positionData);
  } catch (e) {
    return [];
  }
};

const getStyle = (rect: any, color: string, scale: number) => {
  // Map color to CSS background
  const colorMap: Record<string, string> = {
    yellow: '#fef08a',
    green: '#bbf7d0',
    blue: '#bfdbfe',
    red: '#fecaca',
    bold: '#ffffff',
    italic: '#ffffff'
  };
  
  const bg = colorMap[color] || (color.startsWith('#') || color.startsWith('rgb') ? color : colorMap.yellow);
  
  return {
    left: `${rect.x * scale}px`,
    top: `${rect.y * scale}px`,
    width: `${rect.width * scale}px`,
    height: `${rect.height * scale}px`,
    backgroundColor: bg
  };
};
</script>

<style scoped>
.highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass through to text layer */
  z-index: 5;
  mix-blend-mode: multiply;
}

.highlight-rect {
  position: absolute;
  cursor: pointer;
  pointer-events: none;
  box-sizing: border-box;
}

.highlight-rect.bold {
  border-bottom: 3px solid #ef4444; /* Red thick underline */
}

.highlight-rect.italic {
  background-image: linear-gradient(to right, #3b82f6 50%, transparent 50%);
  background-position: bottom;
  background-size: 4px 2px;
  background-repeat: repeat-x;
}
</style>

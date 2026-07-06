<template>
  <div class="reading-marker-layer">
    <!-- Active Marker -->
    <div 
      v-if="activeMarker"
      class="marker-icon active"
      :style="{ top: getMarkerTop(activeMarker) }"
      title="Reading Marker (Current position)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5v18l7-3 7 3V3z" />
      </svg>
    </div>

    <!-- Hover Marker -->
    <div 
      v-if="hoverY !== null"
      class="marker-icon hover"
      :style="{ top: `${hoverY}px` }"
      title="Click to set Reading Marker"
      @click="setMarker"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 3H5v18l7-3 7 3V3z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAnnotationStore } from '../store/annotationStore';

const props = defineProps<{
  bookId: string;
  page: number;
  scale: number;
  hoverY: number | null;
}>();

const emit = defineEmits<{
  (e: 'marker-set'): void;
}>();

const store = useAnnotationStore();

const activeMarker = computed(() => store.getMarkerByPage(props.page));

const getMarkerTop = (marker: any) => {
  try {
    const data = JSON.parse(marker.position_data);
    return `${data.y * props.scale}px`;
  } catch {
    return '0px';
  }
};

const setMarker = () => {
  if (props.hoverY === null) return;
  const yRelative = props.hoverY / props.scale;
  const positionData = JSON.stringify({ y: yRelative });
  store.setMarker(props.bookId, props.page, positionData);
  emit('marker-set');
};
</script>

<style scoped>
.reading-marker-layer {
  position: absolute;
  top: 0;
  left: -32px; /* Position to the left of the page */
  width: 32px; 
  height: 100%;
  z-index: 10;
  pointer-events: none; /* Let clicks pass through except on the marker icons */
}

.marker-icon {
  position: absolute;
  right: 4px; /* Align to the right of the layer (close to the page edge) */
  width: 24px;
  height: 24px;
  transform: translateY(-50%);
  cursor: pointer;
  pointer-events: auto; /* Enable clicks on the marker */
  transition: opacity 0.2s, transform 0.2s;
}

.marker-icon.active {
  color: #ef4444; /* Red color for active marker */
  z-index: 11;
}

.marker-icon.hover {
  color: #9ca3af;
  opacity: 0.7;
}

.marker-icon.hover:hover {
  opacity: 1;
  color: #ef4444;
  transform: translateY(-50%) scale(1.1);
}
</style>

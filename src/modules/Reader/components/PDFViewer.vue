<template>
  <div class="pdf-viewer-container" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <div 
      class="page-container" 
      :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }"
    >
      <canvas ref="canvasRef"></canvas>
      <div ref="textLayerRef" class="textLayer"></div>
      
      <HighlightLayer 
        :annotations="pageAnnotations"
        :scale="scale"
      />
      <ReadingMarkerLayer :book-id="bookId" :page="page" :scale="scale" :hover-y="hoverY" @marker-set="hoverY = null" />
    </div>

    <SelectionMenu 
      :book-id="bookId"
      :page="page"
      :scale="scale"
      @highlight="handleHighlight"
      @add-note="(text, pos) => emit('addNote', text, pos)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, shallowRef, nextTick } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
// Vite support for loading worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
// Load CSS for text layer
import 'pdfjs-dist/web/pdf_viewer.css';

import SelectionMenu from '../../Annotation/components/SelectionMenu.vue';
import HighlightLayer from '../../Annotation/components/HighlightLayer.vue';
import ReadingMarkerLayer from '../../Annotation/components/ReadingMarkerLayer.vue';
import { useAnnotationStore } from '../../Annotation/store/annotationStore';
import { autoScanTOC } from '@/core/utils/pdfTocScanner';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const props = defineProps<{
  fileUrl: string;
  page: number;
  scale: number;
  bookId: string;
}>();

const emit = defineEmits<{
  (e: 'loaded', totalPages: number): void;
  (e: 'addNote', text: string, positionData: string): void;
  (e: 'outlineLoaded', outline: any[]): void;
  (e: 'page-rendered', unscaledHeight: number): void;
}>();

const annotationStore = useAnnotationStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const textLayerRef = ref<HTMLDivElement | null>(null);
const pdfDocument = shallowRef<pdfjsLib.PDFDocumentProxy | null>(null);
let renderTask: pdfjsLib.RenderTask | null = null;
let textLayerRenderTask: any = null;

const containerWidth = ref(0);
const containerHeight = ref(0);
const hoverY = ref<number | null>(null);
const handleMouseMove = (e: MouseEvent) => {
  if (!textLayerRef.value) return;
  const rect = textLayerRef.value.getBoundingClientRect();
  if (e.clientX >= rect.left - 80 && e.clientX <= rect.right + 80) {
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      hoverY.value = e.clientY - rect.top;
    } else {
      hoverY.value = null;
    }
  } else {
    hoverY.value = null;
  }
};
const handleMouseLeave = () => {
  hoverY.value = null;
};

const pageAnnotations = computed(() => {
  return annotationStore.getAnnotationsByPage(props.page);
});

const handleHighlight = async (color: string, text: string, positionData: string) => {
  await annotationStore.addHighlight(props.bookId, props.page, text, positionData, color);
};

const resolveOutlinePageNumbers = async (outlineItems: any[], doc: any) => {
  if (!outlineItems) return;
  for (const item of outlineItems) {
    if (item.dest) {
      if (item.dest.autoPageNum) {
        item.pageNum = item.dest.autoPageNum;
      } else {
         try {
           const destArray = typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;
           if (destArray) {
             const pageIndex = await doc.getPageIndex(destArray[0]);
             item.pageNum = pageIndex + 1;
           }
         } catch (e) {
           // ignore
         }
      }
    }
    if (item.items && item.items.length > 0) {
      await resolveOutlinePageNumbers(item.items, doc);
    }
  }
};

const loadPDF = async () => {
  if (!props.fileUrl) return;
  
  try {
    const loadingTask = pdfjsLib.getDocument(props.fileUrl);
    pdfDocument.value = await loadingTask.promise;
    emit('loaded', pdfDocument.value.numPages);
    
    try {
      let outline = await pdfDocument.value.getOutline();
      if (!outline || outline.length === 0) {
        console.log('No outline found, attempting to auto-scan TOC...');
        outline = await autoScanTOC(pdfDocument.value);
      }
      if (outline) {
        await resolveOutlinePageNumbers(outline, pdfDocument.value);
      }
      emit('outlineLoaded', outline || []);
    } catch (e) {
      console.warn('Failed to get PDF outline:', e);
      try {
        const autoOutline = await autoScanTOC(pdfDocument.value);
        if (autoOutline) {
          await resolveOutlinePageNumbers(autoOutline, pdfDocument.value);
        }
        emit('outlineLoaded', autoOutline || []);
      } catch (err) {
        emit('outlineLoaded', []);
      }
    }
    
    // Load annotations
    await annotationStore.loadForBook(props.bookId);
    
    renderPage(props.page);
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
};


const renderPage = async (pageNum: number) => {
  if (!pdfDocument.value || !canvasRef.value || !textLayerRef.value) return;

  try {
    const page = await pdfDocument.value.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    emit('page-rendered', unscaledViewport.height);
    
    const viewport = page.getViewport({ scale: props.scale || 1.0 });
    
    containerWidth.value = viewport.width;
    containerHeight.value = viewport.height;
    
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Support HiDPI-displays
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1 
      ? [outputScale, 0, 0, outputScale, 0, 0] 
      : null;

    const renderContext = {
      canvasContext: context,
      transform: transform || undefined,
      viewport: viewport,
    };

    if (renderTask) {
      await renderTask.cancel();
    }

    renderTask = page.render(renderContext);
    await renderTask.promise;
    
    // Render Text Layer
    textLayerRef.value.innerHTML = '';
    textLayerRef.value.style.setProperty('--scale-factor', viewport.scale.toString());
    
    const textContent = await page.getTextContent();
    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerRef.value,
      viewport: viewport
    });
    
    if (textLayerRenderTask) {
      textLayerRenderTask.cancel();
    }
    textLayerRenderTask = textLayer;
    await textLayer.render();
    
    
    
  } catch (error) {
    if ((error as any).name !== 'RenderingCancelledException') {
      console.error('Error rendering page:', error);
    }
  }
};

const resolveDestination = async (dest: any) => {
  if (!pdfDocument.value) return null;
  if (dest && dest.autoPageNum) {
    return dest.autoPageNum;
  }
  try {
    const destArray = typeof dest === 'string' ? await pdfDocument.value.getDestination(dest) : dest;
    if (destArray) {
      const pageIndex = await pdfDocument.value.getPageIndex(destArray[0]);
      return pageIndex + 1;
    }
  } catch (e) {
    console.error('Failed to resolve destination:', e);
  }
  return null;
};

defineExpose({ resolveDestination });

onMounted(() => {
  if (props.fileUrl) {
    loadPDF();
  }
});

watch(() => props.fileUrl, () => {
  loadPDF();
});

watch([() => props.page, () => props.scale], () => {
  if (pdfDocument.value) {
    renderPage(props.page);
  }
});

watch(pageAnnotations, () => {
  nextTick(() => {
    
  });
}, { deep: true });
</script>

<style scoped>
.pdf-viewer-container {
  background-color: var(--n-color, #e5e7eb);
  padding: 20px;
  height: calc(100vh - 64px);
  overflow: auto;
}
.page-container {
  margin: 0 auto;
  position: relative;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: width 0.25s ease-out, height 0.25s ease-out;
}
canvas {
  display: block;
  transition: width 0.25s ease-out, height 0.25s ease-out;
}
.textLayer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 1;
  mix-blend-mode: multiply;
  line-height: 1.0;
  z-index: 2;
}

:deep(.textLayer span) {
  color: transparent !important;
}

:deep(.textLayer ::selection) {
  background: #60a5fa; /* Stronger solid blue */
  color: transparent !important;
}
</style>

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function generatePDFCover(fileUrl: string, pageNumber: number = 1): Promise<string | null> {
  try {
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    if (pdf.numPages < pageNumber) {
      return null;
    }
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    // Scale down to a reasonable cover size if it's too big, e.g., max width 600px
    const MAX_WIDTH = 600;
    const scale = viewport.width > MAX_WIDTH ? MAX_WIDTH / viewport.width : 1.0;
    const scaledViewport = page.getViewport({ scale });
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to base64
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error generating PDF cover:', error);
    return null;
  }
}

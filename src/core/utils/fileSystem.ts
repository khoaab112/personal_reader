import { saveFileToSandbox } from './sandboxFileStore';

export async function selectBookFile(): Promise<{ name: string; path: string; type: string } | null> {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    // Môi trường Tauri
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Tài liệu',
        extensions: ['pdf']
      }]
    });
    
    if (selected) {
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      const name = filePath.split(/[\\/]/).pop() || 'Unknown';
      const type = name.split('.').pop()?.toLowerCase() || 'pdf';
      return { name, path: filePath, type };
    }
    return null;
  } else {
    // Môi trường Browser giả lập (Sandbox) cho quá trình dev trên web
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const path = `mock-path/${file.name}`;
          await saveFileToSandbox(path, file);
          resolve({
            name: file.name,
            path,
            type: file.name.split('.').pop()?.toLowerCase() || 'pdf'
          });
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
}

export async function processBookFile(file: File): Promise<{ name: string; path: string; type: string }> {
  const name = file.name;
  const type = name.split('.').pop()?.toLowerCase() || 'pdf';
  
  // Try to get path from Tauri file drop
  if ((file as any).path) {
    return { name, path: (file as any).path, type };
  }
  
  // Fallback to sandbox for web environment
  const path = `mock-path/${name}`;
  await saveFileToSandbox(path, file);
  return { name, path, type };
}

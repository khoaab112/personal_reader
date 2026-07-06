export const saveFileToSandbox = async (path: string, file: File) => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('SandboxFiles', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('files');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(file, path);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getFileFromSandbox = async (path: string): Promise<File | undefined> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SandboxFiles', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('files');
    };
    request.onsuccess = () => {
      const db = request.result;
      // If store doesn't exist, it will throw an error, but we created it above if needed
      if (!db.objectStoreNames.contains('files')) {
        resolve(undefined);
        return;
      }
      const tx = db.transaction('files', 'readonly');
      const req = tx.objectStore('files').get(path);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
    request.onerror = () => reject(request.error);
  });
};

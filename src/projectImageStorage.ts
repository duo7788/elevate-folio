export const PROJECT_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

const DB_NAME = "portfolio_project_images";
const STORE_NAME = "images";

export function isProjectImage(file: File) {
  return file.type.startsWith("image/");
}

function openProjectImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProjectImage(projectId: string, file: File) {
  if (!isProjectImage(file)) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 3 MB or smaller.");
  }

  const db = await openProjectImageDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, projectId);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadProjectImages() {
  const db = await openProjectImageDb();

  return new Promise<Array<{ projectId: string; file: File }>>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const keysRequest = store.getAllKeys();
    const filesRequest = store.getAll();

    transaction.oncomplete = () => {
      db.close();
      resolve(
        keysRequest.result.map((key, index) => ({
          projectId: String(key),
          file: filesRequest.result[index] as File,
        })),
      );
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

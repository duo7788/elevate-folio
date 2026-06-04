export const AVATAR_IMAGE_MAX_BYTES = 3 * 1024 * 1024;

const DB_NAME = "portfolio_avatar";
const STORE_NAME = "images";
const AVATAR_KEY = "avatar";

export function isAvatarImage(file: File) {
  return file.type.startsWith("image/");
}

function openAvatarDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAvatarImage(file: File) {
  if (!isAvatarImage(file)) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > AVATAR_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 3 MB or smaller.");
  }

  const db = await openAvatarDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, AVATAR_KEY);
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

export async function loadAvatarImage() {
  const db = await openAvatarDb();

  return new Promise<File | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(AVATAR_KEY);

    request.onsuccess = () => resolve(request.result as File | undefined);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

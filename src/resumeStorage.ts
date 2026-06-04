export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

const DB_NAME = "portfolio_resume";
const STORE_NAME = "files";
const RESUME_KEY = "resume";

export function isResumePdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function openResumeDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveResumePdf(file: File) {
  if (!isResumePdf(file)) {
    throw new Error("Please choose a PDF file.");
  }

  if (file.size > RESUME_MAX_BYTES) {
    throw new Error("PDF must be 5 MB or smaller.");
  }

  const db = await openResumeDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, RESUME_KEY);
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

export async function loadResumePdf() {
  const db = await openResumeDb();

  return new Promise<File | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(RESUME_KEY);

    request.onsuccess = () => resolve(request.result as File | undefined);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

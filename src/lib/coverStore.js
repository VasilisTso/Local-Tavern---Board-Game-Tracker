// Uploaded cover images, kept in IndexedDB (localStorage is too small for images).
// Items hold only a `coverId`; the blob lives here under that id. No dependencies.

const DB_NAME = 'local-tavern';
const DB_VERSION = 1;
const STORE = 'covers';

export const COVER_MAX_SIZE = 600;
const QUALITY = 0.85;

let dbPromise = null;

const promisify = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available.'));
  if (!dbPromise) {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    dbPromise = promisify(request).then(
      (db) => {
        // The browser can drop the connection (site data cleared, storage pressure); reopen next time.
        db.onclose = () => (dbPromise = null);
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        return db;
      },
      (error) => {
        dbPromise = null; // let a later call retry (e.g. private mode turned off)
        throw error;
      },
    );
  }
  return dbPromise;
}

/**
 * Runs `fn(store)` in one transaction. `fn` returns a request, or an array of requests;
 * resolves with their result(s) once the transaction commits.
 */
async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const requests = fn(tx.objectStore(STORE));
    tx.oncomplete = () =>
      resolve(Array.isArray(requests) ? requests.map((r) => r.result) : requests?.result);
    // tx.error can still be null while the error event fires; the cause sits on the request.
    tx.onerror = (event) => reject(event.target?.error ?? tx.error);
    tx.onabort = (event) => reject(tx.error ?? event.target?.error ?? new Error('Cover storage was interrupted.'));
  });
}

/** Fired on `window` after covers are written in bulk (backup import), so views can reload images. */
export const COVERS_CHANGED = 'tavern:covers-changed';

const newId = () =>
  `cover-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;

/** Stores a blob and returns its new id. */
export async function putCover(blob, id = newId()) {
  await withStore('readwrite', (store) => store.put(blob, id));
  return id;
}

/** The stored blob, or null when it is missing or storage is unavailable. */
export async function getCover(id) {
  if (!id) return null;
  try {
    return (await withStore('readonly', (store) => store.get(id))) ?? null;
  } catch {
    return null;
  }
}

export async function deleteCover(id) {
  if (!id) return;
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch {
    // nothing stored, nothing to remove
  }
}

/**
 * Removes stored covers that no item points at (left behind by deletes, replace imports and
 * undos). Run at startup, when no undo is pending. Returns how many were removed.
 */
export async function pruneCovers(keepIds) {
  const keep = new Set(keepIds.filter(Boolean));
  try {
    const ids = (await withStore('readonly', (store) => store.getAllKeys())) ?? [];
    const orphans = ids.filter((id) => !keep.has(id));
    if (orphans.length) await withStore('readwrite', (store) => orphans.map((id) => store.delete(id)));
    return orphans.length;
  } catch {
    return 0;
  }
}

// ---------- resize ----------

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not an image the browser can read.'));
    };
    img.src = url;
  });
}

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * Scales an image file so its longer side is at most `max` px and encodes it as WebP
 * (JPEG where the browser cannot encode WebP). Never upscales.
 */
export async function resizeImage(file, max = COVER_MAX_SIZE) {
  const img = await loadImage(file);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

  const webp = await toBlob(canvas, 'image/webp');
  // Older Safari silently returns PNG for an unsupported type.
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await toBlob(canvas, 'image/jpeg');
  if (!jpeg) throw new Error('Couldn’t encode that image.');
  return jpeg;
}

/** Resizes an uploaded file and stores it. Returns the new cover id. */
export async function saveCoverFile(file) {
  return putCover(await resizeImage(file));
}

// ---------- backup ----------

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const IMAGE_DATA_URL = /^data:(image\/(?:webp|jpeg|png|gif|avif));base64,([A-Za-z0-9+/=]+)$/;

/** A Blob from a base64 image data URL, or null for anything else. */
export function dataUrlToBlob(dataUrl) {
  const match = typeof dataUrl === 'string' ? IMAGE_DATA_URL.exec(dataUrl) : null;
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: match[1] });
  } catch {
    return null;
  }
}

/**
 * `{ [coverId]: dataUrl }` for the given ids that are stored, read in one transaction.
 * Throws when cover storage cannot be opened, so the caller can say the images were left out.
 */
export async function exportCovers(ids) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const blobs = await withStore('readonly', (store) => unique.map((id) => store.get(id)));
  const entries = await Promise.all(
    unique.map(async (id, i) => (blobs[i] ? [id, await blobToDataUrl(blobs[i])] : null)),
  );
  return Object.fromEntries(entries.filter(Boolean));
}

/**
 * Stores covers from a backup under their original ids, in one transaction.
 * Returns how many were saved; throws when storage is blocked or full.
 */
export async function importCovers(covers) {
  const entries = Object.entries(covers ?? {})
    .map(([id, dataUrl]) => [id, dataUrlToBlob(dataUrl)])
    .filter(([, blob]) => blob);
  if (!entries.length) return 0;
  await withStore('readwrite', (store) => entries.map(([id, blob]) => store.put(blob, id)));
  window.dispatchEvent(new Event(COVERS_CHANGED));
  return entries.length;
}

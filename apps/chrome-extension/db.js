/**
 * db.js — IndexedDB helper for local review storage + state backup
 * Reviews never leave the browser; they live here and export to CSV.
 */

const DB_NAME = 'amazon_reviews_db';
const DB_VERSION = 2;
const STORE_NAME = 'reviews';
const STATE_STORE_NAME = 'scraperState';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('asin', 'asin', { unique: false });
        store.createIndex('scrapeJobId', 'scrapeJobId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STATE_STORE_NAME)) {
        db.createObjectStore(STATE_STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===== Reviews =====

async function saveReviews(reviews, asin, scrapeJobId) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const now = Date.now();
  let saved = 0;

  for (const review of reviews) {
    if (!review.id) continue;
    store.put({
      ...review,
      asin,
      scrapeJobId: scrapeJobId || null,
      createdAt: now,
    });
    saved++;
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(saved);
    tx.onerror = () => reject(tx.error);
  });
}

async function getReviewsByAsin(asin) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.objectStore(STORE_NAME).index('asin');
  const request = index.getAll(asin);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearAllReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function countReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).count();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ===== Scraper State Backup (IndexedDB) =====
// Used as a fallback when chrome.storage.local is reset on SW restart

async function saveState(state) {
  try {
    const db = await openDB();
    const tx = db.transaction(STATE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(STATE_STORE_NAME);
    store.put({ key: 'scraperState', value: state, updatedAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[db] saveState failed:', e);
  }
}

async function loadState() {
  try {
    const db = await openDB();
    const tx = db.transaction(STATE_STORE_NAME, 'readonly');
    const store = tx.objectStore(STATE_STORE_NAME);
    const request = store.get('scraperState');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('[db] loadState failed:', e);
    return null;
  }
}

async function clearState() {
  try {
    const db = await openDB();
    const tx = db.transaction(STATE_STORE_NAME, 'readwrite');
    tx.objectStore(STATE_STORE_NAME).delete('scraperState');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[db] clearState failed:', e);
  }
}

self.__reviewsDB = {
  saveReviews,
  getReviewsByAsin,
  getAllReviews,
  clearAllReviews,
  countReviews,
  saveState,
  loadState,
  clearState,
};

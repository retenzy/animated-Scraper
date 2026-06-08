/**
 * db.js — IndexedDB helper for local review storage
 * Reviews never leave the browser; they live here and export to CSV.
 */

const DB_NAME = 'amazon_reviews_db';
const DB_VERSION = 1;
const STORE_NAME = 'reviews';

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
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an array of reviews for a given ASIN + scrapeJobId.
 * Skips duplicates by keyPath (review id).
 */
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

/**
 * Get all reviews for a specific ASIN
 */
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

/**
 * Get ALL reviews stored in IndexedDB (for CSV export)
 */
async function getAllReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all reviews (after export or on user request)
 */
async function clearAllReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Count total reviews stored
 */
async function countReviews() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).count();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// `self` works in both service workers and extension pages
self.__reviewsDB = {
  saveReviews,
  getReviewsByAsin,
  getAllReviews,
  clearAllReviews,
  countReviews,
};

/**
 * Amazon Reviews Extractor - Popup Script
 * Coordinates multi-product scraping with background.js and updates progress in real-time
 */

// ===== DOM Elements =====
const elements = {
  extractBtn: document.getElementById('extract-btn'),
  exportBtn: document.getElementById('export-btn'),
  stopBtn: document.getElementById('stop-btn'),
  reviewInput: document.getElementById('review-input'),
  statusIcon: document.getElementById('status-icon'),
  statusText: document.getElementById('status-text'),
  productInfo: document.getElementById('product-info'),
  productName: document.getElementById('product-name'),
  productAsin: document.getElementById('product-asin'),
  productRating: document.getElementById('product-rating'),
  progressSection: document.getElementById('progress-section'),
  progressFill: document.getElementById('progress-fill'),
  progressText: document.getElementById('progress-text'),
  progressCount: document.getElementById('progress-count'),
  resultsSection: document.getElementById('results-section'),
  resultsList: document.getElementById('results-list'),
  resultsCount: document.getElementById('results-count'),
  errorSection: document.getElementById('error-section'),
  errorText: document.getElementById('error-text'),
  usernameDisplay: document.getElementById('username-display'),
  coinsCount: document.getElementById('coins-count'),
  addCoinsBtn: document.getElementById('add-coins-btn'),
  headerToggle: document.getElementById('header-toggle'),
  settingsSection: document.getElementById('settings-section'),
  backendUrlInput: document.getElementById('backend-url-input'),
  settingsSaveBtn: document.getElementById('settings-save-btn'),
  dashboardLink: document.getElementById('dashboard-link'),
};

// ===== State =====
let productTitle = '';
let userId = '';
let BACKEND_URL = 'http://localhost:3000';

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  // Load configurable backend URL from storage
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(['backendUrl'], (result) => resolve(result));
  });
  if (stored.backendUrl) BACKEND_URL = stored.backendUrl;
  if (elements.backendUrlInput) elements.backendUrlInput.value = BACKEND_URL;

  setupEventListeners();
  await initUser();
  await restoreState();
  await checkCurrentPage();

  // Listen for real-time updates from storage (catches background updates)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.scraperState) {
        updateUI(changes.scraperState.newValue);
      }
      if (changes.userState) {
        updateUserUI(changes.userState.newValue);
      }
    }
  });
});

// ===== Setup Event Listeners =====
function setupEventListeners() {
  elements.extractBtn.addEventListener('click', startExtraction);
  elements.exportBtn.addEventListener('click', exportCSV);
  elements.stopBtn.addEventListener('click', stopExtraction);
  elements.addCoinsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${BACKEND_URL}/dashboard/buy-credits` });
  });
  elements.headerToggle.addEventListener('click', () => {
    elements.settingsSection.classList.toggle('hidden');
  });
  elements.settingsSaveBtn.addEventListener('click', () => {
    const url = elements.backendUrlInput.value.trim() || 'http://localhost:3000';
    BACKEND_URL = url;
    chrome.storage.local.set({ backendUrl: url }, () => {
      elements.settingsSection.classList.add('hidden');
    });
  });
  elements.dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${BACKEND_URL}/dashboard` });
  });
}

// ===== User Management Logic =====
async function initUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userState'], (result) => {
      const userState = result.userState;

      // If no valid synced user from dashboard, show "Not signed in"
      if (!userState || !userState.userId || userState.userId.startsWith('user_')) {
        updateUserUI({ userId: '', name: '', coins: 0 });
        resolve();
        return;
      }

      userId = userState.userId || userState.id;
      updateUserUI(userState);

      // Register this extension with the backend for auto-connect
      fetch(`${BACKEND_URL}/api/extensions/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, extensionId: chrome.runtime.id })
      }).catch(() => {});

      resolve();
    });
  });
}

function updateUserUI(userState) {
  if (!userState) return;
  const displayName = userState.name && !userState.name.startsWith('user_')
    ? userState.name.split('@')[0]
    : 'Not signed in';
  elements.usernameDisplay.textContent = displayName;
  elements.coinsCount.textContent = userState.coins !== undefined ? userState.coins : '0';
}

// ===== Check if current tab is an Amazon page for product info =====
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const isAmazon = /amazon\.(com|in|co\.uk|de|fr|it|es|ca|co\.jp|com\.au|com\.br|com\.mx|sg|ae|sa)/i.test(tab.url);
    if (!isAmazon) return;

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const title = document.querySelector('#productTitle')?.textContent?.trim() || '';
          const asinMatch = window.location.pathname.match(/\/(?:dp|product-reviews)\/([A-Z0-9]{10})/i);
          const asin = asinMatch ? asinMatch[1] : '';
          const rating = document.querySelector('#acrPopover span.a-size-base')?.textContent?.trim() || '';
          return { title, asin, rating };
        },
      });

      if (results?.[0]?.result) {
        const info = results[0].result;
        if (info.title) {
          productTitle = info.title;
          elements.productName.textContent = info.title;
          elements.productAsin.textContent = info.asin ? `ASIN: ${info.asin}` : '';
          elements.productRating.textContent = info.rating || '';
          elements.productInfo.classList.remove('hidden');
        }
      }
    } catch (e) {
      console.log('Could not get product info:', e);
    }
  } catch (err) {
    console.log('Unable to access current tab:', err);
  }
}

// ===== Restore State on Popup Open =====
async function restoreState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['scraperState'], (result) => {
      const state = result.scraperState || {
        status: 'idle',
        queue: [],
        currentIndex: 0,
        progressText: 'Ready to extract',
        progressCount: 0,
        extractedReviews: [],
        currentProductTitle: ''
      };

      // If state says 'running', check if background is alive
      if (state.status === 'running') {
        chrome.runtime.sendMessage({ action: 'PING' }, (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            // Background was restarted — recovery state
            state.status = 'idle';
            state.progressText = state.progressCount > 0
              ? `Scraping was interrupted. ${state.progressCount} reviews saved.`
              : 'Ready to extract';
            chrome.storage.local.set({ scraperState: state });
          }
          updateUI(state);
          resolve();
        });
      } else {
        updateUI(state);
        resolve();
      }
    });
  });
}

// ===== Update UI Elements based on Scraper State =====
function updateUI(state) {
  const reviewCount = state.progressCount || 0;

  if (state.status === 'running') {
    elements.extractBtn.classList.add('hidden');
    elements.stopBtn.classList.remove('hidden');
    elements.exportBtn.classList.add('hidden');
    elements.progressSection.classList.remove('hidden');
    elements.errorSection.classList.add('hidden');

    const total = state.queue.length || 1;
    const current = state.currentIndex || 0;
    const pct = Math.round((current / total) * 100);
    elements.progressFill.style.width = `${pct}%`;
    elements.progressText.textContent = state.progressText;
    elements.progressCount.textContent = `${reviewCount} reviews`;
  } else {
    elements.extractBtn.classList.remove('hidden');
    elements.stopBtn.classList.add('hidden');
    elements.progressSection.classList.add('hidden');

    if (reviewCount > 0) {
      elements.exportBtn.classList.remove('hidden');
      showResults();
    } else {
      elements.exportBtn.classList.add('hidden');
      elements.resultsSection.classList.add('hidden');
    }
  }
}

// ===== Helper to resolve ASIN or URL into a review page URL =====
function resolveUrl(input, defaultOrigin = 'https://www.amazon.com') {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const asinMatch = trimmed.match(/\b([A-Z0-9]{10})\b/i);
  const isJustAsin = asinMatch && asinMatch[0] === trimmed;

  if (isJustAsin) {
    return `${defaultOrigin}/product-reviews/${trimmed}/ref=cm_cr_arp_d_product_top?ie=UTF8&reviewerType=all_reviews`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const origin = url.origin;

      if (url.pathname.includes('/product-reviews/')) {
        if (!url.searchParams.has('reviewerType')) {
          url.searchParams.set('reviewerType', 'all_reviews');
        }
        return url.toString();
      }

      const dpMatch = url.pathname.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i);
      if (dpMatch) {
        const asin = dpMatch[1];
        return `${origin}/product-reviews/${asin}/ref=cm_cr_arp_d_product_top?ie=UTF8&reviewerType=all_reviews`;
      }

      return trimmed;
    } catch (e) {
      return trimmed;
    }
  }

  if (asinMatch) {
    return `${defaultOrigin}/product-reviews/${asinMatch[1]}/ref=cm_cr_arp_d_product_top?ie=UTF8&reviewerType=all_reviews`;
  }

  return null;
}

// ===== Start Extraction Queue =====
async function startExtraction() {
  const inputVal = elements.reviewInput.value.trim();
  let queue = [];
  let closeTabAfter = true;

  let defaultOrigin = 'https://www.amazon.com';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && /amazon\./i.test(tab.url)) {
      const urlObj = new URL(tab.url);
      defaultOrigin = urlObj.origin;
    }
  } catch (e) {
    console.error('Failed to get active tab origin:', e);
  }

  if (inputVal) {
    const lines = inputVal.split('\n');
    for (const line of lines) {
      const resolved = resolveUrl(line, defaultOrigin);
      if (resolved) queue.push(resolved);
    }
  }

  if (queue.length === 0) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        showError('No active tab or input ASINs found.');
        return;
      }

      const isAmazon = /amazon\.(com|in|co\.uk|de|fr|it|es|ca|co\.jp|com\.au|com\.br|com\.mx|sg|ae|sa)/i.test(tab.url);
      if (!isAmazon) {
        showError('Navigate to an Amazon page or paste URLs/ASINs first.');
        return;
      }

      const resolved = resolveUrl(tab.url, defaultOrigin);
      if (resolved) {
        queue.push(resolved);
        closeTabAfter = false;
      } else {
        showError('Could not parse Amazon URL of active tab.');
        return;
      }
    } catch (err) {
      showError('Unable to access the current tab.');
      return;
    }
  }

  const userState = await new Promise((r) => chrome.storage.local.get(['userState'], (result) => r(result.userState || {})));
  const coins = userState.coins || 0;
  if (coins <= 0) {
    showError('Insufficient coins! Click the "+" button to buy more.');
    return;
  }

  elements.errorSection.classList.add('hidden');

  chrome.runtime.sendMessage({
    action: 'START_SCRAPING',
    queue: queue,
    closeTabAfter: closeTabAfter,
    userId: userId
  });
}

// ===== Stop Extraction Queue =====
function stopExtraction() {
  chrome.runtime.sendMessage({ action: 'STOP_SCRAPING' });
  setStatus('running', 'Stopping extraction...');
}

// ===== Show Results Preview (reads from IndexedDB) =====
async function showResults() {
  elements.resultsSection.classList.remove('hidden');
  elements.resultsList.innerHTML = '';

  let reviews = [];
  try {
    reviews = await self.__reviewsDB.getAllReviews();
  } catch (e) {
    console.error('Failed to load reviews from IndexedDB:', e);
  }

  elements.resultsCount.textContent = reviews.length;

  const preview = reviews.slice(0, 10);
  preview.forEach((r) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-card-header">
        <span class="review-card-name">${escapeHtml(r.name)}</span>
        <span class="review-card-stars">${'★'.repeat(Math.round(parseFloat(r.stars) || 0))}${'☆'.repeat(5 - Math.round(parseFloat(r.stars) || 0))}</span>
      </div>
      <div class="review-card-title">${escapeHtml(r.title)}</div>
      <div class="review-card-date">${escapeHtml(r.date)}${r.verified === 'Yes' ? ' · ✓ Verified' : ''}</div>
    `;
    elements.resultsList.appendChild(card);
  });

  if (reviews.length > 10) {
    const more = document.createElement('div');
    more.className = 'review-card';
    more.style.textAlign = 'center';
    more.style.color = 'var(--text-muted)';
    more.style.fontSize = '11px';
    more.textContent = `+ ${reviews.length - 10} more reviews (export CSV to see all)`;
    elements.resultsList.appendChild(more);
  }
}

// ===== Export CSV (reads from IndexedDB) =====
async function exportCSV() {
  let reviews = [];
  try {
    reviews = await self.__reviewsDB.getAllReviews();
  } catch (e) {
    console.error('Failed to load reviews from IndexedDB:', e);
  }

  if (reviews.length === 0) return;

  const safeName = (productTitle || 'amazon-reviews').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${safeName}_reviews_${timestamp}.csv`;

  setStatus('running', 'Generating CSV...');

  try {
    const response = await fetch(`${BACKEND_URL}/api/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews, filename }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('success', 'CSV exported (via backend)');
      return;
    }
  } catch (backendErr) {
    console.log('[CSV Export] Backend not available, falling back to local');
  }

  localExportCSV(filename, reviews);
  setStatus('success', 'CSV exported (local)');
}

function localExportCSV(filename, reviews) {
  const headers = ['Name', 'Stars', 'Title', 'Date', 'Description', 'Verified Purchase', 'Helpful Votes'];
  const rows = reviews.map((r) => [
    csvEscape(r.name),
    csvEscape(r.stars),
    csvEscape(r.title),
    csvEscape(r.date),
    csvEscape(r.description),
    csvEscape(r.verified),
    csvEscape(r.helpful),
  ]);

  let csv = headers.join(',') + '\n';
  csv += rows.map((r) => r.join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// ===== Helpers =====
function setStatus(type, text) {
  elements.statusIcon.className = `status-icon status-${type === 'success' ? 'success' : type === 'running' ? 'running' : 'idle'}`;
  elements.statusText.textContent = text;
}

function showError(msg) {
  elements.errorSection.classList.remove('hidden');
  elements.errorText.textContent = msg;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function csvEscape(val) {
  if (val == null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return '"' + str + '"';
}

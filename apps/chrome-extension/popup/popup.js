/**
 * Amazon Review Exporter - Popup Script
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
  clearBtn: document.getElementById('clear-btn'),
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
  filtersSection: document.getElementById('filters-section'),
  filtersToggle: document.getElementById('filters-toggle'),
  filtersBody: document.getElementById('filters-body'),
  filtersCount: document.getElementById('filters-count'),
  filterStars: document.getElementById('filter-stars'),
  filterVerified: document.getElementById('filter-verified'),
  filterHelpful: document.getElementById('filter-helpful'),
  filterDays: document.getElementById('filter-days'),
  filterInclude: document.getElementById('filter-include'),
  filterExclude: document.getElementById('filter-exclude'),
};

// ===== State =====
let productTitle = '';
let userId = '';
let BACKEND_URL = 'https://www.retenzyreviews.com';
let coinRefreshInterval = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(['backendUrl'], (result) => resolve(result));
  });
  if (stored.backendUrl) BACKEND_URL = stored.backendUrl;
  if (elements.backendUrlInput) elements.backendUrlInput.value = BACKEND_URL;

  setupEventListeners();
  await initUser();
  await loadFilterSettings();
  await restoreState();
  await checkSavedReviews();
  await checkCurrentPage();

  // Listen for real-time updates from storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.scraperState) {
        updateUI(changes.scraperState.newValue);
        checkSavedReviews();
      }
      if (changes.userState) {
        updateUserUI(changes.userState.newValue);
      }
    }
  });

  // Start periodic coin balance refresh (every 30s)
  startCoinRefresh();
});

// Clean up interval when popup closes
window.addEventListener('unload', () => {
  if (coinRefreshInterval) clearInterval(coinRefreshInterval);
});

// ===== Periodic Coin Refresh =====
function startCoinRefresh() {
  if (coinRefreshInterval) clearInterval(coinRefreshInterval);
  coinRefreshInterval = setInterval(refreshCoins, 30000);
  refreshCoins(); // Also fetch immediately
}

async function refreshCoins() {
  if (!userId || userId.startsWith('user_')) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/credits/${userId}`);
    const data = await res.json();
    if (data.coins !== undefined) {
      chrome.storage.local.get(['userState'], (result) => {
        const userState = result.userState || {};
        userState.coins = data.coins;
        chrome.storage.local.set({ userState });
      });
    }
  } catch (e) {
    // Backend might not be available — ignore
  }
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
  elements.extractBtn.addEventListener('click', startExtraction);
  elements.exportBtn.addEventListener('click', exportCSV);
  elements.stopBtn.addEventListener('click', stopExtraction);
  elements.clearBtn.addEventListener('click', clearAllReviews);
  elements.addCoinsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${BACKEND_URL}/dashboard/buy-credits` });
  });
  elements.headerToggle.addEventListener('click', () => {
    elements.settingsSection.classList.toggle('hidden');
  });
  elements.settingsSaveBtn.addEventListener('click', () => {
    const url = elements.backendUrlInput.value.trim() || 'https://www.retenzyreviews.com';
    BACKEND_URL = url;
    chrome.storage.local.set({ backendUrl: url }, () => {
      elements.settingsSection.classList.add('hidden');
    });
  });
  elements.dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${BACKEND_URL}/dashboard` });
  });
  elements.filtersToggle.addEventListener('click', () => {
    elements.filtersSection.classList.toggle('open');
    elements.filtersBody.classList.toggle('hidden');
  });
  ['filterStars', 'filterVerified', 'filterHelpful', 'filterDays', 'filterInclude', 'filterExclude'].forEach((key) => {
    elements[key].addEventListener('change', saveFilterSettings);
    if (key === 'filterInclude' || key === 'filterExclude') {
      elements[key].addEventListener('input', saveFilterSettings);
    }
  });
}

// ===== Filters =====
const DEFAULT_FILTERS = {
  minStars: 0,
  verifiedOnly: false,
  minHelpful: 0,
  days: 0,
  include: '',
  exclude: '',
};

function getFilters() {
  return {
    minStars: parseInt(elements.filterStars.value) || 0,
    verifiedOnly: elements.filterVerified.checked,
    minHelpful: parseInt(elements.filterHelpful.value) || 0,
    days: parseInt(elements.filterDays.value) || 0,
    include: elements.filterInclude.value.trim(),
    exclude: elements.filterExclude.value.trim(),
  };
}

function activeFilterCount(filters) {
  let count = 0;
  if (filters.minStars) count++;
  if (filters.verifiedOnly) count++;
  if (filters.minHelpful) count++;
  if (filters.days) count++;
  if (filters.include) count++;
  if (filters.exclude) count++;
  return count;
}

function updateFilterCountBadge() {
  const count = activeFilterCount(getFilters());
  if (count > 0) {
    elements.filtersCount.textContent = String(count);
    elements.filtersCount.classList.remove('hidden');
  } else {
    elements.filtersCount.classList.add('hidden');
  }
}

function saveFilterSettings() {
  const filters = getFilters();
  chrome.storage.local.set({ filterSettings: filters });
  updateFilterCountBadge();
  checkSavedReviews();
}

async function loadFilterSettings() {
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(['filterSettings'], (result) => resolve(result.filterSettings || {}));
  });
  const filters = { ...DEFAULT_FILTERS, ...stored };
  elements.filterStars.value = String(filters.minStars);
  elements.filterVerified.checked = !!filters.verifiedOnly;
  elements.filterHelpful.value = filters.minHelpful || '';
  elements.filterDays.value = String(filters.days);
  elements.filterInclude.value = filters.include || '';
  elements.filterExclude.value = filters.exclude || '';
  updateFilterCountBadge();
}

function applyReviewFilters(reviews, filters) {
  const minStars = parseInt(filters.minStars) || 0;
  const verifiedOnly = !!filters.verifiedOnly;
  const minHelpful = parseInt(filters.minHelpful) || 0;
  const days = parseInt(filters.days) || 0;
  const include = (filters.include || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  const exclude = (filters.exclude || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  const cutOff = days ? Date.now() - days * 86400000 : 0;

  return reviews.filter((r) => {
    const stars = parseFloat(r.stars);
    if (minStars && (isNaN(stars) || stars < minStars)) return false;
    if (verifiedOnly && r.verified !== 'Yes') return false;
    const helpful = parseInt(r.helpful) || 0;
    if (minHelpful && helpful < minHelpful) return false;
    if (days) {
      const d = new Date(r.date);
      if (!isNaN(d.getTime()) && d.getTime() < cutOff) return false;
    }
    const text = `${r.title} ${r.description}`.toLowerCase();
    if (include.length && !include.some((k) => k && text.includes(k))) return false;
    if (exclude.length && exclude.some((k) => k && text.includes(k))) return false;
    return true;
  });
}

function groupByProduct(reviews) {
  const map = new Map();
  for (const r of reviews) {
    const key = r.asin || r.productName || 'Unknown Product';
    if (!map.has(key)) {
      map.set(key, { key, label: r.productName || r.asin || 'Unknown Product', reviews: [] });
    }
    map.get(key).reviews.push(r);
  }
  return Array.from(map.values());
}

// ===== User Management Logic =====
async function initUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userState'], (result) => {
      const userState = result.userState;

      if (!userState || !userState.userId || userState.userId.startsWith('user_')) {
        updateUserUI({ userId: '', name: '', coins: 0 });
        resolve();
        return;
      }

      userId = userState.userId || userState.id;
      updateUserUI(userState);

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

// ===== Check saved reviews in IndexedDB =====
let lastShownTotal = 0;

async function checkSavedReviews() {
  let totalReviews = 0;
  try {
    totalReviews = await self.__reviewsDB.countReviews();
  } catch (e) {
    console.error('Failed to count reviews:', e);
  }

  if (totalReviews > 0) {
    elements.resultsSection.classList.remove('hidden');
    if (!elements.resultsList.children.length || totalReviews !== lastShownTotal) {
      lastShownTotal = totalReviews;
      showResultsPreview();
    }
  }
}

// ===== Clear all reviews from IndexedDB =====
async function clearAllReviews() {
  if (!confirm('Delete all saved reviews? This cannot be undone.')) return;
  try {
    await self.__reviewsDB.clearAllReviews();
    elements.resultsSection.classList.add('hidden');
    elements.resultsList.innerHTML = '';
  } catch (e) {
    console.error('Failed to clear reviews:', e);
  }
}

// ===== Check if current tab is an Amazon page =====
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
    // Fetch live state from background service worker first
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (response?.state) {
        // Background is alive — use its live state
        updateUI(response.state);
        resolve();
        return;
      }

      // Background not reachable — read from storage directly
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

        if (state.status === 'running') {
          // SW was restarted — recover to idle
          state.status = 'idle';
          state.progressText = state.progressCount > 0
            ? `Scraping was interrupted. ${state.progressCount} reviews saved.`
            : 'Ready to extract';
          chrome.storage.local.set({ scraperState: state });
        }

        updateUI(state);
        resolve();
      });
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
    } else {
      elements.exportBtn.classList.add('hidden');
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
    userId: userId,
    filters: getFilters()
  });
}

// ===== Stop Extraction Queue =====
function stopExtraction() {
  chrome.runtime.sendMessage({ action: 'STOP_SCRAPING' });
  setStatus('running', 'Stopping extraction...');
}

// ===== Show Results Preview (reads from IndexedDB, grouped by product) =====
async function showResultsPreview() {
  elements.resultsList.innerHTML = '';

  let reviews = [];
  try {
    reviews = await self.__reviewsDB.getAllReviews();
  } catch (e) {
    console.error('Failed to load reviews from IndexedDB:', e);
  }

  const filtered = applyReviewFilters(reviews, getFilters());
  elements.resultsCount.textContent = filtered.length;

  const groups = groupByProduct(filtered);

  if (groups.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'review-card';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--text-muted)';
    empty.style.fontSize = '11px';
    empty.textContent = 'No saved reviews match the current filters.';
    elements.resultsList.appendChild(empty);
    return;
  }

  const PREVIEW_PER_PRODUCT = 5;

  groups.forEach((group) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-group';

    const header = document.createElement('div');
    header.className = 'product-group-header';
    header.innerHTML = `
      <div class="product-group-title">${escapeHtml(group.label)}</div>
      <div class="product-group-meta">
        <span class="product-group-count">${group.reviews.length} reviews</span>
        <span class="product-group-asin">${escapeHtml(group.key)}</span>
      </div>
    `;
    wrapper.appendChild(header);

    const preview = group.reviews.slice(0, PREVIEW_PER_PRODUCT);
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
      wrapper.appendChild(card);
    });

    if (group.reviews.length > PREVIEW_PER_PRODUCT) {
      const more = document.createElement('div');
      more.className = 'review-card';
      more.style.textAlign = 'center';
      more.style.color = 'var(--text-muted)';
      more.style.fontSize = '11px';
      more.textContent = `+ ${group.reviews.length - PREVIEW_PER_PRODUCT} more reviews (export CSV to see all)`;
      wrapper.appendChild(more);
    }

    elements.resultsList.appendChild(wrapper);
  });
}

// ===== Export CSV (reads from IndexedDB, one file per product) =====
async function exportCSV() {
  let reviews = [];
  try {
    reviews = await self.__reviewsDB.getAllReviews();
  } catch (e) {
    console.error('Failed to load reviews from IndexedDB:', e);
  }

  if (reviews.length === 0) return;

  const filtered = applyReviewFilters(reviews, getFilters());
  if (filtered.length === 0) {
    showError('No saved reviews match the current filters.');
    return;
  }

  const groups = groupByProduct(filtered);
  const timestamp = new Date().toISOString().split('T')[0];

  setStatus('running', groups.length > 1
    ? `Generating ${groups.length} CSV files (one per product)...`
    : 'Generating CSV...');

  let exportedAny = false;
  for (const group of groups) {
    const safeName = (group.label || 'amazon-reviews').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const filename = `${safeName}_reviews_${timestamp}.csv`;
    const ok = await exportOneCSV(filename, group.reviews);
    if (ok) exportedAny = true;
    await new Promise((r) => setTimeout(r, 400));
  }

  if (exportedAny) {
    setStatus('success', groups.length > 1
      ? `Exported ${groups.length} files (1 per product)`
      : 'CSV exported');
  } else {
    setStatus('error', 'CSV export failed. Backend unreachable.');
  }
}

async function exportOneCSV(filename, reviews) {
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
      return true;
    }
  } catch (backendErr) {
    console.log('[CSV Export] Backend not available, falling back to local');
  }

  localExportCSV(filename, reviews);
  return true;
}

function localExportCSV(filename, reviews) {
  const headers = ['Name', 'Stars', 'Title', 'Date', 'Location', 'Description', 'Verified Purchase', 'Helpful Votes'];
  const rows = reviews.map((r) => [
    csvEscape(r.name),
    csvEscape(r.stars),
    csvEscape(r.title),
    csvEscape(r.date),
    csvEscape(r.location),
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

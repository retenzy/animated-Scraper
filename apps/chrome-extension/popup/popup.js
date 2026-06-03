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
};

// ===== State =====
let extractedReviews = [];
let productTitle = '';

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await restoreState();
  await checkCurrentPage();
  
  // Listen for real-time progress updates from storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.scraperState) {
      updateUI(changes.scraperState.newValue);
    }
  });
});

// ===== Setup Event Listeners =====
function setupEventListeners() {
  elements.extractBtn.addEventListener('click', startExtraction);
  elements.exportBtn.addEventListener('click', exportCSV);
  elements.stopBtn.addEventListener('click', stopExtraction);
}

// ===== Check if current tab is an Amazon page for product info =====
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const isAmazon = /amazon\.(com|in|co\.uk|de|fr|it|es|ca|co\.jp|com\.au|com\.br|com\.mx|sg|ae|sa)/i.test(tab.url);
    if (!isAmazon) return;

    // Try to get product info from the page
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
    updateUI(state);
  });
}

// ===== Update UI Elements based on Scraper State =====
function updateUI(state) {
  extractedReviews = state.extractedReviews || [];
  
  // 1. Update Status Header
  setStatus(state.status, state.progressText);

  // 2. Adjust visibility of action buttons
  if (state.status === 'running') {
    elements.extractBtn.classList.add('hidden');
    elements.stopBtn.classList.remove('hidden');
    elements.exportBtn.classList.add('hidden');
    elements.progressSection.classList.remove('hidden');
    elements.errorSection.classList.add('hidden');
    
    // Update progress bar
    const total = state.queue.length || 1;
    const current = state.currentIndex || 0;
    const pct = Math.round((current / total) * 100);
    elements.progressFill.style.width = `${pct}%`;
    elements.progressText.textContent = state.progressText;
    elements.progressCount.textContent = `${state.progressCount} reviews`;
  } else {
    elements.extractBtn.classList.remove('hidden');
    elements.stopBtn.classList.add('hidden');
    elements.progressSection.classList.add('hidden');

    if (extractedReviews.length > 0) {
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
  
  // Detect current Amazon tab domain to use as base for simple ASIN inputs
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
      if (resolved) {
        queue.push(resolved);
      }
    }
  }

  if (queue.length === 0) {
    // Fall back to active tab if no URLs/ASINs entered
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
        closeTabAfter = false; // Don't close the user's active tab
      } else {
        showError('Could not parse Amazon URL of active tab.');
        return;
      }
    } catch (err) {
      showError('Unable to access the current tab.');
      return;
    }
  }

  elements.errorSection.classList.add('hidden');
  
  // Send message to service worker
  chrome.runtime.sendMessage({
    action: 'START_SCRAPING',
    queue: queue,
    closeTabAfter: closeTabAfter
  });
}

// ===== Stop Extraction Queue =====
function stopExtraction() {
  chrome.runtime.sendMessage({ action: 'STOP_SCRAPING' });
}

// ===== Show Results Preview =====
function showResults() {
  elements.resultsSection.classList.remove('hidden');
  elements.resultsCount.textContent = extractedReviews.length;
  elements.resultsList.innerHTML = '';

  const preview = extractedReviews.slice(0, 10);
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

  if (extractedReviews.length > 10) {
    const more = document.createElement('div');
    more.className = 'review-card';
    more.style.textAlign = 'center';
    more.style.color = 'var(--text-muted)';
    more.style.fontSize = '11px';
    more.textContent = `+ ${extractedReviews.length - 10} more reviews (export CSV to see all)`;
    elements.resultsList.appendChild(more);
  }
}

// ===== Export CSV =====
async function exportCSV() {
  if (extractedReviews.length === 0) return;

  const safeName = (productTitle || 'amazon-reviews').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${safeName}_reviews_${timestamp}.csv`;

  setStatus('running', 'Generating CSV...');

  try {
    const backendUrl = 'http://localhost:3000';
    console.log('[CSV Export] Attempting backend API call to:', `${backendUrl}/api/csv`);
    
    const response = await fetch(`${backendUrl}/api/csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviews: extractedReviews,
        filename: filename,
      }),
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

  // Fallback to local CSV export
  localExportCSV(filename);
  setStatus('success', 'CSV exported (local)');
}

function localExportCSV(filename) {
  const headers = ['Name', 'Stars', 'Title', 'Date', 'Description', 'Verified Purchase', 'Helpful Votes'];
  const rows = extractedReviews.map((r) => [
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

/**
 * Amazon Reviews Extractor - Background Service Worker
 * Manages the sequential scraping queue, tab lifecycle, and results state
 */

let isRunning = false;
let currentTabId = null;

// Helper to wait
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retrieve scraper state from storage
function getStoredState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['scraperState'], (result) => {
      resolve(result.scraperState || {
        status: 'idle',
        queue: [],
        currentIndex: 0,
        progressText: 'Ready to extract',
        progressCount: 0,
        extractedReviews: [],
        currentProductTitle: ''
      });
    });
  });
}

// Update scraper state in storage
function updateState(updates) {
  return new Promise(async (resolve) => {
    const currentState = await getStoredState();
    const newState = { ...currentState, ...updates };
    chrome.storage.local.set({ scraperState: newState }, () => {
      resolve(newState);
    });
  });
}

// Create a new tab (in background by default)
function createTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tab);
      }
    });
  });
}

// Wait for a tab to finish loading
function waitTabLoaded(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (tab && tab.status === 'complete') {
        resolve();
        return;
      }
      
      function listener(id, info) {
        if (id === tabId && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

// Start the sequential scraping queue
async function startQueue(queue, closeTabAfter) {
  if (isRunning) return;
  isRunning = true;
  
  let allReviews = [];
  
  await updateState({
    status: 'running',
    queue: queue,
    currentIndex: 0,
    progressText: 'Starting scraper queue...',
    progressCount: 0,
    extractedReviews: []
  });

  for (let i = 0; i < queue.length; i++) {
    if (!isRunning) break;
    
    const url = queue[i];
    let tabId = null;
    
    // Extract a human-readable ASIN/product reference for logs
    const asinMatch = url.match(/\b([A-Z0-9]{10})\b/i);
    const productRef = asinMatch ? asinMatch[1] : `Product ${i + 1}`;
    
    try {
      await updateState({
        currentIndex: i,
        progressText: `Loading ${productRef} (${i + 1} of ${queue.length})...`,
        currentProductTitle: productRef
      });
      
      if (!closeTabAfter && i === 0) {
        // Scrape the active tab (don't close it)
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.url) {
          throw new Error('No active Amazon tab found');
        }
        tabId = activeTab.id;
      } else {
        // Open new background tab
        const tab = await createTab(url);
        tabId = tab.id;
        currentTabId = tabId;
        await waitTabLoaded(tabId);
      }
      
      if (!isRunning) {
        if (closeTabAfter && tabId) {
          chrome.tabs.remove(tabId).catch(() => {});
        }
        break;
      }
      
      // Inject content.js
      await updateState({
        progressText: `Extracting ${productRef} (injecting scraper)...`
      });
      
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js'],
        world: 'MAIN'
      });
      
      await updateState({
        progressText: `Extracting ${productRef} (parsing reviews)...`
      });
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => window.__amazonReviewScraper?.extract ? window.__amazonReviewScraper.extract() : { error: 'Scraper not loaded' },
        world: 'MAIN'
      });
      
      const productReviews = results?.[0]?.result;
      if (productReviews && Array.isArray(productReviews)) {
        // Merge and deduplicate (by review ID)
        const beforeCount = allReviews.length;
        const seenIds = new Set(allReviews.map(r => r.id));
        
        for (const review of productReviews) {
          if (!seenIds.has(review.id)) {
            seenIds.add(review.id);
            allReviews.push(review);
          }
        }
        
        const added = allReviews.length - beforeCount;
        console.log(`Successfully scraped ${added} reviews for ${productRef}. Total unique: ${allReviews.length}`);
      } else if (productReviews && productReviews.error) {
        console.error(`Scraper error on ${productRef}:`, productReviews.error);
      }
      
    } catch (err) {
      console.error(`Error scraping ${productRef}:`, err.message || err);
    }
    
    // Close tab if it was a newly created one
    if (closeTabAfter && tabId) {
      chrome.tabs.remove(tabId).catch(() => {});
      currentTabId = null;
    }
    
    // If not the last item, wait for a cooldown (5-10 seconds)
    if (i < queue.length - 1 && isRunning) {
      const cooldownMs = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
      let remainingMs = cooldownMs;
      
      while (remainingMs > 0 && isRunning) {
        await updateState({
          progressText: `Cooldown: waiting ${Math.ceil(remainingMs / 1000)}s before next product...`,
          progressCount: allReviews.length,
          extractedReviews: allReviews
        });
        await delay(1000);
        remainingMs -= 1000;
      }
    }
  }
  
  if (isRunning) {
    // Finished successfully
    isRunning = false;
    currentTabId = null;
    await updateState({
      status: 'success',
      progressText: `Scraping completed! Extracted ${allReviews.length} reviews.`,
      progressCount: allReviews.length,
      extractedReviews: allReviews,
      currentProductTitle: ''
    });
  }
}

// Stop the scraping process
async function stopQueue() {
  if (!isRunning) return;
  isRunning = false;
  
  if (currentTabId) {
    chrome.tabs.remove(currentTabId).catch(() => {});
    currentTabId = null;
  }
  
  const state = await getStoredState();
  await updateState({
    status: 'idle',
    progressText: `Extraction stopped. ${state.extractedReviews.length} reviews collected.`,
    progressCount: state.extractedReviews.length,
    currentProductTitle: ''
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_SCRAPING') {
    startQueue(message.queue, message.closeTabAfter);
    sendResponse({ status: 'started' });
  } else if (message.action === 'STOP_SCRAPING') {
    stopQueue();
    sendResponse({ status: 'stopped' });
  }
  return true;
});

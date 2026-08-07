/**
 * Amazon Review Exporter - Background Service Worker
 * Manages the sequential scraping queue, tab lifecycle, and results state
 */

// Load IndexedDB helper (reviews stay local, never sent to backend)
importScripts('db.js');

let isRunning = false;
let currentTabId = null;
let keepAliveInterval = null;
let scraperTabs = new Set();
let activeScrapeTabId = null;
let runToken = 0;
let stateWriteQueue = Promise.resolve();
let BACKEND_URL = 'https://www.retenzyreviews.com';

// Helper to wait
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep the service worker alive during scraping
function startKeepAlive() {
  stopKeepAlive();
  keepAliveInterval = setInterval(() => {
    chrome.storage.local.get(['scraperState'], () => {});
  }, 20000);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Register this extension with the backend so the dashboard can auto-connect
function registerWithBackend(userId) {
  if (!userId || userId.startsWith('user_')) return;
  const extensionId = chrome.runtime.id;
  fetch(`${BACKEND_URL}/api/extensions/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, extensionId })
  }).catch(() => {});
}

// Retrieve scraper state from storage (chrome.storage + IndexedDB fallback)
async function getStoredState() {
  // Try chrome.storage first (fast)
  const fromStorage = await new Promise((resolve) => {
    chrome.storage.local.get(['scraperState'], (result) => {
      resolve(result.scraperState || null);
    });
  });

  if (fromStorage) return fromStorage;

  // Fallback to IndexedDB backup
  const fromDB = await self.__reviewsDB.loadState();
  if (fromDB) return fromDB;

  // Default state
  return {
    status: 'idle',
    queue: [],
    currentIndex: 0,
    progressText: 'Ready to extract',
    progressCount: 0,
    extractedReviews: [],
    currentProductTitle: ''
  };
}

// Update scraper state in both chrome.storage + IndexedDB.
// Serialized through a promise queue so concurrent callers can't lose each other's writes.
function updateState(updates) {
  const write = stateWriteQueue.then(async () => {
    const currentState = await getStoredState();
    const newState = { ...currentState, ...updates };
    await new Promise((resolve) => {
      chrome.storage.local.set({ scraperState: newState }, async () => {
        // Backup to IndexedDB for persistence across SW restarts
        await self.__reviewsDB.saveState(newState).catch(() => {});
        resolve();
      });
    });
    return newState;
  });
  stateWriteQueue = write.then(() => {}, () => {});
  return write;
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
    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      chrome.tabs.onUpdated.removeListener(updateListener);
      chrome.tabs.onRemoved.removeListener(removeListener);
    };

    const resolveOnce = () => {
      if (finished) return;
      cleanup();
      resolve();
    };

    const updateListener = (id, info) => {
      if (id === tabId && info.status === 'complete') {
        resolveOnce();
      }
    };

    const removeListener = (id, removeInfo) => {
      if (id === tabId) {
        resolveOnce();
      }
    };

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        resolveOnce();
        return;
      }

      if (tab.status === 'complete') {
        resolveOnce();
        return;
      }

      chrome.tabs.onUpdated.addListener(updateListener);
      chrome.tabs.onRemoved.addListener(removeListener);
    });
  });
}

// Start the sequential scraping queue
async function startQueue(queue, closeTabAfter, userId, filters) {
  if (isRunning) return;
  isRunning = true;
  const myRun = runToken;
  startKeepAlive();

  const backendUrl = BACKEND_URL;
  let totalReviewCount = 0;
  const seenIds = new Set();

  await updateState({
    status: 'running',
    queue: queue,
    currentIndex: 0,
    progressText: 'Starting scraper queue...',
    progressCount: 0,
    extractedReviews: []
  });

  try {
    for (let i = 0; i < queue.length; i++) {
    if (!isRunning) break;

    const url = queue[i];
    let tabId = null;
    let keepTabOpen = false;

    const asinMatch = url.match(/\b([A-Z0-9]{10})\b/i);
    const productRef = asinMatch ? asinMatch[1] : `Product ${i + 1}`;
    let jobStatus = 'FAILED';
    let addedCount = 0;

    try {
      // Check user has at least 1 coin before scraping
      const balanceRes = await fetch(`${backendUrl}/api/credits/${userId}`);
      const balanceData = await balanceRes.json().catch(() => null);
      const currentCoins = balanceData?.coins ?? 0;

      if (currentCoins <= 0) {
        isRunning = false;
        stopKeepAlive();
        if (myRun === runToken) {
          await updateState({
            status: 'idle',
            progressText: 'Insufficient coins. Click "+" to buy more.',
            currentProductTitle: ''
          });
        }
        break;
      }

      await updateState({
        currentIndex: i,
        progressText: `Loading ${productRef} (${i + 1} of ${queue.length})...`,
        currentProductTitle: productRef
      });

      if (!closeTabAfter && i === 0) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.url) throw new Error('No active Amazon tab found');
        tabId = activeTab.id;
        activeScrapeTabId = tabId;
        if (activeTab.url !== url) {
          await chrome.tabs.update(tabId, { url });
          await waitTabLoaded(tabId);
        }
      } else {
        const tab = await createTab(url);
        tabId = tab.id;
        currentTabId = tabId;
        scraperTabs.add(tabId);
        await waitTabLoaded(tabId);
      }

      if (!isRunning) {
        if (closeTabAfter && tabId) chrome.tabs.remove(tabId).catch(() => {});
        break;
      }

      await updateState({ progressText: `Extracting ${productRef} (injecting scraper)...` });

      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
        world: 'MAIN'
      });

      await updateState({ progressText: `Extracting ${productRef} (parsing reviews)...` });

      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: (filterOpts) => window.__amazonReviewScraper?.extract
          ? window.__amazonReviewScraper.extract(filterOpts)
          : { error: 'Scraper not loaded' },
        args: [filters || {}],
        world: 'MAIN'
      });

      const productResult = results?.[0]?.result;
      let productReviews = null;
      let productTitle = productRef;

      if (productResult && Array.isArray(productResult)) {
        productReviews = productResult;
      } else if (productResult && Array.isArray(productResult.reviews)) {
        productReviews = productResult.reviews;
        productTitle = productResult.productTitle || productRef;
      }

      if (productReviews) {
        const newReviews = productReviews.filter(r => r.id && !seenIds.has(r.id));
        newReviews.forEach(r => seenIds.add(r.id));
        addedCount = newReviews.length;
        totalReviewCount += addedCount;
        jobStatus = 'SUCCESS';

        if (newReviews.length > 0) {
          try {
            const enriched = newReviews.map(r => ({
              ...r,
              productName: productTitle,
              asin: productRef
            }));
            await self.__reviewsDB.saveReviews(enriched, productRef);
          } catch (dbErr) {
            console.error('IndexedDB save failed:', dbErr);
          }
        }

        const coinsToDeduct = Math.ceil(addedCount / 100);
        const deductRes = await fetch(`${backendUrl}/api/credits/${userId}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productRef, amount: coinsToDeduct })
        });
        const deductData = await deductRes.json().catch(() => null);
        if (deductData?.coins !== undefined) {
          const updatedCoins = deductData.coins;
          chrome.storage.local.get(['userState'], (result) => {
            const userState = result.userState || {};
            userState.coins = updatedCoins;
            chrome.storage.local.set({ userState });
          });
        }

        console.log(`Scraped ${addedCount} reviews for ${productRef} (cost: ${coinsToDeduct} coin${coinsToDeduct > 1 ? 's' : ''}). Session total: ${totalReviewCount}`);
      } else if (productResult?.error) {
        console.error(`Scraper error on ${productRef}:`, productResult.error);
        if (productResult.error === 'LOGIN_REQUIRED' || productResult.error === 'CAPTCHA') {
          jobStatus = 'BLOCKED';
          keepTabOpen = true;
          scraperTabs.delete(tabId);
          currentTabId = null;
          await updateState({
            progressText: `${productRef} needs attention: ${productResult.message || 'Blocked by Amazon'}. The tab is left open for you.`
          });
        }
      }

    } catch (err) {
      console.error(`Error scraping ${productRef}:`, err.message || err);
    }

    fetch(`${backendUrl}/api/scrapes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productRef, url, status: jobStatus, reviewCount: addedCount })
    }).catch(err => console.warn('Failed to log scrape job:', err));

    if (closeTabAfter && tabId && !keepTabOpen) {
      chrome.tabs.remove(tabId).catch(() => {});
      scraperTabs.delete(tabId);
      currentTabId = null;
    }

    if (activeScrapeTabId === tabId) activeScrapeTabId = null;

    if (i < queue.length - 1 && isRunning) {
      const cooldownMs = Math.floor(Math.random() * 5000 + 5000);
      let remainingMs = cooldownMs;

      while (remainingMs > 0 && isRunning) {
        await updateState({
          progressText: `Cooldown: waiting ${Math.ceil(remainingMs / 1000)}s before next product...`,
          progressCount: totalReviewCount
        });
        await delay(1000);
        remainingMs -= 1000;
      }
    }
    }
  } catch (queueErr) {
    console.error('Unhandled queue error:', queueErr);
    isRunning = false;
    stopKeepAlive();
    try {
      if (scraperTabs.size > 0) chrome.tabs.remove(Array.from(scraperTabs)).catch(() => {});
      scraperTabs.clear();
      if (currentTabId) chrome.tabs.remove(currentTabId).catch(() => {});
      currentTabId = null;
    } catch (e) {}
    if (myRun === runToken) {
      await updateState({
        status: 'idle',
        progressText: `Extraction stopped due to an error: ${queueErr?.message || 'unknown error'}`,
        progressCount: totalReviewCount,
        currentProductTitle: ''
      });
    }
  }

  if (isRunning && myRun === runToken) {
    isRunning = false;
    currentTabId = null;
    stopKeepAlive();
    await updateState({
      status: 'success',
      progressText: `Scraping completed! Extracted ${totalReviewCount} reviews.`,
      progressCount: totalReviewCount,
      extractedReviews: [],
      currentProductTitle: ''
    });
  } else {
    const currentState = await getStoredState();
    if (currentState.status === 'running' && myRun === runToken) {
      currentTabId = null;
      stopKeepAlive();
      await updateState({
        status: 'idle',
        progressText: `Extraction stopped. ${currentState.progressCount || 0} reviews collected.`,
        currentProductTitle: ''
      });
    }
  }
}

// Stop the scraping process — kills all scraper tabs and any in-flight extraction
async function stopQueue() {
  isRunning = false;
  runToken++; // Invalidate the current run so it can't overwrite this stop state
  stopKeepAlive();

  if (scraperTabs.size > 0) {
    try {
      chrome.tabs.remove(Array.from(scraperTabs));
    } catch (e) {}
    scraperTabs.clear();
  }
  if (currentTabId) {
    try {
      chrome.tabs.remove(currentTabId);
    } catch (e) {}
    currentTabId = null;
  }
  // Kill in-flight extraction running on the user's active tab by reloading it
  if (activeScrapeTabId) {
    try {
      chrome.tabs.reload(activeScrapeTabId);
    } catch (e) {}
    activeScrapeTabId = null;
  }

  const state = await getStoredState();
  await updateState({
    status: 'idle',
    progressText: `Extraction stopped. ${state.progressCount || 0} reviews collected.`,
    progressCount: state.progressCount || 0,
    currentProductTitle: ''
  });
}

// ===== Startup: Load backend URL + recover any stale state =====
(async () => {
  chrome.storage.local.get(['backendUrl'], (result) => {
    if (result.backendUrl) BACKEND_URL = result.backendUrl;
  });

  const state = await getStoredState();
  if (state.status === 'running') {
    // The queue loop is dead (SW restarted) — reset to idle so the popup un-sticks
    await updateState({
      status: 'idle',
      progressText: `Extraction was interrupted. ${state.progressCount || 0} reviews were saved.`,
      currentProductTitle: ''
    });
    console.warn('[background] Restarted with running state — reset to idle.');
  }
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_SCRAPING') {
    startQueue(message.queue, message.closeTabAfter, message.userId, message.filters);
    sendResponse({ status: 'started' });
  } else if (message.action === 'STOP_SCRAPING') {
    stopQueue().then(() => {
      sendResponse({ status: 'stopped' });
    });
    return true;
  } else if (message.action === 'GET_STATUS') {
    getStoredState().then((state) => {
      sendResponse({ state, isRunning });
    });
    return true;
  }
  return true;
});

// Listen for external messages (e.g. from landing page)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === 'SYNC_USER') {
    const { userId, username, coins } = message;
    if (userId) {
      chrome.storage.local.set({
        userState: { userId, name: username || userId, coins: coins || 0 }
      }, () => {
        console.log(`[background] External user synced: ${userId} (${coins} coins)`);
        registerWithBackend(userId);
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, error: 'No userId provided' });
    }
    return true;
  }
  if (message.action === 'PING') {
    sendResponse({ success: true, version: '1.0.0' });
    return true;
  }
  if (message.action === 'GET_REVIEWS') {
    self.__reviewsDB.getAllReviews().then((reviews) => {
      sendResponse({ success: true, reviews, total: reviews.length });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
  if (message.action === 'GET_REVIEWS_BY_ASIN') {
    self.__reviewsDB.getReviewsByAsin(message.asin).then((reviews) => {
      sendResponse({ success: true, reviews, total: reviews.length });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

// Auto-announce extension ID to the Retenzy dashboard
const extensionId = chrome.runtime.id

window.postMessage({ source: 'retenzy-extension', extensionId }, '*')

(function() {
  'use strict';

  function normalizeText(text) {
    return (text || '').trim().replace(/\s+/g, ' ');
  }

  function getReviewId(box) {
    const idAttr = box.getAttribute('id');
    if (idAttr) return idAttr;
    const customerElement = box.querySelector('a[href*="/gp/customer-reviews/"]');
    const customerHref = customerElement ? customerElement.href : null;
    const match = customerHref ? customerHref.match(/\/R[0-9A-Z]+/i) : null;
    if (match) return match[0];
    const outer = normalizeText(box.textContent).slice(0, 120);
    return outer ? `review:${outer}` : null;
  }

  function parseReviewBoxes(root) {
    const boxes = root.querySelectorAll('[data-hook="review"]');
    const seen = new Set();
    const reviews = [];

    boxes.forEach((box) => {
      const id = getReviewId(box);
      if (!id || seen.has(id)) return;
      seen.add(id);

      const title = normalizeText(
        box.querySelector('[data-hook="review-title"] span:last-child')?.textContent ||
        box.querySelector('[data-hook="review-title"]')?.textContent ||
        box.querySelector('.review-title')?.textContent || ''
      );

      const ratingText = normalizeText(
        box.querySelector('[data-hook="review-star-rating"] .a-icon-alt')?.textContent ||
        box.querySelector('[data-hook="review-star-rating"]')?.textContent ||
        box.querySelector('.a-icon-alt')?.textContent || ''
      );
      const rating = ratingText.match(/([0-9.]+)/)?.[1] || ratingText || '';

      const author = normalizeText(
        box.querySelector('[data-hook="review-author"]')?.textContent ||
        box.querySelector('.a-profile-name')?.textContent || ''
      );

      const dateText = normalizeText(box.querySelector('[data-hook="review-date"]')?.textContent || '');
      const date = dateText.match(/on\s+(.+)$/i)?.[1]?.trim() || dateText;
      const locationMatch = dateText.match(/^Reviewed in\s+(.+?)\s+on\s+/i);
      const location = locationMatch ? locationMatch[1].trim() : '';

      const body = normalizeText(
        box.querySelector('[data-hook="review-body"] span')?.textContent ||
        box.querySelector('[data-hook="review-body"]')?.textContent ||
        box.querySelector('.review-text-content')?.textContent || ''
      );

      const verified = !!box.querySelector('[data-hook="avp-badge"], [data-hook="avp-verified-purchase"], .avp-badge');
      const helpful = normalizeText(box.querySelector('[data-hook="helpful-vote-statement"]')?.textContent || '0').match(/(\d+)/)?.[1] || '0';

      reviews.push({
        id,
        name: author || 'N/A',
        stars: rating || 'N/A',
        title: title || 'N/A',
        date: date || 'N/A',
        location: location || '',
        description: body || 'N/A',
        verified: verified ? 'Yes' : 'No',
        helpful,
      });
    });

    return reviews;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randomDelay(min, max) {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function findLoadMoreButton() {
    // Try to find the button by specific data-hook or class
    const explicit = document.querySelector('a[data-hook="show-more-button"], .a-row.a-spacing-medium.a-spacing-top-extra-large-plus a.a-button-text, .cr-load-more-reviews');
    if (explicit && /more\s+reviews/i.test(explicit.textContent || '')) {
      return explicit;
    }
    
    // Fallback: search all buttons and links on the page for "more reviews" text
    const elements = Array.from(document.querySelectorAll('a, button, span.a-button-text, .a-button-text'));
    return elements.find(el => /more\s+reviews/i.test(el.textContent || ''));
  }

  async function loadMoreReviews() {
    let previousCount = document.querySelectorAll('[data-hook="review"]').length;
    let noNewReviewsCount = 0;
    
    // Keep clicking until the button disappears or no new reviews load
    while (true) {
      const loadMoreBtn = findLoadMoreButton();
      
      // Check if button exists and is visible
      const isVisible = loadMoreBtn && 
                        loadMoreBtn.offsetParent !== null && 
                        window.getComputedStyle(loadMoreBtn).display !== 'none';
      
      let clicked = false;
      if (isVisible) {
          loadMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await randomDelay(300, 600);
          loadMoreBtn.click();
          clicked = true;
      }

      if (!clicked) {
          console.log("Load more button is no longer visible or clickable.");
          break;
      }

      // Dynamically poll for DOM update instead of a hard 2000ms delay
      let loaded = false;
      for (let attempt = 0; attempt < 30; attempt++) { // Max wait 3 seconds (30 * 100ms)
          await delay(100);
          const currentCount = document.querySelectorAll('[data-hook="review"]').length;
          if (currentCount > previousCount) {
              loaded = true;
              break;
          }
      }
      
      const currentCount = document.querySelectorAll('[data-hook="review"]').length;
      if (currentCount <= previousCount) {
          noNewReviewsCount++;
          if (noNewReviewsCount >= 3) {
              console.log("No new reviews loaded after 3 attempts, stopping.");
              break; 
          }
      } else {
          noNewReviewsCount = 0;
          // Add a human-like pause before next check
          await randomDelay(800, 1500);
      }
      previousCount = currentCount;
    }
  }

  async function clickStarFilter(starFilterText) {
    // Check if it's a standard select element
    const selectEl = document.querySelector('select[data-hook="review-star-filter"], select#star-count-dropdown');
    
    if (selectEl) {
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].text.toLowerCase().includes(starFilterText.toLowerCase())) {
                selectEl.selectedIndex = i;
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        }
    }
    
    // Fallback to custom a-dropdown (Amazon usually uses this)
    // Make sure we target only the review star dropdown to avoid clicking header search/delivery dropdowns
    const dropdownTrigger = document.querySelector('[data-hook="review-star-filter"] [data-action="a-dropdown-button"], [data-hook="review-star-filter"] .a-dropdown-prompt, #star-count-dropdown');
    if (dropdownTrigger) {
        dropdownTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await randomDelay(300, 600);
        dropdownTrigger.click(); // Open dropdown
        await randomDelay(400, 500); // Wait for popover to animate and open
        
        // Find the specific option in the dropdown popover
        const options = Array.from(document.querySelectorAll('.a-popover.a-popover-dropdown .a-dropdown-item a, .a-dropdown-item a, .a-popover-dropdown .a-dropdown-link'));
        const option = options.find(o => o.textContent.toLowerCase().includes(starFilterText.toLowerCase()));
        
        if (option) {
            option.click(); // Select the option
            return true;
        } else {
            // Close the dropdown if option not found
            dropdownTrigger.click(); 
        }
    }
    return false;
  }

  function getProductTitle() {
    const sel = document.querySelector('#title, .a-size-large.product-title-word-break, h1');
    if (sel && normalizeText(sel.textContent)) return normalizeText(sel.textContent);
    const t = document.title.match(/reviews?\s*:\s*(.+)$/i);
    return t ? normalizeText(t[1]) : '';
  }

  function applyReviewFilters(reviews, filters) {
    if (!filters) return reviews;
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

  function detectInterstitial() {
    const url = window.location.href;
    const bodyText = (document.body?.innerText || '').slice(0, 2000);

    if (/\/ap\/signin\b|\/ap\/signin\?/i.test(url) ||
        document.querySelector('#ap_signin_form, #ap_container') ||
        (bodyText.includes('Enter mobile number or email') && bodyText.includes('Sign in'))) {
      return { error: 'LOGIN_REQUIRED', message: 'Amazon sign-in required. Log in to Amazon on the open tab, then retry.' };
    }

    if (/\/ap\/otp-verification\b/i.test(url) || document.querySelector('#otp-verification-code')) {
      return { error: 'LOGIN_REQUIRED', message: 'Amazon OTP verification required. Complete it on the open tab, then retry.' };
    }

    if (/captcha|validatecaptcha|robot-check/i.test(url) ||
        document.querySelector('#captchacharacters') ||
        /type the characters you see/i.test(bodyText)) {
      return { error: 'CAPTCHA', message: 'Amazon CAPTCHA detected. Solve it on the open tab, then retry.' };
    }

    return null;
  }

  async function extractAllReviews(filters) {
    const interstitial = detectInterstitial();
    if (interstitial) {
      console.warn('Interstitial detected:', interstitial.message);
      return interstitial;
    }

    let allReviews = [];
    let seenIds = new Set();
    
    const mergeReviews = (newReviews) => {
        for (const r of newReviews) {
            if (!seenIds.has(r.id)) {
                seenIds.add(r.id);
                allReviews.push(r);
            }
        }
    };

    // 1. Scrape all star reviews first (from the default landing view)
    console.log("Scraping default view (All Stars)...");
    await loadMoreReviews();
    mergeReviews(parseReviewBoxes(document));
    console.log("Default view scraping complete. Extracted:", allReviews.length);

    // 2. Loop through 1 to 5 star ratings to extract specific reviews
    const starFilters = ["1 star only", "2 star only", "3 star only", "4 star only", "5 star only"];
    
    for (const filterText of starFilters) {
        console.log("Extracting for:", filterText);
        
        const clicked = await clickStarFilter(filterText);
        if (!clicked) {
            console.log("Could not click filter for:", filterText);
            continue;
        }
        
        // Wait for page/AJAX to reload with new filtered reviews
        await randomDelay(1200, 1800); 
        
        // Load more for this rating
        await loadMoreReviews();
        
        // Extract, merge, and remove duplicates
        const currentReviews = parseReviewBoxes(document);
        const beforeCount = allReviews.length;
        mergeReviews(currentReviews);
        console.log(`Merged ${allReviews.length - beforeCount} new reviews for ${filterText}. Total unique: ${allReviews.length}`);
        
        // Small delay before next filter click to ensure UI is ready
        await randomDelay(500, 1000);
    }
    
    // Optionally reset to "All stars" at the end to be nice
    await clickStarFilter("All stars");
    await randomDelay(800, 1200);
    
    const filtered = applyReviewFilters(allReviews, filters);
    console.log(`Extracted ${allReviews.length} reviews, ${filtered.length} match filters.`);

    return {
      reviews: filtered,
      productTitle: getProductTitle(),
    };
  }

  window.__amazonReviewScraper = {
    extract: extractAllReviews,
  };
})();
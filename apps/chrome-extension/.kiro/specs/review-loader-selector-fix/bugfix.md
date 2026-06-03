# Bugfix Requirements Document

## Introduction

The Amazon review scraper in `content.js` is extracting far fewer reviews than expected (typically 10–13) because phase 1 clicks the wrong element. The `getShowMoreButton()` function uses `a[data-reviews-state-param]` as a fallback selector, which is too broad: it matches histogram star-filter anchors (e.g. `?filterByStar=five_star`) that appear earlier in the DOM than the real "Show 10 more reviews" button. These filter links carry an empty `nextPageToken`, so no valid pagination token is captured. As a result, phase 2 AJAX continuation never runs and extraction stops after the initial page load.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `getShowMoreButton()` searches for the review-loader button AND histogram star-filter anchors with `data-reviews-state-param` appear earlier in the DOM THEN the system selects a histogram filter anchor instead of the real "Show more reviews" button.

1.2 WHEN the histogram filter anchor is selected and `extractTokenFromElement()` is called on it THEN the system parses a `nextPageToken` that is empty or null because the filter link does not carry a valid pagination token.

1.3 WHEN the element that is clicked is a histogram filter anchor (e.g. `href` contains `filterByStar=`) THEN the system applies a star-rating filter to the page rather than loading additional reviews.

1.4 WHEN no valid `nextPageToken` is captured during phase 1 THEN the system enters phase 2 with an empty token and immediately aborts AJAX continuation, leaving extraction stuck at the initial visible reviews (~10–13 reviews).

### Expected Behavior (Correct)

2.1 WHEN `getShowMoreButton()` searches for the review-loader button AND the real "Show X more reviews" button is present in the DOM THEN the system SHALL select only that dedicated review-loader element and not any histogram filter anchor.

2.2 WHEN the real "Show X more reviews" button is selected and `extractTokenFromElement()` is called on it THEN the system SHALL parse a non-empty `nextPageToken` from its `data-reviews-state-param` attribute, enabling AJAX pagination.

2.3 WHEN the element that is clicked is the real review-loader button THEN the system SHALL load additional review items into the DOM without altering the active star-rating filter.

2.4 WHEN a valid `nextPageToken` is captured during phase 1 THEN the system SHALL proceed through phase 2 AJAX continuation and retrieve all available reviews beyond the initial page.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the page has no "Show more reviews" button (e.g. all reviews already visible or fewer than one page of reviews) THEN the system SHALL CONTINUE TO return only the reviews that are already rendered without crashing or erroring.

3.2 WHEN `data-hook="show-more-button"` or `data-hook="show-more-reviews-button"` is present THEN the system SHALL CONTINUE TO select that element directly via the existing explicit data-hook selectors, unaffected by the fix.

3.3 WHEN `[data-action="reviews:show-more"]` wrapper elements are present THEN the system SHALL CONTINUE TO locate the inner anchor via that selector as a higher-priority match before falling back.

3.4 WHEN the real review-loader button is visible and clicked THEN the system SHALL CONTINUE TO capture review boxes from the updated DOM and add them to `allReviews` after each click, as before.

3.5 WHEN the scraper runs on a page whose reviews are fully loaded through phase 1 clicks (no AJAX required) THEN the system SHALL CONTINUE TO return the same complete review set as before the fix.

# scripts/

Frontend HTML migration scripts used during the UI redesign phase.

These Node.js scripts automated the rewriting of HTML pages and JS files
from the original `frontend/` layout to the new `frontend-redesign/` design system.

They are **no longer needed** for normal development but are kept here for
reference in case a page needs to be regenerated from scratch.

## Files

| File | Purpose |
|------|---------|
| rewrite_all_pages.js | Batch-rewrote search, categories, reviews, quotes, subscriptions, latest pages |
| rewrite_index.js | Rewrote index.html hero and sections |
| rewrite_library.js | Rewrote library.html |
| rewrite_auth.js | Rewrote login.html and register elements |
| rewrite_author_details.js | Rewrote author-details.html |
| rewrite_authors.js | Rewrote authors.html |
| rewrite_book_details.js | Rewrote book-details.html |
| rewrite_cart.js | Rewrote cart.html |
| rewrite_profile.js | Rewrote profile.html |
| rewrite_quiz.js | Rewrote quiz.html |
| rewrite_quiz_js.js | Rewrote quiz.js logic |
| rewrite_read_sample.js | Rewrote read-sample.html |
| inject_tailwind.js | Injected tailwind.css link into all HTML pages |

## Usage

```bash
cd d:/bayna-al-sutoor
node frontend-redesign/scripts/rewrite_all_pages.js
```

> ⚠️ These scripts modify files in-place. Always back up before running.

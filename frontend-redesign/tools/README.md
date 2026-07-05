# tools/

Backend seed-data utilities used during initial project setup.

These scripts generated, enriched, and audited the backend `seed_data.json` file.
They are kept here for reference in case the seed data needs to be regenerated.

## Files

| File | Purpose |
|------|---------|
| arabic_seed_generator.js | Generated Arabic book/author seed data from Wikipedia & OpenLibrary APIs |
| enhance_seed.js | Enriched generated seed data with additional fields |
| seed_generator.js | Earlier version of the seed generator |
| fix_authors_previews.js | Fixed author photo URLs and book preview links in seed data |
| fix_reviews.js | Fixed UserId references in the seed data reviews |
| audit_script.js | Audited seed_data.json for placeholder covers/photos |
| final_audit.js | Audited live API responses (requires backend running on port 5033) |

## Usage

```bash
cd d:/bayna-al-sutoor
node frontend-redesign/tools/arabic_seed_generator.js
```

> ⚠️ These scripts write directly to backend/BaynAlSutoor.Persistence/seed_data.json

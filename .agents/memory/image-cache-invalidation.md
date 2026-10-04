---
name: Image cache invalidation
description: Why deleting an opportunity image can appear to work while replacing it shows the previous cached image.
---

An image replacement must persist a new cache version, not merely prepare one before input validation. Server-owned update timestamps must survive validation and be written with the image change.

**Why:** creation-oriented validation can silently strip server-owned timestamps from an update. The saved image path changes, but its public URL stays identical and browsers retain the previous image. Deletion can misleadingly appear correct because it switches to a different poster URL.

**How to apply:** when investigating or changing image writes, verify that two successful replacements produce different public image URLs after validation and persistence. Keep this independent of the chosen storage provider; do not replace R2 or migrate the database to fix a cache-version defect.
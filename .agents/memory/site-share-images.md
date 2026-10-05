---
name: Site link preview images
description: Owner-selected preview images, animation limits and crawler freshness on external Pages hosting.
---

Site link previews should use the configured logo or the owner's chosen/uploaded share image, not a permanently hardcoded old logo. Keep opportunity-specific previews separate.

**Why:** the user explicitly requested the animated logo or a picture they prepare/add as the site's share preview.

MP4 is not an Open Graph image. Offer an image/GIF representation for the provided animated logo and explain that sharing applications can flatten GIF animation to a still frame. Do not promise motion in WhatsApp.

**Why:** animation playback is controlled by the receiving application, not by site settings.

Crawler metadata must be available without running React and must change image versions on saved replacements. Keep tests outside Cloudflare's functions directory so they do not become deployed routes.

**Why:** Pages serves static HTML to social crawlers; browser-only metadata misses them, and reused image URLs leave old previews cached. Files inside the functions directory are deployment inputs.

**How to apply:** preserve Pages/Worker/Render and existing R2, expose the chosen public image through the same-origin API, and maintain crawler-side versioning independently of browser metadata.
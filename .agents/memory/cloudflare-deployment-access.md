---
name: Cloudflare deployment access
description: External deployment permission boundaries and connector upload behavior observed in this project.
---

Check both account-level Worker script access and zone-level Workers Routes edit access before changing production routing. A successful script upload does not prove the token can create research routes.

**Why:** the authorized Cloudflare connection could update the existing API proxy but was denied creation of a route on the site's zone.

**How to apply:** ask the user to grant Zone → Workers Routes → Edit for the existing site when route creation is denied. Keep the Pages custom domains and DNS unchanged.

The connector's multipart module upload received a Cloudflare HTML challenge, even though normal JSON API calls and a legacy JavaScript script upload succeeded.

**Why:** this is an external API/proxy behavior, not a source-code or credential-expiry issue.

**How to apply:** inspect response status and content type before parsing upload responses as JSON. For the existing legacy Worker, a plain JavaScript upload is supported; do not infer that a multipart challenge requires reconnecting an otherwise usable API token.
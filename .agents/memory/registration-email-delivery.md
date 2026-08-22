---
name: Registration email delivery
description: User-facing handling for registration records when transactional email infrastructure is unavailable or partially fails.
---

Registration storage and email delivery are separate outcomes. The registration flow must report an honest delivery state, including a pending state when delivery continues outside the request.

**Why:** A successful database write does not guarantee either the administrative alert or the student's confirmation email was delivered.

**How to apply:** Preserve the registration after email failures, keep SMTP work bounded and outside the write response when possible, return an explicit delivery state from the API, and show neutral success copy unless the relevant email was actually sent.
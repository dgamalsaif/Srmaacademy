---
name: Opportunity registration presentation
description: The user's requirements for title language, shared-link destination, and the scope of opportunity visibility controls.
---

Opportunity titles must appear in English only, without forcing the rest of the site into English.

Copied and shared opportunity links should open the opportunity information and participant registration together, inspired by the reference survey experience but branded SRMA Research Academy. This replaces the earlier preference for opening a separate details page before registration.

Use the dedicated share landing page for copied/shared URLs, with human visitors redirected to the combined survey. Keep registration URLs separate from preview URLs, and make the share page's canonical/Open Graph URL point to itself.

**Why:** on the external hosting setup, direct survey links returned generic Pages metadata while the existing share route returned the correct opportunity image. A share page canonicalized to the generic survey can cause platforms to fetch the wrong metadata again.

The user selected one global control to show or hide complete details for all opportunities, not per-field controls or independent controls for each opportunity. Registration must remain available for open opportunities.

**Why:** these are the user's explicit requirements and selected visibility scope.

Participant Portal sharing must copy an announcement headed «فرصة بحثية جديدة», followed by the English study title, specialty and opportunity link. Social previews must show the opportunity title and image; opening the link must reach «سجل الآن» with the study title, image and participant input fields. This applies to all opportunities.

**Why:** the user explicitly distinguished broken Participant Portal links from working Admin image links and specified this sharing format. The basic title, specialty and image identify the selected study even when additional details are hidden.

**How to apply:** preserve this combined public registration experience when changing cards, metadata, sharing, or admin controls. Do not restore the older details-first sharing flow or introduce a different visibility scope without asking.
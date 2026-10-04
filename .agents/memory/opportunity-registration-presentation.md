---
name: Opportunity registration presentation
description: The user's requirements for title language, shared-link destination, and the scope of opportunity visibility controls.
---

Opportunity titles must appear in English only, without forcing the rest of the site into English.

Copied and shared opportunity links should open the opportunity information and participant registration together, inspired by the reference survey experience but branded SRMA Research Academy. This replaces the earlier preference for opening a separate details page before registration.

Use the dedicated share landing page for copied/shared URLs, with human visitors redirected to the combined survey. Keep registration URLs separate from preview URLs, and make the share page's canonical/Open Graph URL point to itself.

**Why:** on the external hosting setup, direct survey links returned generic Pages metadata while the existing share route returned the correct opportunity image. A share page canonicalized to the generic survey can cause platforms to fetch the wrong metadata again.

The user now wants per-opportunity options to show or hide individual information fields. Keep the existing global details switch as an additional overall control, rather than the only visibility control. Registration must remain available for open opportunities.

**Why:** the user explicitly selected «لكل فرصة على حدة» when asked whether information visibility should be per-opportunity or shared across all opportunities; this supersedes the earlier global-only scope.

Participant Portal sharing must copy an announcement headed «فرصة بحثية جديدة», followed by the English study title, specialty and opportunity link. Social previews must show the opportunity title and image; opening the link must reach «سجل الآن» with the study title, image and participant input fields. This applies to all opportunities.

**Why:** the user explicitly distinguished broken Participant Portal links from working Admin image links and specified this sharing format. The basic title, specialty and image identify the selected study even when additional details are hidden.

**How to apply:** preserve this combined public registration experience when changing cards, metadata, sharing, or admin controls. Do not restore the older details-first sharing flow. Hiding informational fields must not delete their stored values or remove necessary author-role selection or financial consent during registration.

Research-title protection must keep full titles accessible to all visitors. The user chose “جميع الزوار، مع تقليل سهولة النسخ”, not registration-only or staff-only access.

**Why:** the user explicitly selected public visibility after being told that public titles, metadata and images cannot be made completely uncopyable.

**How to apply:** use truthful copy deterrents and attribution while preserving public English titles, announcement sharing and registration. Do not introduce a title-access gate or block clipboard use in form fields. Do not claim screenshots or OCR can be prevented.

Inquiry-button customization must be independent of opportunity sharing and other site settings. Edit and save only its contact channel, destination, labels, messages and enabled state.

**Why:** the user requested changes to “المعلومات الخاصة بالتواصل فقط وليست كل” and explicitly said the opportunity link works.

**How to apply:** preserve opportunity links and announcements. Do not sync inquiry edits into separate contact-channel settings or save unrelated site-wide drafts when saving inquiry preferences.
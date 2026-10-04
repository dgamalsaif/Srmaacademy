---
name: Coordinator permissions
description: The user's strict coordinator scope and the distinction between rejection and deletion.
---

Coordinators may only add students and remove their own students. They must not edit students, approval/rejection status, opportunities, images, site/contact settings, finances, services, account names or access codes.

**Why:** the user requested removing every other editing capability from coordinators: «اريدهم فقط ان يصيفوا الطلاب او يزيلوهم».

**How to apply:** enforce the restriction in both UI and server authorization, including direct requests and future write endpoints. Keep owner management separate; public participant registration remains available.

Rejected registrations are not automatically deleted. The owner must choose deletion and confirm that it is permanent; deleting a registration restores its reserved seat.

**Why:** the user requested an option to delete rejected registrants after rejecting them, not automatic deletion.

**How to apply:** offer explicit rejected-only deletion with confirmation and recheck the status during deletion so a concurrently accepted registration is not removed.
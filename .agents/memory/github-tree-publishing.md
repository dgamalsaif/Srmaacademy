---
name: GitHub tree publishing
description: Reliable connector-based Git tree updates when direct git authentication is unavailable.
---

When publishing a local commit through the GitHub Git Data API, treat status output returned by the CodeExecution shell callback as normalized text: tab separators may disappear. For simple add/modify/delete commits, parse the first character as status and the remainder as the path.

**Why:** Tab-dependent parsing repeatedly merged the status letter into the path. GitHub also rejects a tree with `GitRPC::BadObjectState` when it contains a delete entry for a path already absent from the remote base tree.

**How to apply:** Resolve the remote base tree first, omit deletion entries whose paths are already absent, preserve executable modes from the local tree, and update the branch ref with `force: false`.
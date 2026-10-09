# Network access verification — 9 October 2026

The original public address remains https://khanpanion.vercel.app/. Existing slide QR
codes and the legacy https://dunlo.vercel.app/ address are preserved. Do not redirect
the original site automatically: each origin has its own saved learner progress.

## Findings

The initial failure occurred before HTTP. The current school network's DNS answered
NXDOMAIN for both Vercel addresses, while public resolvers returned valid addresses.
The network answer identified a local authority for the `vercel.app` zone rather than
Vercel's public authority. Vercel reported the production deployment READY, verified
domains and no alias error; a remote fetch returned HTTP 200 for the page and its script.
This was not evidence of a Vercel request-rate limit.

During the same investigation, the school resolver began returning valid IPv4
addresses again. The Mac's system lookup still failed after an unprivileged cache
flush, but a fresh Chrome process loaded the original Vercel URL with HTTP 200 and
rendered the first-visit goal picker. No DNS-server override, VPN, host-file change or
mocked network response was used for that browser check. An administrator-level
resolver flush was unavailable without a password and was not performed.

Different browser/device caches or network resolver paths can explain mixed results
on the same Wi-Fi. The exact cause and time of the school's DNS change are unknown.
Do not promise that the same result covers every access point or device.

## Access with the existing QR

Keep the Vercel URL. On an affected device, fully quit and reopen the browser,
reconnect to Wi-Fi and retry. If the error remains, try another browser or restart
the device. Clear DNS caches only; do not clear website storage or cookies as a
blanket troubleshooting step, because learner progress is device-local.

For persistent NXDOMAIN, school IT must inspect the resolver or filter and clear
the affected negative caches. A site-code change or redirect cannot act until the
device resolves and connects to the hostname. No paid Vercel upgrade is indicated
by the observed failure.

## Free fallback

https://khanacademy-backtrack.github.io/ also serves the complete application. The
existing publishing operation created the delivery repository while this diagnosis
was in progress; it was reused without replacing its workflow or source revision.
The successful initial workflow is
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/actions/runs/37876481709
and its `/release.json` identifies source `fc9b3d93f0accb80793415bf8d19b0e806a93f8a`.

The fallback is an explicitly reviewed release, not an automatic mirror of source
`main`. Its repository README describes **Publish Khanpanion → Run workflow** with
a reviewed full source SHA for later releases. Keep the original source repository
as the source of truth. No new domain purchase or paid service was used.

Live study groups use the existing backend. Its `study-groups` function was updated
from version 2 to version 3 to add only the exact GitHub Pages origin to the CORS
allowlist. Existing origins, private device capabilities, database access and JWT
configuration are unchanged. Preflights for both public addresses returned 204;
an unrelated GitHub Pages origin returned 403. A real browser request from the new
address received the expected 401 when no device capability was supplied.

## Verification and saved progress

The new address passed checks in fresh Chrome contexts at 375 and 1280 pixels on
the current school connection, without DNS overrides or network mocks:

- First visit, goal selection and guide.
- Ten direct routes, including a nested college subject and a full topic lesson.
- Practice answer/position restoration after reload.
- Progress backup download and restore.
- Browser access to the live group endpoint with authentication still enforced.
- No uncaught application errors or failed requests for this site's assets/routes.

The four targeted group tests pass, including allowed/disallowed origins and retained
device checks. The local production build exported 690 pages. Screenshots and raw
browser receipts remain in the worktree's ignored `.refs/school-wifi/` directory.
These checks do not certify uninterrupted third-party video playback or access from
every school network.

Existing progress stays at its original address. To move a study backup, open
**Me → Download a backup** on the original address when reachable, then use
**Me → Restore a backup** on the fallback. Group device credentials are deliberately
excluded from the backup; use a group invitation to join from the new address.

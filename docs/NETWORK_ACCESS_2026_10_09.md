# Network access verification — 9 October 2026

The original public address remains https://khanpanion.vercel.app/. Existing slide QR
codes and the legacy https://dunlo.vercel.app/ address are preserved. Do not redirect
the original site automatically: each origin has its own saved learner progress.

**Latest status, 11:12 Manila: unresolved across the school network.** The school
resolver reverted to authoritative NXDOMAIN after the successful fresh-browser
check. Clearing one device's cache is therefore not a durable fix. Keep the existing
QR, and have the school network administrator correct resolution for its hostname.

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

At 10:57 Manila, direct queries to the network resolver returned NOERROR with valid
IPv4 addresses. At 11:02, the same resolver (`10.128.128.128`) returned authoritative
NXDOMAIN for A, AAAA and HTTPS/TYPE65 queries. Its authority was
`delta.manila.dlsu.edu.ph` for the `vercel.app` zone, with a 3600-second negative-cache
value. In the same comparison, Cloudflare and Google returned valid A records and
the public Vercel DNS authority. Some individual public queries timed out; successful
public responses did not claim the hostname was nonexistent. The evidence proves
inconsistent network resolution over the sampled interval, not the exact internal
filter or DNS-server configuration responsible.

A repeat at 11:12 Manila confirmed the failure: the school resolver returned the
same authoritative NXDOMAIN, while both Cloudflare (`1.1.1.1`) and Google
(`8.8.8.8`) returned valid A records. Vercel still reported production READY with
the original alias attached and no alias error.

## Access with the existing QR

Keep the Vercel URL. On an affected device, fully quit and reopen the browser,
reconnect to Wi-Fi and retry. If the error remains, try another browser or restart
the device. These are temporary recovery steps, not the venue-wide fix. Clear DNS caches only; do not clear website storage or cookies as a
blanket troubleshooting step, because learner progress is device-local.

For persistent NXDOMAIN, school IT must inspect the resolver or filter and clear
the affected negative caches. A site-code change or redirect cannot act until the
device resolves and connects to the hostname. No paid Vercel upgrade is indicated
by the observed failure.

### Required network-wide correction

The school administrator must allow the exact `khanpanion.vercel.app` hostname in
all relevant DNS/filter policies and ensure it resolves through the public DNS
chain instead of the local `vercel.app` override. Apply the correction across all
resolvers and student/guest network segments used in the venue, not just one device.
Use a hostname policy/forwarding exception, not permanently pinned Vercel IPs.
Then clear negative caches on the affected resolvers; previously affected clients
may need a one-time DNS-cache refresh or to wait for their negative entry to expire.

Acceptance requires repeated successful hostname resolution and original-QR loads
on previously failing and newly connected phones and computers, across the venue's
network segments. Recheck after cached successful answers expire. The observed
network-side negative answer permits a cache lifetime of up to one hour. No Vercel
deployment setting can make these school-controlled changes, and this task has no
administrative access to the school's DNS infrastructure. Do not mark the incident
resolved until the network change and these checks are complete.

## Free fallback

https://khanacademy-backtrack.github.io/ also serves the complete application. The
existing publishing operation created the delivery repository while this diagnosis
was in progress; it was reused without replacing its workflow or source revision.
The successful initial workflow is
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/actions/runs/37876481709
and its `/release.json` identifies source `fc9b3d93f0accb80793415bf8d19b0e806a93f8a`.

The first fallback release was pinned to that reviewed commit. The owner subsequently
authorized automatic releases from application `main`. The publishing repository's
workflow now checks main every five minutes, skips unchanged commits and runs tests,
type checking and the static build before deploying a new revision. GitHub can delay
scheduled runs. Keep the application repository as the source of truth; no manual
copy is required. See `GITHUB_PAGES_DEPLOYMENT.md` for verification and recovery.
No new domain purchase or paid service was used.

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

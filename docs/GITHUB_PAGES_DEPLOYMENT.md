# Automatic GitHub Pages releases

Public address: https://khanacademy-backtrack.github.io/

The owner authorized automatic publication from application `main` on 9 October
2026. Vercel's existing Git integration and the original QR address are preserved.

## Release path

Every push to application `main` starts
`.github/workflows/publish-pages.yml` in this repository. This requests and waits
for the publishing workflow, then checks the public revision. GitHub Actions
queueing and the tested build still take time; publication is not instantaneous.

The publishing workflow lives in the separate repository:
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/blob/main/.github/workflows/publish.yml

1. **Publish GitHub Pages after main changes** requests **Publish Khanpanion**
   immediately when application `main` is pushed. The publisher also has scheduled
   checks as a backup, plus manual and workflow-change triggers. Scheduled checks
   alone were insufficient: a later main push had not caused a release, and no
   scheduled run had appeared when the owner reported the stale site.
2. It compares the exact main commit with the publishing repository's
   `deployment.json`, which is written only after a successful, publicly verified
   deployment. Unchanged commits skip the build and deployment.
3. For a new commit, it checks out that exact revision, runs `npm ci`, `npm test`,
   `npm run typecheck` and `npm run build`, and adds `out/release.json` with the
   application repository and commit. Only the static `out/` directory is uploaded.
4. A separate deployment job uses GitHub's normal Pages token and OIDC permissions.
   If application main changed during the build, the older build is skipped and
   the newer push's request or a backup check picks up the newer revision.
5. A separate receipt job confirms the publicly served `release.json` matches the
   tested commit, then saves `deployment.json` in the publishing repository.
   Runs are serialized and receipt commits do not trigger another build.

Tests or build failure leave the last successful site online; failed publication
never advances the stored receipt. The next check retries the unpublished revision.
Both public hosts follow application main, with independent completion times.
Automatic deployment does not repair school DNS filtering.

## Access and scheduling limits

The direct trigger uses the owner's `PAGES_DISPATCH_TOKEN` Actions secret in the
application repository. Create it as a fine-grained token with resource owner
`KhanAcademy-Backtrack`, selected repository `khanacademy-backtrack.github.io`, and
**Actions: read and write** only (plus automatically included metadata access).
No source-code write permission is required. The source workflow never checks out
or executes application code and gives the token only to its dispatch and status
steps. It polls the Actions run API rather than `gh run watch`, which does not
support fine-grained tokens. Never copy a broader local CLI credential into Actions.

Renew the token before its selected expiry and replace the same Actions secret.
A missing, expired or revoked token fails the push-triggered run visibly; it does
not remove the existing site. If the token needs organization approval, complete
that approval before relying on the direct trigger. The token's value and expiry
cannot be read back from the saved Actions secret.

The repository prohibits deploy keys, so the earlier deploy-key approach remains
removed. The publishing workflow reads the public application repository and uses
its own short-lived GitHub workflow tokens. The build job has read-only access;
only the separate deployment and receipt jobs receive their required write scopes.
External Actions are pinned to commit hashes and checkouts do not persist credentials.

GitHub can delay or drop scheduled runs during high load. In a public repository,
schedules can be disabled after 60 days without repository activity. Successful
releases update the receipt and create repository activity, but after a long period
without releases check that **Publish Khanpanion** is still enabled. Re-enable it
from Actions when necessary. This is a documented platform limitation, not a promise
of continuous five-minute delivery. The direct push trigger does not depend on
the schedule. The existing published site remains available.

## Retry, rollback and verification

- Retry a push: rerun **Publish GitHub Pages after main changes** in the application
  repository after resolving the reported token, test, build or publication error.
- Retry directly: **Actions → Publish Khanpanion → Run workflow** in the publishing
  repository. Leave **force** off to skip an already-published revision; turn it on
  only when the current application revision needs rebuilding.
- Roll back: revert the faulty application commit on `main`; the push requests
  a tested release of that new revision.
- Verify the workflow result, public `/release.json` commit, homepage, nested lesson
  and static assets. These checks do not certify third-party video access or every
  school network.

## Verified release

The first workflow-change-triggered run successfully published application
`afc0501e56345053e9519eb3dffbabc9edc5cfb8`:
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/actions/runs/37890836273

It passed 228 tests with one existing content skip, type checking and the 690-page
production build, then deployed and verified the public revision. Direct requests
also passed for Home, Groups, Study, a nested UPCAT lesson and referenced CSS/JavaScript.

A subsequent manual check of unchanged main correctly skipped all build, deployment
and receipt-writing jobs:
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/actions/runs/37891030280

Those initial runs verified the publisher, not a source-push trigger. When the
owner reported the stale site, manual run
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/actions/runs/37892287055
published `6bb2cb7bec6b9a5e5c106c704d2a705e21216b42`, including the new Khan start
section on Home. Direct push-trigger verification is tracked in IMPLEMENTATION_TASKS.md.

API permission and compatibility references:
[workflow dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event),
[workflow status](https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run),
[GitHub CLI watch limitation](https://cli.github.com/manual/gh_run_watch).

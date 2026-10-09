# Automatic GitHub Pages releases

Public address: https://khanacademy-backtrack.github.io/

The owner authorized automatic publication from application `main` on 9 October
2026. Vercel's existing Git integration and the original QR address are preserved.

## Release path

The workflow lives in the publishing repository:
https://github.com/KhanAcademy-Backtrack/khanacademy-backtrack.github.io/blob/main/.github/workflows/publish.yml

1. **Publish Khanpanion** checks application `main` on a five-minute schedule,
   offset from the start of the hour. Workflow changes and manual runs also trigger
   a check. GitHub may delay scheduled runs; this is not an immediate push hook.
2. It compares the exact main commit with the publishing repository's
   `deployment.json`, which is written only after a successful, publicly verified
   deployment. Unchanged commits skip the build and deployment.
3. For a new commit, it checks out that exact revision, runs `npm ci`, `npm test`,
   `npm run typecheck` and `npm run build`, and adds `out/release.json` with the
   application repository and commit. Only the static `out/` directory is uploaded.
4. A separate deployment job uses GitHub's normal Pages token and OIDC permissions.
   If application main changed during the build, the older build is skipped and
   the next scheduled check picks up the newer revision.
5. A separate receipt job confirms the publicly served `release.json` matches the
   tested commit, then saves `deployment.json` in the publishing repository.
   Runs are serialized and receipt commits do not trigger another build.

Tests or build failure leave the last successful site online; failed publication
never advances the stored receipt. The next check retries the unpublished revision.
Both public hosts follow application main, with independent completion times.
Automatic deployment does not repair school DNS filtering.

## Access and scheduling limits

No personal access token, SSH deploy key or new account is required. The repository
prohibits deploy keys, so the attempted cross-repository push setup was removed;
no deploy key or corresponding secret was created, and its empty environment was
removed. The publishing workflow reads the public application repository and uses
only its own short-lived GitHub workflow tokens. The build job has read-only access;
only the separate deployment and receipt jobs receive their required write scopes.
External Actions are pinned to commit hashes and checkouts do not persist credentials.

GitHub can delay or drop scheduled runs during high load. In a public repository,
schedules can be disabled after 60 days without repository activity. Successful
releases update the receipt and create repository activity, but after a long period
without releases check that **Publish Khanpanion** is still enabled. Re-enable it
from Actions when necessary. This is a documented platform limitation, not a promise
of continuous five-minute delivery. The existing published site remains available.

## Retry, rollback and verification

- Retry now: **Actions → Publish Khanpanion → Run workflow** in the publishing
  repository. Leave **force** off to skip an already-published revision; turn it on
  only when the current application revision needs rebuilding.
- Roll back: revert the faulty application commit on `main`; the next check tests
  and publishes that new revision. A manual run can start the check sooner.
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

The scheduled workflow is enabled. These checks prove the workflow's changed and
unchanged paths; they do not turn GitHub's scheduled delivery into a timing guarantee.

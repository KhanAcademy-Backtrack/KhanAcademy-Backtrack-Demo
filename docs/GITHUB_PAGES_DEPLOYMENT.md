# Automatic GitHub Pages releases

Public address: https://khanacademy-backtrack.github.io/

The owner authorized automatic publication from application `main` on 9 October
2026. Vercel's existing Git integration and the original QR address are preserved.

## Release path

1. A push to `main` starts this repository's **Publish GitHub Pages** workflow.
2. Its build job checks out the exact source revision, runs `npm ci`, `npm test`,
   `npm run typecheck` and `npm run build`, and records the revision in
   `out/release.json`. It uploads only the static `out/` directory.
3. A separate publication job downloads that run's artifact, validates its receipt
   and files, and copies it into `site/` in
   `KhanAcademy-Backtrack/khanacademy-backtrack.github.io`. It commits and pushes
   without force. If a newer application main revision already exists, the older
   build yields to the newer workflow. Both pipelines serialize deployments.
4. The publishing repository's **Publish Khanpanion** workflow packages `site/`
   and deploys with GitHub Pages. Its push trigger watches `site/**` on `main`.

A failed test, type check or build cannot reach publication. Failed final deployment
leaves the previous successful Pages release available. The two hosts finish
independently; compare `/release.json` on Pages with the intended source SHA.
Automatic deployment does not repair school DNS filtering.

## Credential scope

The application repository's `github-pages-publishing` environment permits only
`main`. Its `PAGES_DEPLOY_KEY` secret is an SSH key whose public half is registered
as a write-enabled deploy key only on the publishing repository. The private key
is not committed or exposed to the build job. The publication job does not run
application or dependency scripts. It pins GitHub's SSH host key and removes its
temporary key files when the step exits. Actions are pinned to commit hashes and
checkouts disable persisted credentials.

The normal workflow token is repository-scoped and cannot publish into the separate
delivery repository. The deploy-key push can also trigger its downstream workflow.
No personal access token is stored. To revoke publication access, remove the delivery
repository's `Khanpanion automatic Pages publishing` deploy key and the corresponding
environment secret. To rotate access, replace both halves with a new matched pair.

## Retry, rollback and verification

- Retry build/publication: run **Publish GitHub Pages** manually on `main` in the
  application repository.
- Retry final hosting: run **Publish Khanpanion** manually in the publishing
  repository. This republishes its already-tested `site/` files.
- Roll back source: revert the faulty application commit on `main`; the same
  checks and release path run automatically.
- Verify both workflow results, the public `/release.json` commit, the homepage,
  a nested lesson and its static assets. These checks do not certify external
  video services or access from all school networks.

Initial end-to-end verification remains pending until the actual source push and
downstream deployment finish.

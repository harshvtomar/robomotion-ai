# RoboMotion AI — GitHub and public deployment guide

This source ZIP is not yet published to a public GitHub repository or a live website. The workflow is present but **opt-in**, and deployment must be checked with an actual browser afterward.

## Local Mac verification

1. Extract the entire Stage 8 ZIP (includes `.git` history). Open Terminal in `robomotion-ai-stage8`.
2. Run `node --version` (Node 22.12+ recommended), `npm install`, `npm test`, `npm run typecheck`, `npm run build`, and `npm run audit:release`.
3. Run `npm run report:bundle`. Inspect `reports/bundle-report.json` for actual bundle sizes; warnings alone do not establish bad user performance.
4. Run `npm run dev`; Vite may choose another port because older Stage servers remain open. Use the exact `127.0.0.1` URL printed.
5. Complete `docs/RELEASE_QA_CHECKLIST.md`; record failed and passed cases.

## GitHub setup — explicit action by repository owner

1. Create a GitHub repository (suggested `robomotion-ai`), preferably after reviewing the full ZIP for secrets/license.
2. In Terminal from Stage 8 folder: `git status`, `git remote -v`, `git remote add origin https://github.com/YOUR_USERNAME/robomotion-ai.git` (only if `origin` is absent), `git branch -M main`, `git push -u origin main`.
3. For reproducible CI, run `npm install --package-lock-only` once while online, then `git add package-lock.json && git commit -m 'Lock dependency tree' && git push`. The current ZIP does NOT contain a lockfile; both workflows fall back to `npm install` until one is committed.
4. Confirm **RoboMotion AI — Tests and Build** GitHub Action passes. Do not claim hosted CI until that run is actually green.

## GitHub Pages (optional)

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Actions → **RoboMotion AI — GitHub Pages (opt-in)** → Run workflow. It deploys only on `workflow_dispatch`, not on every push.
3. Workflow sets `VITE_BASE_PATH=/<repository-name>/` for Vite asset URLs. For local preview, default base `/` is used. If you rename the repository, rerun deployment.
4. Wait for deployment job success and inspect the reported URL (usually `https://YOUR_USERNAME.github.io/robomotion-ai/`). This is an **example**, not a verified live URL.
5. Test all M01–M19 checks again on the hosted version. GitHub Pages is HTTPS so browser camera permissions may work, subject to browser permissions and external model/WASM availability.

## Privacy/network and security constraints

- The webcam is **opt-in** and access is requested only by an explicit Start action.
- MediaPipe WASM/model are fetched from external third-party origins (Google storage and jsDelivr) on first use; an offline install is not complete webcam support.
- The app does not intentionally upload camera frames or record landmark arrays. MediaPipe third-party SDK behavior is not independently audited; the SDK may collect diagnostics.
- Exported diagnostics are enumerated simulation events and timestamps. Review the actual downloaded CSV/JSON before publication.
- No physical robot/hardware command path exists. Simulated collision sampling does not guarantee physical safety.

## Rollback

Previous source remains available in the Stage 7 archive and Git commit `e9d3705`. Keep a source backup before release. Never edit the original Stage 7 directory to apply Stage 8 changes.

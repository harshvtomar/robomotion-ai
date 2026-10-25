# ChatGPT Work integration checkpoint

There is no remote repository or deployment yet. First, upload Stage 1 ZIP or open the extracted local project with ChatGPT Work; do not regenerate the entire scaffold.

1. Inspect source, `PROJECT_STATE.md`, and `docs/QA.md`.
2. With working network, run `npm install`, check package peers, commit `package-lock.json`.
3. Run `npm test`, `npm run typecheck`, `npm run build` and fix any genuine errors.
4. Start dev server and test camera, grid, axes, animation, reset in real browser. Record screenshots and console findings.
5. Only then set up remote GitHub repo and optional deployment if explicitly requested; do not claim published before verifying.
6. When moving to Stage 2, preserve all Stage 1 code and rollback path.

Stage 1 does not require Work if the user's Mac can complete browser checks. Work is a fallback for tooling and deployment.

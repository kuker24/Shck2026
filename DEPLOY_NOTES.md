# Deployment Notes — Aegis-IDX mock demo

## Recommended path: Vercel CLI

The `frontend/` app builds successfully and is safe to publish as a **mock-only** demo. It uses bundled mock JSON when `NEXT_PUBLIC_API_URL` is unset, so no backend or Sectors API key is needed.

From the checkout:

```bash
cd frontend
npx vercel login
npx vercel --prod
```

Keep `NEXT_PUBLIC_API_URL` unset for the public mock demo. Do **not** add `SECTORS_API_KEY` to Vercel or to any browser-facing environment variable. If a real backend is deployed later, set only `NEXT_PUBLIC_API_URL` to that backend URL and configure backend CORS separately.

**Blocker:** Vercel CLI requires Fahmi's Vercel login/account and project confirmation. No Vercel deployment was attempted from this checkout.

## GitHub Pages

GitHub Pages is not ready as-is: this repository does not currently configure Next.js static export or a Pages workflow. It could host the mock UI after adding `output: 'export'` (plus any image/base-path settings required for a project site) and a GitHub Actions workflow that builds and publishes `frontend/out`. That is an extra code/CI change and is not required for the submission.

## No-host fallback

Video + repo only is OK when cloud deployment is unavailable: use a short screen recording or a few screenshots of the mock flow, together with this repository. Demonstrate the BBCA mock investigation, Planner -> Executor -> Critic steps, broker table, free-float card, narrative, and permanent disclaimer. The README already documents the local commands and mock mode.

## Submission checklist

- [x] `npm run build` passes in `frontend/`.
- [x] Mock mode needs 0 Sectors credits and no API key.
- [ ] Fahmi logs in to Vercel and runs the production deployment, **or** records the mock demo.
- [ ] If deploying the backend, keep `SECTORS_API_KEY` server-side only and update CORS for the deployed frontend origin.

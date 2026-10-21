# Project guide for AI sessions

## Purpose and locations

**Slpixe Video Comment Search** lets people sign in with Google, enter a YouTube
video ID or URL, browse/search its public comments, expand replies and load more
pages. A blank search term browses comments; `video` and `query` URL parameters
make searches shareable. The app reads public data and has no posting/editing flow.

- Local checkout: `/Users/slpixe/web/js/video-comments-search` (`~/web/js/video-comments-search`).
- GitHub: https://github.com/slpixe/Video-Comments-Search
- Git remote: `git@github.com:slpixe/Video-Comments-Search.git`; main branch: `master`.
- Production: https://video-comment-search.slpixe.com/
- DNS configuration: `~/web/me/domains/dns.tf`, managed by that repo's GitLab workflow.

## Architecture and navigation

This is a static React/TypeScript app built with Vite and Material UI. It runs
entirely in the browser; there is no application backend or account database.

- `src/index.tsx` and `src/App.tsx`: startup, theme and real/mock provider selection.
- `src/VideoCommentsSearch.tsx`: search form, URL state, results and pagination.
- `src/api/youtube.ts`: video URL parsing and YouTube comment/reply HTTP requests.
- `src/auth/`: Google popup login and expiring tokens in `sessionStorage`.
- `src/components/CommentItem.tsx`: reply loading, retry and expansion.
- `src/mocks/`: shared MSW handlers/fixtures for development, unit tests and Storybook.
- `e2e/` and `storybook-tests/`: Playwright user journeys and rendered story checks.
- `public/privacy.html`, `public/terms.html` and `public/CNAME`: published policy/domain files.

## Development and verification

Use the Node requirement and pinned pnpm version in `package.json`. Start with
`pnpm install --frozen-lockfile`, then `pnpm start:mock` for development without
Google credentials or API quota. Mock mode explicitly simulates login and data;
it cannot prove real Google login or production API access.

Read `README.md` for mock scenarios, real local configuration and individual test
commands. `pnpm check` runs type checking, unit tests, production build, desktop/
mobile E2E tests and Storybook checks; install Playwright Chromium first if needed.
Use focused checks while editing and run relevant broader checks before publishing.
Keep test ports available: E2E uses 4173, Storybook checks 6007 (interactive UI 6006).

## Authentication and API contract

Google login requests **openid/email/profile only**, with
`include_granted_scopes: false`. Public comments and replies use the **app owner's
restricted API key**, without an OAuth bearer token. Users share this project's
quota; Google login does not supply personal keys. The browser login gate is a
user flow, not a server-enforced access or quota boundary.

Production receives `VITE_YOUTUBE_API_KEY` from this repository's Actions secret
at build time. Its key is restricted to `https://video-comment-search.slpixe.com/*`
and **YouTube Data API v3 only**. A local real-API setup needs a separately
restricted development key; the production key rejects localhost. OAuth client
IDs and compiled website keys are public browser configuration. Keep credential
values out of source/docs/logs and keep private credentials out of `VITE_` variables.

Before changing login, scopes, credentials, branding or domain configuration,
read the **Current status** section of `docs/oauth-recovery.md`. Historical
sections explain earlier failures and are not pending tasks. In particular,
`youtube.readonly` does not authorize the comment-list endpoints. The broader
`youtube.force-ssl` scope permits edits/deletion and is outside this app's current
design; preserve public API-key reads rather than restoring the old scope flow.
An API-key error is independent of the user's Google session.

## Production workflow

`.github/workflows/gh-pages.yml` is the deployment source of truth. Pull requests
run checks; a successful push to `master` builds and publishes to `gh-pages`,
which GitHub Pages serves at the custom domain. Treat `gh-pages` and build outputs
as generated artifacts. Use the checked workflow for releases and the domains
repo's workflow for DNS changes.

The production base path is `/`. Branding **Slpixe Video Comment Search** was
verified/published by Google; the current basic login scopes require no sensitive-
scope review or demo video. Real login, public filtering, pagination and replies
were verified on 12 October 2026. For a release affecting these flows, distinguish
mock test results from real production checks and record new external findings
in `docs/oauth-recovery.md`. Check current Console/live state before treating
dated verification evidence as current.

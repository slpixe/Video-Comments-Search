# Video Comments Search

Search public comments on a YouTube video, expand replies, and load further pages.
Paste a video ID, a watch URL, a short link, or a Shorts link. Search terms are
optional. Share a search using the `video` and `query` URL parameters.

The custom domain prepared by this update is
[video-comment-search.slpixe.com](https://video-comment-search.slpixe.com/).
Until the domain rollout is complete, the existing site is at
[GitHub Pages](https://slpixe.github.io/Video-Comments-Search/).

## Local development

Use Node 22.12 or newer (CI uses Node 24) and the pinned pnpm version:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm start:mock
```

Mock mode uses MSW in the browser and a simulated Google login. No Google
credentials or API quota are needed. Click **Login with Google**, then use any
valid video ID, such as `kJQP7kiw5Fk`. Fixtures include replies and a second page;
search terms filter the fixture comments. The banner makes mock mode explicit.

| Mock video ID | Scenario |
| --- | --- |
| `empty000000` | No results |
| `quota000000` | Quota exceeded |
| `disabled000` | Comments disabled |
| `expired0000` | Expired Google session |
| `slow0000000` | Two-second response |

`src/mocks/handlers.ts` is shared by the dev worker, Vitest's in-process mock
server, and Storybook. There is no separate backend to start. After an MSW
upgrade, regenerate its worker with `pnpm exec msw init public --save`.

For real Google login, configure the public OAuth client ID in `.env.local`
(see `.env.example`), allow your local origin in Google Cloud, and run
`pnpm start`. Mocks are opt-in and disabled in production, even if built with
`--mode mock`. OAuth client IDs are public browser configuration; never place
client secrets or private API keys in `VITE_` variables. The existing `.env`
contains only the public client ID and remains tracked for the deployment.

## Checks and component development

```sh
pnpm typecheck
pnpm test                 # unit and component integration tests
pnpm test:watch
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e             # desktop and mobile Chromium, isolated mock app
pnpm test:e2e:ui
pnpm storybook            # port 6006, shared MSW fixtures, light/dark toolbar
pnpm build:storybook
pnpm test:stories        # rendered Storybook states in Chromium
pnpm build
pnpm check                # all of the above verification, once browsers are installed
```

Unit tests cover token restoration, expiry, malformed/blocked storage, login
failures, video URL parsing, HTTP errors, search, pagination, cancellation,
navigation, and reply retry/caching. Playwright covers the complete mock user
journey, query filtering, empty/error/session states, mobile layout and the
privacy page. It cannot verify Google's live consent screen or app verification.
Storybook includes logged-out, ready, results, empty, loading, quota error, expired
session, and comment/reply states; several stories have interaction assertions.

The Playwright server uses port 4173. Keep that port free to avoid accidentally
reusing an unrelated server. Traces and HTML reports are retained for failures.

## Deployment and OAuth recovery

GitHub Actions checks pull requests and pushes to `master`, then deploys only a
successful `master` build to `gh-pages`. The redundant manual `gh-pages` CLI
was removed; publishing now uses this checked workflow. Type checking, coverage tests,
Playwright and the Storybook build all run before publishing. The production
base path defaults to `/` for the custom domain; set
`VITE_BASE_PATH=/Video-Comments-Search/` for the legacy project URL.

The DNS declaration lives in `~/web/me/domains/dns.tf` and is applied by that
repo's GitLab workflow. See [OAuth recovery and domain rollout](docs/oauth-recovery.md)
for the outstanding external steps and the Google email findings.

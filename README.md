# Video Comments Search

Search public comments on a YouTube video, expand replies, and load further pages.
Paste a video ID, a watch URL, a short link, or a Shorts link. Search terms are
optional. Use **Copy search link** above the results to share the video and query;
if clipboard access is unavailable, the app provides a selectable link. Searches
use the `video` and `query` URL parameters.

The live site is [video-comment-search.slpixe.com](https://video-comment-search.slpixe.com/).

Google login requests basic sign-in permissions only. Public comment and reply
requests use the app owner's restricted YouTube API key, with no OAuth bearer
token. Signing in does not supply a personal API key or separate project quota.
The browser login gate is a user flow, not a server-enforced quota or access limit.

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
| `keybad00000` | API key rejected (Google session stays signed in) |
| `slow0000000` | Two-second response |

`src/mocks/handlers.ts` is shared by the dev worker, Vitest's in-process mock
server, and Storybook. There is no separate backend to start. After an MSW
upgrade, regenerate its worker with `pnpm exec msw init public --save`.

For real login and searches, configure `VITE_GOOGLE_CLIENT_ID` and
`VITE_YOUTUBE_API_KEY` in `.env.local` (see `.env.example`). Enable YouTube Data
API v3, allow the local OAuth origin, and restrict a development API key to the
exact local website origin and YouTube Data API v3. The production key permits
only `https://video-comment-search.slpixe.com/*` and will reject local requests.
Run `pnpm start`. Mocks are opt-in and disabled in production even with `--mode mock`.

OAuth client IDs and website API keys are visible browser configuration. Never
put OAuth client secrets, unrestricted keys or private server credentials in
`VITE_` variables. Production obtains its restricted key from the repository's
`VITE_YOUTUBE_API_KEY` Actions secret at build time; the compiled key is public.
Tests and Storybook use a dummy key, and MSW rejects OAuth bearer requests.

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
Storybook includes logged-out, ready, results, empty, loading, quota error, rejected
API key, and comment/reply states; several stories have interaction assertions.

The Playwright server uses port 4173. Keep that port free to avoid accidentally
reusing an unrelated server. Traces and HTML reports are retained for failures.

## App icons

The Sculpted Coral icon combines a folded comment bubble, a search lens and a
play symbol. Its transparent imagegen master is saved in
`assets/branding/sculpted-coral-master.png`; the editing prompt is beside it in
`assets/branding/imagegen-prompt.txt`. The header, favicons and home-screen icons
all use exports of this artwork. The old unused SVG logos have been removed.

After installing dependencies and Playwright Chromium, regenerate the committed
assets with `pnpm icons:generate`. This exports transparent PNGs, a multi-size
ICO, an opaque Apple touch icon, a maskable Android icon with safe padding, and
a monochrome Safari pinned-tab mask. Regeneration is a development task and
does not run during a production build.

## Deployment and OAuth recovery

Optional PostHog usage/conversion and error reporting is described in
[Monitoring setup](docs/monitoring.md). It requires production build configuration
and project privacy settings before activation. Local and mock runs send no
telemetry; there are no scheduled availability checks.

GitHub Actions checks pull requests and pushes to `master`, then deploys only a
successful `master` build to `gh-pages`. The redundant manual `gh-pages` CLI
was removed; publishing now uses this checked workflow. Type checking, coverage tests,
Playwright and the Storybook build all run before publishing. The production
base path defaults to `/` for the custom domain; set
`VITE_BASE_PATH=/Video-Comments-Search/` for the legacy project URL.

The DNS declaration lives in `~/web/me/domains/dns.tf` and is applied by that
repo's GitLab workflow. See [OAuth recovery and domain rollout](docs/oauth-recovery.md)
for the outstanding external steps and the Google email findings.

# Usage and error monitoring

PostHog is the single destination for usage/conversion events and error reports.
There are no uptime probes, scheduled availability checks, or session recordings.
Google login and the shared YouTube API quota are unchanged.

## Activation

The integration stays disabled until production build configuration is supplied.
It only initializes on `https://video-comment-search.slpixe.com` in a production
build, so development, mocks, Storybook and preview hosts do not send events.

1. Select a PostHog project and its region. Enable **Cookieless server hash mode**
   in the project's Web analytics settings; otherwise these events are ignored.
2. Enable **Discard client IP data** in project settings before activation.
   The SDK's deprecated `ip` setting does not control IP retention. Disable
   session replay, autocapture and person profiles; the app also disables these
   features locally. Do not add transformations which retain personal data.
3. Put the project's **public ingestion token** in the repository Actions secret
   `VITE_POSTHOG_KEY`. Set repository variable `VITE_POSTHOG_HOST` to
   `https://eu.i.posthog.com` or `https://us.i.posthog.com`, matching its region.
   Never put a personal/admin PostHog API key in a `VITE_` variable.
4. Deploy through the checked `master` workflow with the updated privacy policy.
5. On production, perform a genuine login, search, pagination and reply expansion.
   Verify events arrive in PostHog, inspect event properties, and check that no
   search text, video/comment identifiers, Google tokens or YouTube keys appear.
   Development/mock tests do not verify PostHog ingestion or real Google login.

On 21 October 2026, a separate EU-hosted **Video Comment Search** organization
and its **Video Comment Search** project (315525) were configured under the
existing user account. Project settings use Europe/London reporting, discard
client IP data, and enable stateless cookieless server hashing. The existing
**Slpixe / Picary** project remains separate. The one-project limit is per
organization; PostHog supports multiple organizations under one user account.
The repository's PostHog ingestion-token secret and EU host variable are set.
Production event ingestion, dashboard verification, and notifications are
pending deployment and the first real usage check.

`video-comment-search@slpixe.com` is an inbound Cloudflare forwarding alias to
the existing `slpixe@gmail.com` destination, applied through
[domains MR !34](https://gitlab.com/slpixe/domains/-/merge_requests/34).
It is not a separate mailbox and is not needed for another PostHog login.

## Events and dashboard

| Event | Meaning / properties |
| --- | --- |
| `$pageview` | One app load, with the URL reduced to the homepage |
| `login_started`, `login_succeeded` | Login funnel; no account identifiers |
| `login_failed` | `reason`: OAuth failure, blocked popup, or closed popup |
| `session_restored`, `session_expired` | Existing session restored or expired |
| `search_started` | `has_query` boolean; never the search text |
| `search_succeeded` | `has_query`, page `result_count`, `duration_ms`; zero results is success |
| `search_failed` | Safe `reason` category and `duration_ms` |
| `comments_page_loaded`, `comments_page_failed` | Subsequent comment pages, separate from initial-search conversion |
| `replies_opened`, `replies_loaded`, `replies_failed` | Reply engagement and load outcomes |
| `search_link_shared` | Clipboard success or manual fallback shown; fallback does not prove a copy occurred |
| `$exception` | Runtime, render, startup and actionable handled failures |

Create a dashboard with:

- Daily visits and estimated visitors. Cookieless counts are estimates, not
  authenticated users; ad blockers and privacy signals can reduce coverage.
- New-login funnel: `$pageview` → `login_started` → `login_succeeded` →
  `search_succeeded`. Restored sessions skip login, so also show the overall
  `$pageview` → `search_succeeded` funnel.
- Search completion: `search_started` → `search_succeeded`, including a separate
  zero-result rate (`result_count = 0`). Break down by `has_query` and device.
- Search/reply latency and failures by reason; count pagination separately.
- Reply and sharing engagement; show clipboard success separately from fallback.

Create an error-tracking notification rule for new application issues in the
selected project. Popup cancellation and normal unavailable-video conditions
are usage events rather than exception reports. Quota, rejected-key, network and
server failures are reported. Abort/cancelled search requests are ignored.

## Privacy and diagnostic limits

`src/telemetry.ts` rebuilds every outgoing event from a property allowlist.
Original exception messages, causes, source excerpts, breadcrumbs, referrers,
URL parameters, account details and arbitrary event properties are omitted.
Only production `/assets/*.js` frame locations and line/column numbers survive.
No automatic clicks, recordings, console logs, network traces or performance
autocapture are enabled. Do Not Track and Global Privacy Control disable the
integration. Analytics never block app startup or an interaction.

Error messages are deliberately generic; error category, location and stack
frames provide debugging context. Private source-map upload is not configured,
so production stacks initially refer to built JavaScript. If readable source
stacks become necessary, add private source-map upload with a separate CI-only
credential and remove maps from the published site artifact.

## Quota alerts checked on 21 October 2026

Cloud Monitoring's Alerting page for `video-comments-search` showed **0 alert
policies** and an empty policy table. No quota alerts are configured there.
No notification channels or policies were created as part of this check.

Recommended next setup: notifications at 80% and 95% of the daily YouTube quota,
with a confirmed delivery channel. Alerts do not stop abuse or allocate quota
per user. Everyone shares the owner's project allowance; the browser login gate
does not enforce per-user access or rate limits. Broader public use should be
paired with a backend quota budget, rate limits and caching, with YouTube reads
behind that enforcement boundary. Keep the existing UI login for now.

References: [PostHog cookieless tracking](https://posthog.com/docs/privacy/data-collection),
[event filtering and configuration](https://posthog.com/docs/libraries/js/config),
[IP data controls](https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address).

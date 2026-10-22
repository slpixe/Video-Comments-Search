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
The [usage dashboard](https://eu.posthog.com/project/315525/dashboard/1044543)
contains daily visits, login/search funnels, search outcomes, engagement and
failures. Daily error email checks are configured as described below. The free
plan was selected without adding a payment method.

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

The dashboard provides the core measures below; further breakdowns can be added
as traffic grows:

- Daily visits and estimated visitors. Cookieless counts are estimates, not
  authenticated users; ad blockers and privacy signals can reduce coverage.
- New-login funnel: `$pageview` → `login_started` → `login_succeeded` →
  `search_succeeded`. Restored sessions skip login, so also show the overall
  `$pageview` → `search_succeeded` funnel.
- Search completion: `search_started` → `search_succeeded`, including a separate
  zero-result rate (`result_count = 0`). Break down by `has_query` and device.
- Search/reply latency and failures by reason; count pagination separately.
- Reply and sharing engagement; show clipboard success separately from fallback.

Popup cancellation and normal unavailable-video conditions are usage events
rather than exception reports. Quota, rejected-key, network and server failures
are reported. Abort/cancelled search requests are ignored.

## Daily error email (configured 22 October 2026)

The [daily application error alert](https://eu.posthog.com/project/315525/alerts?alert_type=insights&alert_id=01a160fc-0e97-0000-8182-5a8b8d1cf7e8)
uses the [Daily reported application errors insight](https://eu.posthog.com/project/315525/insights/EKnigYMI)
in project 315525. It checks at **09:00 Europe/London**, including weekends,
and evaluates the previous completed calendar day's `$exception` count.
The threshold is **above zero**: a zero-error day does not trigger an email.
The ongoing day is excluded and there is no additional evaluation delay.

Delivery uses the existing verified PostHog owner account, `slpixe@gmail.com`,
directly. PostHog insight alerts select subscribed users rather than arbitrary
email aliases, so this delivery does not pass through the Cloudflare alias.
Native issue-lifecycle notifications support chat/webhook destinations; this
is a daily error-count email, not a new-issue notification rule.

The alert is enabled. Its first scheduled check on 22 October is temporarily
snoozed until **09:01 BST on 22 October** to avoid emailing about the deliberate
21 October setup exception. The first unsnoozed daily check is **09:00 BST on
23 October**, covering 22 October's activity. The temporary snooze expires
automatically; no manual follow-up is required.

Verification: the saved insight runs successfully, and API/UI readback confirms
the daily schedule, completed-day evaluation, zero threshold, enabled state and
owner recipient. Immediate test delivery was not performed, so inbox delivery
has not yet been observed. The only historical exception at setup was the
labelled controlled monitoring verification event.

This checks reported errors only. It does not alert on zero visitors, missing
events, or website availability. Do Not Track and Global Privacy Control
continue to suppress telemetry.

## Privacy and diagnostic limits

`src/telemetry.ts` rebuilds every outgoing event from a property allowlist.
Original exception messages, causes, source excerpts, breadcrumbs, referrers,
URL parameters, account details and arbitrary event properties are omitted.
Only production `/assets/*.js` frame locations and line/column numbers survive.
The browser user agent is retained as `$raw_user_agent` because cookieless
ingestion requires that exact field to calculate the server-side visitor hash. The initial production check exposed
`cookieless_missing_user_agent` warnings when this required field was omitted.
The expanded warning identifies `$raw_user_agent` as the required property;
`$user_agent` does not satisfy it. SDK and payload tests assert the exact field.
Chrome real login, search, replies and pagination were verified on 21 October.
Chrome has Do Not Track enabled, so those interactions intentionally emit no
telemetry. A separate clean, logged-out tab verifies pageview and controlled
error ingestion without Google authentication. A corrected clean-tab check
stored one pageview and one controlled runtime exception on 21 October; the exception also appeared as an Error Tracking issue.
All six saved dashboard queries executed successfully. Search conversion has
no recorded sample yet. Initial analytics include verification traffic and
should not be interpreted as organic visits.
No automatic clicks, recordings, console logs, network traces or performance
autocapture are enabled. Do Not Track and Global Privacy Control disable the
integration. Analytics never block app startup or an interaction.

Error messages are deliberately generic; error category, location and stack
frames provide debugging context. Private source-map upload is not configured,
so production stacks initially refer to built JavaScript. If readable source
stacks become necessary, add private source-map upload with a separate CI-only
credential and remove maps from the published site artifact.

## Daily quota alerts (configured 22 October 2026)

The 21 October check found no alert policies. On 22 October, two enabled
Cloud Monitoring policies were created in `video-comments-search`:

| Policy | Trigger | Cloud Monitoring |
| --- | --- | --- |
| YouTube daily quota - 80% | Daily usage above 80% for 60 seconds | [Policy](https://console.cloud.google.com/monitoring/alerting/policies/3505798848509054420?project=video-comments-search) |
| YouTube daily quota - 95% | Daily usage above 95% for 60 seconds | [Policy](https://console.cloud.google.com/monitoring/alerting/policies/8516710375029504344?project=video-comments-search) |

Both notify `video-comment-search@slpixe.com`, which Cloudflare forwards to
`slpixe@gmail.com`, through enabled email notification channel
`8115622277028684820`. The [policy list](https://console.cloud.google.com/monitoring/alerting/policies?project=video-comments-search)
shows both enabled. PostHog error emails are configured separately above.

The policies use Google's generated quota template: sum
`serviceruntime.googleapis.com/quota/rate/net_usage` for quota metric
`youtube.googleapis.com/default` within the current `America/Los_Angeles`
calendar day, divided by `serviceruntime.googleapis.com/quota/limit` for
`defaultPerDayPerProject`. The query evaluates every 30 seconds and follows
the actual limit rather than hard-coding 10,000 units. It does not use a
rolling 24-hour count or trigger on missing data as an availability signal.

Verification: Service Usage returned an effective daily limit of 10,002.
Evaluating the production policy's ratio expression returned
`0.0007998400319936012` (8 / 10,002, approximately 0.08%), matching the quota
Console. The API returned both policies and the email channel as enabled.
No quota was deliberately consumed to force an incident, and delivery of a
threshold notification has not yet been observed.

Alerts do not stop abuse or allocate quota per user. Everyone shares the
owner's project allowance; the browser login gate does not enforce per-user
access or rate limits. Broader public use should be paired with a backend
quota budget, rate limits and caching, with YouTube reads behind that
enforcement boundary. Keep the existing UI login for now.

References: [PostHog cookieless tracking](https://posthog.com/docs/privacy/data-collection),
[event filtering and configuration](https://posthog.com/docs/libraries/js/config),
[IP data controls](https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address).

# OAuth recovery and custom-domain rollout

Investigation date: 8 October 2026. Project: `video-comments-search`
(project number `761185990136`). Findings below came from the owner's Gmail
using the read-only gog connector and the Google Cloud Console. No email was sent.
Deployment and OAuth configuration were updated with the owner’s authorization.

## What Google's emails establish

- **12 May 2026:** Google requested that the homepage and privacy policy move
  to a verified domain owned by the developer. A Search Console confirmation
  for the GitHub Pages URL on 7 May did not satisfy this later request.
  [Original email](https://mail.google.com/mail/u/0/#all/19e1d5bf1271500f)
- **28 September 2026:** Google rejected the verification request because no
  update had been received within 90 days. The ticket was closed; a new
  submission through Cloud Console is required.
  [Original email](https://mail.google.com/mail/u/0/#all/1a0e951a73c91ccb)
- **7 October 2026:** Google warned that this project's inactive OAuth clients
  would be deleted in 30 days unless used. This is a warning about future
  deletion, not confirmation that the configured web client is deleted.
  Inspect the client list to identify the affected client(s); the email does
  not specify whether the current web client is the inactive one.
  [Original email](https://mail.google.com/mail/u/0/#all/1a1182a7af4c9426)

Verification rejection is not evidence that every Google login now fails.
The client, production audience and authorized origins have now been checked in
Cloud Console. A real Google login completed on 9 October after the owner
approved read-only consent. Public comment requests still fail because
`youtube.readonly` does not authorize the comment-list endpoints (see the latest
follow-up below). The app's local tests simulate auth and cannot establish those
external facts.

Google's [OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies)
allow deletion of clients inactive for at least six months. Retain each needed
client by using its actual sign-in or token flow, as the email requests, before **3 November 2026**, the specific deadline shown for the current web client
in Cloud Console. If already deleted,
check whether it can still be restored in the Console; the email states a
30-day restoration window. Never create dummy traffic or broaden scopes just
to keep an unused client.

## Prepared changes

- `public/CNAME` names `video-comment-search.slpixe.com`.
- Vite builds for `/` by default; `VITE_BASE_PATH` can override it.
- The privacy policy links to the chosen hostname.
- GitHub deployment preserves the CNAME and runs all checks first.
- `~/web/me/domains/dns.tf` declares a DNS-only CNAME from
  `video-comment-search.slpixe.com` to `slpixe.github.io`, following
  [GitHub's subdomain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Rollout status (8 October 2026)

- App changes were merged and deployed successfully through
  [GitHub PR #35](https://github.com/slpixe/Video-Comments-Search/pull/35).
  All CI checks passed: 40 unit tests, 10 desktop/mobile E2E tests and 9 Storybook checks.
- The CNAME was reviewed (1 addition, no changes/deletions), merged and applied through
  [domains MR #31](https://gitlab.com/slpixe/domains/-/merge_requests/31).
- GitHub Pages has issued the hostname’s certificate, and **Enforce HTTPS** is enabled.
  The HTTPS homepage, production JavaScript, privacy policy and terms page all
  return successfully with valid TLS. Some local DNS caches still have the earlier negative answer.
- The existing web OAuth client is enabled; last use shown is 8 May 2026.
  It has the new HTTPS JavaScript origin as well as the existing local/GitHub origins.
- Consent branding now matches the homepage name, **YouTube Comment Search**.
  Homepage, privacy and terms URLs point to the new hostname, and `slpixe.com`
  is an authorized domain.
- Audience is already **External / In production**, with 2 of the 100 unverified users used.
- YouTube Data API v3 is enabled. The app already requests `youtube.readonly`,
  but this sensitive scope was missing from the Console's review configuration.
  It was declared with a usage justification. The 9 October investigation below
  corrects that justification's mistaken claim that this scope authorizes comments.
- Google Search Console confirmed ownership of `slpixe.com` after the TXT record
  was reviewed, merged and applied through
  [domains MR #32](https://gitlab.com/slpixe/domains/-/merge_requests/32). Keep this TXT record to retain verification.
- A real OAuth login and search still need verification once the local DNS cache expires.
  Google requires an unlisted YouTube demo showing consent and scope use.
  No complete verification submission has been made yet. The Verification centre
  requires branding to be verified and published before enabling sensitive-scope submission.

## Follow-up (9 October 2026)

- Normal local DNS resolution now works. The homepage, privacy and terms pages
  returned HTTP 200 over HTTPS with valid TLS, without an address override.
- After the 24-hour ownership propagation window, **I have fixed the issues →
  Proceed** requested branding reverification. Google completed its automatic
  check and returned only the app-name identity issue; the previous domain
  ownership and homepage-name mismatch findings were absent.
- Google specifically rejected **YouTube Comment Search**. Its
  [identity guidance](https://support.google.com/cloud/answer/13804963?hl=en-GB)
  prohibits Google product names in app names. **Slpixe Video Comment Search**
  was published through [PR #38](https://github.com/slpixe/Video-Comments-Search/pull/38)
  after all CI checks passed. The live browser heading/title, manifest and policy
  pages match the new name, as does the saved Console configuration.
- After Pages finished publishing, the corrected identity was submitted for
  reverification. Google **verified the branding**. **Publish branding** was
  completed, and the Console confirms **Your branding has been verified and
  is being shown to users**. Do not resubmit or change this approved branding
  without a concrete need.
- **Prepare for verification** is now enabled. Its review summary confirms the
  saved scope justification and reports **Missing the following fields for one
  or more requested scopes: demo video**. The video link is **Not provided**
  and **Confirm** is disabled. The sensitive YouTube scope remains unverified;
  no scope-review submission has been made.
- Real sign-in from the live origin reached Google account selection, the
  unverified-app warning, profile/email sign-in and then the unchecked
  **View your YouTube account** permission. No YouTube access was granted and
  no real search was run. Action-time confirmation was requested because the
  browser policy requires it for a new sensitive-data permission grant. Do not
  repeat this request on unchanged scheduled runs; await the owner's response.
- Read-only gog confirmed a further inactive-client warning dated 8 October.
  [Email](https://mail.google.com/mail/u/0/#all/1a11d6555e5867cb).
  No verification approval email was present in the recent matching messages.
- The real unlisted demo URL remains outstanding (already requested on 8 October).
  Sensitive-scope review has not been submitted. Do not duplicate a review in progress.

## Live login investigation (9 October 2026, after owner approval)

- The owner approved continuing read-only consent. A genuine Google login now
  completes on the live domain using the existing account/client. Searching the
  public video `kJQP7kiw5Fk` for `music` returns **Request had insufficient
  authentication scopes.** A fresh login reproduces the same failure.
- A temporary local diagnostic checked `TokenResponse.scope` before accepting
  the session. The real callback contains `youtube.readonly`, so the failure is
  not simply an unchecked permission or a missing scope in the callback. A unit
  regression for partial grants passed, but that diagnostic change was removed
  because it does not solve the actual API contract mismatch.
- Google's public [YouTube Data API Discovery metadata](https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest)
  lists only `https://www.googleapis.com/auth/youtube.force-ssl` for
  `commentThreads.list` and `comments.list`. `youtube.readonly` is supported by
  other methods such as `videos.list`, but not these comment methods. The
  `youtube.force-ssl` permission can **see, edit, and permanently delete** videos,
  ratings, comments and captions. The owner's read-only approval does not grant
  that broader permission. No broader scope was requested or granted.
- Do not submit the saved sensitive-scope justification: its claim that
  `youtube.readonly` supports these comment requests is incorrect. Branding
  remains approved and published; no scope review has been submitted.
- The recommended alternative is to fetch public comments using a YouTube API
  key restricted to this live hostname and YouTube Data API v3, and keep basic
  Google login without a YouTube account permission. Approval for that change
  and creating a restricted key if needed was requested in this chat. Await the
  owner's choice; do not repeat the same approval request on scheduled runs.
- The existing **API key 1** is restricted to **YouTube Data API v3**, with HTTP
  referrers `localhost`, `https://slpixe.github.io/*` and `*.github.dev`. The live
  hostname is absent. These restrictions were inspected read-only; the key value
  was not revealed and no credential configuration was changed.
- The client's previously reported inactivity deadline was 3 November. A real
  login has now occurred, but Console's updated last-use/deadline has not yet
  been checked. A successful real comment search is still outstanding.


## Demo required if sensitive-scope verification is still needed

The API-key/basic-login alternative above would remove the need for a YouTube
sensitive scope and its demo. Do not pursue the old read-only submission. If the
owner explicitly chooses the broader OAuth approach, update the requested scope,
justification and policy text to match before preparing a real demo.

Record the real production app (without mock mode), showing the address bar,
Google login/account selection and the full consent flow for this project's
web client, then a submitted video search, filtering comments and viewing replies.
Show the unverified-app screen if Google presents it. Do not expose access tokens
or client secrets. Upload to YouTube as unlisted and paste that URL into the
Data access demo field. Google makes the final approval decision.

The Console asks that domain ownership changes be given 24 hours before retrying
branding verification. Do not claim ownership or scope verification is approved
until Google confirms it.

## Rollout order

1. Verify the hostname in the GitHub account's Pages settings if not already
   covered by a verified `slpixe.com` domain. Configure
   `video-comment-search.slpixe.com` in this repository's Pages settings to
   claim the hostname before DNS is applied.
2. Publish the app changes through the checked GitHub workflow. The current
   Pages source is the `gh-pages` branch at `/`.
3. Open the domains change as a GitLab merge request, inspect its plan (only
   the new CNAME), and merge through its normal CI apply workflow. Do not run
   a local infrastructure apply or bypass the managed state.
4. Once DNS resolves and GitHub provisions TLS, enable **Enforce HTTPS**.
   Check the homepage, assets, `/privacy.html`, and `/terms.html` over HTTPS.
5. Verify `slpixe.com` ownership in Google Search Console under an account
   that owns the Cloud project. If a new DNS TXT challenge is needed, add the
   exact Google-provided value through the domains repo; do not invent one.
6. In the [Google Auth Platform](https://console.cloud.google.com/auth/overview?project=video-comments-search), inspect the current client's status and configure:

   | Setting | Value |
   | --- | --- |
   | Authorized domain | `slpixe.com` |
   | Application homepage | `https://video-comment-search.slpixe.com/` |
   | Privacy policy | `https://video-comment-search.slpixe.com/privacy.html` |
   | Terms of service | `https://video-comment-search.slpixe.com/terms.html` |
   | Web client JavaScript origin | `https://video-comment-search.slpixe.com` |
   | Local development origin | The actual Vite origin, usually `http://localhost:5173` |
   | Currently configured API scope (insufficient for comments) | `https://www.googleapis.com/auth/youtube.readonly` |

   This app uses the Google Identity Services popup token flow. It does not
   have a backend OAuth callback; do not add a fabricated redirect URI.
   Confirm YouTube Data API v3 is enabled and audience/test-user settings
   allow the account used for the live check.
7. Update `VITE_GOOGLE_CLIENT_ID` only if a replacement web client was needed;
   rebuild after changing it. Complete a real login and YouTube search from
   the custom domain and retain each needed client. After the domain ownership
   propagation period, request branding reverification using **View issues →
   I have fixed the issues → Proceed**. Google must verify and publish branding
   before **Prepare for verification** is enabled for data access. Then provide
   the real demo URL and submit the sensitive-scope review. Approval is Google’s decision.

A repository change cannot remove Google's verification warning or approval
requirements. If login fails, record the exact Google error without tokens;
`deleted_client`, `invalid_client`, origin mismatch and testing-audience errors
require different Console fixes.

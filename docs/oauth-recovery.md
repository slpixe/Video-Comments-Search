# OAuth recovery and custom-domain rollout

Investigation date: 8 October 2026. Project: `video-comments-search`
(project number `761185990136`). Findings below came from the owner's Gmail
using the read-only gog connector; no email was sent and no Cloud settings
were changed.

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
The live client state, audience/test users, authorized origins and exact Google
error still need checking in Cloud Console and a real-browser login. The app's
local tests simulate auth and cannot establish those external facts.

Google's [OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies)
allow deletion of clients inactive for at least six months. Retain each needed
client by using its actual sign-in or token flow, as the email requests, well
before the warning period ends (around 6 November 2026). If already deleted,
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

These are local changes. DNS has not been applied, the app has not been
published, and Google verification has not been resubmitted.

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
   | Requested API scope | `https://www.googleapis.com/auth/youtube.readonly` |

   This app uses the Google Identity Services popup token flow. It does not
   have a backend OAuth callback; do not add a fabricated redirect URI.
   Confirm YouTube Data API v3 is enabled and audience/test-user settings
   allow the account used for the live check.
7. Update `VITE_GOOGLE_CLIENT_ID` only if a replacement web client was needed;
   rebuild after changing it. Complete a real login and YouTube search from
   the custom domain, retain each needed client, then resubmit verification
   through Cloud Console with any demonstration/material Google requests.

A repository change cannot remove Google's verification warning or approval
requirements. If login fails, record the exact Google error without tokens;
`deleted_client`, `invalid_client`, origin mismatch and testing-audience errors
require different Console fixes.

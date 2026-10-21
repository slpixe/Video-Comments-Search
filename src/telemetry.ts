import type { CaptureResult, PostHog, PostHogConfig } from 'posthog-js';

export type FailureReason = 'quota' | 'api_key' | 'api_disabled' | 'comments_disabled' | 'not_found' | 'forbidden' | 'network' | 'server' | 'unknown';
type Events = {
  login_started: undefined;
  login_succeeded: undefined;
  login_failed: { reason: 'oauth' | 'popup_blocked' | 'popup_closed' };
  session_restored: undefined;
  session_expired: undefined;
  search_started: { has_query: boolean };
  search_succeeded: { has_query: boolean; result_count: number; duration_ms: number };
  search_failed: { reason: FailureReason; duration_ms: number };
  comments_page_loaded: { result_count: number; duration_ms: number };
  comments_page_failed: { reason: FailureReason; duration_ms: number };
  replies_opened: undefined;
  replies_loaded: { result_count: number; duration_ms: number };
  replies_failed: { reason: FailureReason; duration_ms: number };
  search_link_shared: { method: 'clipboard' | 'manual_fallback' };
};
export type ErrorSource = 'startup' | 'render' | 'search' | 'pagination' | 'replies' | 'login' | 'runtime';
const eventNames = new Set<keyof Events>(['login_started', 'login_succeeded', 'login_failed', 'session_restored',
  'session_expired', 'search_started', 'search_succeeded', 'search_failed', 'comments_page_loaded',
  'comments_page_failed', 'replies_opened', 'replies_loaded', 'replies_failed', 'search_link_shared']);
const reasons = new Set(['quota', 'api_key', 'api_disabled', 'comments_disabled', 'not_found', 'forbidden', 'network', 'server', 'unknown', 'oauth', 'popup_blocked', 'popup_closed']);
const sources = new Set(['startup', 'render', 'search', 'pagination', 'replies', 'login', 'runtime']);
const errorTypes = new Set(['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError']);
const productionOrigin = 'https://video-comment-search.slpixe.com';

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

// Rebuild the payload, rather than trying to redact every possible SDK property.
// In particular, no URLs with video/query/key parameters or exception messages leave the browser.
export function sanitizeEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !(eventNames.has(event.event as keyof Events) || ['$pageview', '$exception'].includes(event.event))) return null;
  const input = event.properties;
  const properties: Record<string, unknown> = {
    $current_url: `${productionOrigin}/`, $pathname: '/', $host: 'video-comment-search.slpixe.com',
    $process_person_profile: false, $geoip_disable: true, $cookieless_mode: true,
    token: import.meta.env.VITE_POSTHOG_KEY,
  };
  // Cookieless mode uses the SDK sentinel, not Google identity or persistent browser IDs.
  if (input.distinct_id === '$posthog_cookieless') properties.distinct_id = input.distinct_id;
  for (const key of ['$lib', '$lib_version', '$browser', '$browser_version', '$os', '$os_version', '$device_type']) {
    if (typeof input[key] === 'string' && /^[\w .-]{1,80}$/.test(input[key])) properties[key] = input[key];
    if (typeof input[key] === 'number' && Number.isFinite(input[key])) properties[key] = input[key];
  }
  if (typeof input.has_query === 'boolean') properties.has_query = input.has_query;
  for (const key of ['result_count', 'duration_ms']) {
    if (typeof input[key] === 'number' && Number.isFinite(input[key])) properties[key] = Math.max(0, Math.min(3_600_000, Math.round(input[key])));
  }
  if (reasons.has(input.reason)) properties.reason = input.reason;
  if (sources.has(input.source)) properties.source = input.source;
  if (['clipboard', 'manual_fallback'].includes(input.method)) properties.method = input.method;
  if (event.event === '$exception') {
    properties.$exception_level = 'error';
    properties.$exception_list = (Array.isArray(input.$exception_list) ? input.$exception_list : []).slice(0, 3).map(value => {
      const exception = record(value);
      const stacktrace = record(exception.stacktrace);
      const frames = (Array.isArray(stacktrace.frames) ? stacktrace.frames : []).slice(-30).flatMap(value => {
        const frame = record(value);
        try {
          const url = new URL(String(frame.filename));
          if (url.origin !== productionOrigin || !/^\/assets\/[\w.-]+\.js$/.test(url.pathname)) return [];
          return [{ filename: `${url.origin}${url.pathname}`, platform: 'javascript',
            ...(typeof frame.lineno === 'number' ? { lineno: frame.lineno } : {}),
            ...(typeof frame.colno === 'number' ? { colno: frame.colno } : {}) }];
        } catch { return []; }
      });
      return { type: errorTypes.has(String(exception.type)) ? exception.type : 'Error',
        value: sources.has(input.source) ? `Application error: ${input.source}` : 'Unexpected application error',
        mechanism: { handled: record(exception.mechanism).handled === true, type: 'generic' },
        stacktrace: { type: 'raw', frames } };
    });
  }
  return { uuid: event.uuid, event: event.event, timestamp: event.timestamp, properties };
}

export const telemetryConfig: Partial<PostHogConfig> = {
  cookieless_mode: 'always', person_profiles: 'never',
  autocapture: false, capture_pageview: false, capture_pageleave: false,
  capture_dead_clicks: false, rageclick: false, capture_heatmaps: false,
  capture_performance: false, capture_webmcp: false,
  // Our listeners below avoid loading PostHog's remote exception-autocapture script.
  capture_exceptions: false,
  disable_session_recording: true, disable_surveys: true, disable_product_tours: true,
  disable_conversations: true, disable_web_experiments: true, disable_external_dependency_loading: true,
  advanced_disable_flags: true, remote_config_refresh_interval_ms: 0,
  respect_dnt: true, before_send: sanitizeEvent,
};

let client: PostHog | undefined;
let starting = false;
let pending: Array<(client: PostHog) => void> = [];
function send(action: (client: PostHog) => void) {
  try {
    if (client) action(client);
    else if (starting && pending.length < 50) pending.push(action);
  } catch { /* Monitoring must never prevent login, searching, or rendering. */ }
}

export function initializeTelemetry(): void {
  const token = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;
  if (starting || client || !import.meta.env.PROD || !token?.startsWith('phc_') ||
      !['https://eu.i.posthog.com', 'https://us.i.posthog.com'].includes(host) ||
      window.location.origin !== productionOrigin || navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  starting = true;
  window.addEventListener('error', event => {
    if (event.error) reportError(event.error, 'runtime');
  });
  window.addEventListener('unhandledrejection', event => reportError(event.reason, 'runtime'));
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(token, { ...telemetryConfig, api_host: host });
    client = posthog;
    send(c => c.capture('$pageview'));
    const queued = pending;
    pending = [];
    queued.forEach(send);
  }).catch(() => { pending = []; }).finally(() => { starting = false; });
}

export function trackEvent<E extends keyof Events>(name: E, ...args: Events[E] extends undefined ? [] : [Events[E]]): void {
  send(c => c.capture(name, args[0]));
}

export function reportError(error: unknown, source: ErrorSource, reason?: FailureReason): void {
  if (reason && ['comments_disabled', 'not_found'].includes(reason)) return;
  send(c => c.captureException(error, { source, reason }));
}

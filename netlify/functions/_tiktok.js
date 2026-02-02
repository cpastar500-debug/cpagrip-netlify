// netlify/functions/_tiktok.js

function isoNow() {
  return new Date().toISOString();
}

/**
 * TikTok Events API (Events 2.0) sender
 * Endpoint: https://business-api.tiktok.com/open_api/v1.3/event/track/
 * Auth: Access-Token header
 */
export async function sendTikTokEvent({
  eventType,          // e.g. "CompleteRegistration" or "Purchase"
  eventId,            // your dedupe key (use tracking_id)
  pixelCode,          // TIKTOK_PIXEL_CODE
  accessToken,        // TIKTOK_ACCESS_TOKEN
  testEventCode,      // optional
  properties = {},    // value/currency/etc (if Purchase)
  context = {},       // optional user/page context (recommended if you have it)
}) {
  if (!pixelCode || !accessToken) {
    return { skipped: true, reason: "missing_pixel_or_token" };
  }

  // Minimal payload: Tealium doc confirms required Event Time + supports WEB source + standard events. :contentReference[oaicite:5]{index=5}
  const payload = {
    event_source: "WEB",
    event_type: eventType,
    event_time: isoNow(), // ISO 8601 recommended/required by many integrations :contentReference[oaicite:6]{index=6}
    event_id: eventId,    // TikTok dedupe key :contentReference[oaicite:7]{index=7}
    event_source_id: pixelCode, // pixel code
    properties,
    context,
  };

  if (testEventCode) payload.test_event_code = testEventCode;

  const endpoint =
    process.env.TIKTOK_EVENT_ENDPOINT ||
    "https://business-api.tiktok.com/open_api/v1.3/event/track/";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": accessToken, // header format seen in TikTok Business API collections :contentReference[oaicite:8]{index=8}
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* keep text */ }

  return {
    ok: res.ok,
    status: res.status,
    body: json ?? text,
    sent_payload: payload,
  };
}

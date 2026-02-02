import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendTikTokEvent } from "./_tiktok.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helpers
function json200(obj) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

function getClientIp(headers) {
  // Netlify often provides this:
  const nf = headers["x-nf-client-connection-ip"];
  if (nf) return nf;

  // Fallback to X-Forwarded-For:
  const xff = headers["x-forwarded-for"];
  if (!xff) return null;
  return xff.split(",")[0].trim();
}

function parseIncoming(event) {
  // Supports:
  // - CPAGrip POST form-encoded: event.body
  // - Your local GET query string test: event.queryStringParameters
  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v])
  );

  let bodyParams = new URLSearchParams();
  const ct = headers["content-type"] || "";
  if (event.body && ct.includes("application/x-www-form-urlencoded")) {
    bodyParams = new URLSearchParams(event.body);
  } else if (event.body && ct.includes("application/json")) {
    // if ever you send json
    try {
      const j = JSON.parse(event.body);
      bodyParams = new URLSearchParams(j);
    } catch {}
  }

  const qs = event.queryStringParameters || {};

  // Prefer POST body values, fallback to query string values
  const get = (key) => bodyParams.get(key) || qs[key] || null;

  return {
    headers,
    password: get("password"),
    tracking_id: get("tracking_id"),
    offer_id: get("offer_id"),
    payout: get("payout"),
    ts: get("ts"),
    nonce: get("nonce"),
    sig: get("sig"),
  };
}

function verifyHmac({ tracking_id, offer_id, payout, ts, nonce, sig }) {
  const secret = process.env.CPAGRIP_SECRET;

  // IMPORTANT: order must match your client/baseString order
  const baseString =
    `tracking_id=${tracking_id}` +
    `&offer_id=${offer_id}` +
    `&payout=${payout}` +
    `&ts=${ts}` +
    `&nonce=${nonce}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(baseString)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(sig || "", "utf8")
  );
}

export async function handler(event) {
  try {
    const incoming = parseIncoming(event);
    const {
      headers,
      password,
      tracking_id,
      offer_id,
      payout,
      ts,
      nonce,
      sig,
    } = incoming;

    if (!tracking_id) return json200({ success: false, error: "missing_tracking_id" });

    // ---- AUTH MODES ----
    // CPAGrip password-only mode (production)
    const requireSig = (process.env.REQUIRE_SIG || "false") === "true";

    if (!requireSig) {
      // Password-only
      if (password !== process.env.CPAGRIP_POSTBACK_PASSWORD) {
        // Return 200 still (prevents hammering), but indicates auth failed
        return json200({ success: false, error: "bad_password" });
      }
    } else {
      // HMAC mode (your local test script)
      if (!ts || !nonce || !sig || !offer_id || !payout) {
        return json200({ success: false, error: "missing_hmac_fields" });
      }
      const ok = verifyHmac({ tracking_id, offer_id, payout, ts, nonce, sig });
      if (!ok) return json200({ success: false, error: "bad_sig" });
    }

    // ---- INSERT CONVERSION (DB-enforced idempotency) ----
    // Unique on tracking_id means: first insert succeeds, duplicates throw 23505
    const payoutNum = payout != null ? Number(payout) : null;

    const { data: inserted, error: insErr } = await supabase
      .from("conversions")
      .insert([{
        tracking_id,
        offer_id: offer_id || null,
        payout: Number.isFinite(payoutNum) ? payoutNum : null,
        status: "completed",
        tiktok_event_id: tracking_id,
      }])
      .select()
      .maybeSingle();

    if (insErr) {
      // Supabase/Postgres duplicate unique violation is usually code 23505
      const isDedupe =
        insErr.code === "23505" ||
        String(insErr.message || "").toLowerCase().includes("duplicate") ||
        String(insErr.message || "").toLowerCase().includes("unique");

      if (isDedupe) {
        // ✅ DEDUPED: do NOT fire TikTok
        return json200({ success: true, deduped: true });
      }

      console.error("Supabase insert error:", insErr);
      // For CPAGrip retry safety: still return 200
      return json200({ success: true, stored: false, error: "db_error" });
    }

    // ✅ ONLY FIRST INSERT REACHES HERE → Fire TikTok once
    // We'll enrich with click context in Part B (for now send minimal)
    const tiktokRes = await sendTikTokEvent({
      eventType: "CompleteRegistration",
      eventId: tracking_id,
      pixelCode: process.env.TIKTOK_PIXEL_CODE,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      endpoint: process.env.TIKTOK_EVENT_ENDPOINT || "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      testEventCode: process.env.TIKTOK_TEST_EVENT_CODE || undefined,
      // Minimal context; better context comes in Part B
      context: {
        ip: getClientIp(headers) || undefined,
        user_agent: headers["user-agent"] || undefined,
      },
      properties: Number.isFinite(payoutNum) ? { value: payoutNum, currency: "USD" } : {},
    });

    // Mark DB state so you can audit
    await supabase
      .from("conversions")
      .update({
        tiktok_sent: !!tiktokRes?.ok,
        tiktok_sent_at: tiktokRes?.ok ? new Date().toISOString() : null,
        tiktok_response: tiktokRes?.body ?? tiktokRes,
      })
      .eq("tracking_id", tracking_id);

    return json200({
      success: true,
      deduped: false,
      inserted: true,
      tiktok: { ok: !!tiktokRes?.ok, status: tiktokRes?.status },
    });
  } catch (e) {
    console.error("cpagrip-postback fatal:", e);
    return json200({ success: true, error: "server_exception" });
  }
}

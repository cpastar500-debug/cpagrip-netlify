// netlify/functions/cpagrip-postback.js
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---- helpers
function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(obj),
  };
}

// Best-effort client IP extraction behind Netlify
function getClientIp(event) {
  const h = event.headers || {};
  // Netlify sometimes provides x-nf-client-connection-ip (not always documented consistently),
  // otherwise fall back to x-forwarded-for first hop.
  const nf = h["x-nf-client-connection-ip"];
  if (nf) return nf;

  const xff = h["x-forwarded-for"];
  if (!xff) return null;
  return xff.split(",")[0].trim();
}

function timingSafeEqual(a, b) {
  const aa = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

// Canonical signing string (stable order)
function buildSigningString(params) {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${params[k] ?? ""}`).join("&");
}

function hmacSign(str, secret) {
  return crypto.createHmac("sha256", secret).update(str).digest("hex");
}

// simple allowlist: comma-separated exact IPs
function ipAllowed(ip) {
  const allow = (process.env.CPAGRIP_ALLOWED_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allow.length === 0) return true; // if you haven't set an allowlist, don't block
  if (!ip) return false;
  return allow.includes(ip);
}

// Optional: TikTok server-side call (you must fill these env vars)
async function sendTikTokEvent({ tracking_id, offer_id, payout }) {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return { skipped: true };

  // This is intentionally generic because TikTok payload requirements can vary by account/setup.
  // You typically want event_name + event_time + event_id + context/user data if available.
  const payload = {
    pixel_code: pixelId,
    event: "CompletePayment",
    event_id: `cpagrip_${tracking_id}_${offer_id || "na"}`,
    timestamp: Math.floor(Date.now() / 1000),
    properties: {
      value: payout ? Number(payout) : undefined,
      currency: "USD",
      offer_id,
      tracking_id,
    },
  };

  // NOTE: Use the correct TikTok endpoint for your integration type.
  // Many teams use TikTok Events API (server-side) rather than browser pixel.
  // Concept overview / setup references: :contentReference[oaicite:1]{index=1}

  const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/pixel/track/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "access-token": accessToken,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, body: text.slice(0, 500) };
}

export async function handler(event) {
  try {
    const method = event.httpMethod || "GET";
    if (method !== "GET" && method !== "POST") {
      return json(405, { success: false, error: "Method not allowed" });
    }

    // Collect params from query + JSON body (if any)
    const query = event.queryStringParameters || {};
    let body = {};
    if (method === "POST" && event.body) {
      try {
        body = event.isBase64Encoded
          ? JSON.parse(Buffer.from(event.body, "base64").toString("utf8"))
          : JSON.parse(event.body);
      } catch {
        // ignore bad JSON, still allow querystring based postbacks
      }
    }

    const p = { ...query, ...body };

    // Required params
    const tracking_id = p.tracking_id;
    const offer_id = p.offer_id || null;
    const payout = p.payout || null;

    // Auth params
    const password = p.password;
    const ts = p.ts ? Number(p.ts) : null;
    const nonce = p.nonce || null;
    const sig = p.sig || null;

    // 1) Basic checks
    if (!tracking_id) return json(400, { success: false, error: "tracking_id missing" });

    // 2) Password check (your current behavior)
    if (password !== process.env.CPAGRIP_POSTBACK_PASSWORD) {
      return json(403, { success: false, error: "Forbidden" });
    }

    // 3) Optional IP allowlist
    const ip = getClientIp(event);
    if (!ipAllowed(ip)) {
      return json(403, { success: false, error: "IP not allowed" });
    }

    // 4) Anti-replay (recommended)
    // If you haven't started sending ts/nonce/sig yet, you can temporarily skip by not requiring them.
    const requireReplayProtection = process.env.REQUIRE_ANTI_REPLAY === "true";

    if (requireReplayProtection) {
      if (!ts || !nonce || !sig) {
        return json(400, { success: false, error: "ts/nonce/sig required" });
      }

      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - ts) > 300) {
        return json(400, { success: false, error: "timestamp expired" });
      }

      // Check nonce not used
      const { data: existing } = await supabase
        .from("used_nonces")
        .select("nonce")
        .eq("nonce", nonce)
        .maybeSingle();

      if (existing) {
        return json(409, { success: false, error: "replay detected" });
      }

      // Verify HMAC signature
      const signingParams = {
        tracking_id,
        offer_id: offer_id || "",
        payout: payout || "",
        ts,
        nonce,
      };

      const signingString = buildSigningString(signingParams);
      const expected = hmacSign(signingString, process.env.POSTBACK_HMAC_SECRET);

      if (!timingSafeEqual(sig, expected)) {
        return json(403, { success: false, error: "bad signature" });
      }

      // Store nonce as used
      await supabase.from("used_nonces").insert({ nonce });
    }

    // 5) Insert conversion (dedupe via unique constraint)
    const userAgent = (event.headers && (event.headers["user-agent"] || event.headers["User-Agent"])) || null;

    const conversionRow = {
      tracking_id,
      offer_id,
      payout: payout ? Number(payout) : null,
      status: "received",
      source_ip: ip,
      user_agent: userAgent,
      raw: p,
      nonce: nonce || null,
      ts: ts || null,
    };

    const insertRes = await supabase.from("conversions").insert(conversionRow).select().maybeSingle();

    // If unique constraint trips, Supabase may return an error; treat as already logged
    let conversionId = insertRes?.data?.id || null;

    // 6) Optional: send TikTok server-side event
    const tiktok = await sendTikTokEvent({ tracking_id, offer_id, payout });

    return json(200, {
      success: true,
      tracking_id,
      offer_id,
      payout,
      conversion_id: conversionId,
      tiktok,
    });
  } catch (e) {
    return json(500, { success: false, error: "Server error", detail: String(e?.message || e) });
  }
}

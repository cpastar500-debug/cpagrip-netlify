// netlify/functions/cpagrip-postback.js
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function env(key, fallback = undefined) {
  // Works in local netlify dev + production
  return (globalThis.Netlify?.env?.[key]) ?? process.env[key] ?? fallback;
}

function getClientIp(req) {
  // Netlify provides this header on Functions
  const nf = req.headers.get("x-nf-client-connection-ip");
  if (nf) return nf;

  // Fallback (may contain multiple)
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "";
  return xff.split(",")[0].trim();
}

function timingSafeEqualStr(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function hmacSha256Hex(secret, base) {
  return crypto.createHmac("sha256", secret).update(base).digest("hex");
}

function parseBool(v, fallback = false) {
  if (v === undefined || v === null || v === "") return fallback;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return fallback;
}

function parseIntSafe(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

async function readBodyParams(req) {
  if (req.method !== "POST") return {};
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  const text = await req.text();
  if (!text) return {};

  if (ct.includes("application/json")) {
    try {
      const data = JSON.parse(text);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(text));
  }

  return {};
}

function getSupabase() {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// IMPORTANT: This must match your signer script's base string format/order.
function buildSignatureBase({ tracking_id, offer_id, payout, ts, nonce }) {
  return (
    `tracking_id=${tracking_id}` +
    `&offer_id=${offer_id}` +
    `&payout=${payout}` +
    `&ts=${ts}` +
    `&nonce=${nonce}`
  );
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return json(405, { success: false, error: "Method not allowed" }, corsHeaders());
  }

  try {
    const urlObj = new URL(req.url);
    const queryParams = Object.fromEntries(urlObj.searchParams.entries());
    const bodyParams = await readBodyParams(req);
    const params = { ...queryParams, ...bodyParams };

    const tracking_id = String(params.tracking_id || "").trim();
    const offer_id = String(params.offer_id || "").trim();
    const payoutRaw = params.payout;
    const payout = payoutRaw === undefined || payoutRaw === null || payoutRaw === "" ? "" : String(payoutRaw).trim();

    const tsStr = String(params.ts || "").trim();
    const nonce = String(params.nonce || "").trim();
    const sig = String(params.sig || "").trim();
    const password = String(params.password || "").trim();

    // --------------- Basic validation ---------------
    if (!tracking_id) return json(400, { success: false, error: "tracking_id required" }, corsHeaders());
    if (tracking_id.length > 128) return json(400, { success: false, error: "tracking_id too long" }, corsHeaders());
    if (offer_id.length > 128) return json(400, { success: false, error: "offer_id too long" }, corsHeaders());
    if (payout.length > 32) return json(400, { success: false, error: "payout too long" }, corsHeaders());

    // --------------- Optional CPAGrip IP allowlist ---------------
    const allowedIpsRaw = env("CPAGRIP_ALLOWED_IPS") || "";
    if (allowedIpsRaw.trim()) {
      const allowed = new Set(
        allowedIpsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      const ip = getClientIp(req);
      if (!ip || !allowed.has(ip)) {
        return json(403, { success: false, error: "Forbidden" }, corsHeaders());
      }
    }

    // --------------- Auth: HMAC or password ---------------
    const secret = env("CPAGRIP_SECRET") || "";
    const postbackPassword = env("CPAGRIP_POSTBACK_PASSWORD") || "";
    const requireSig = parseBool(env("REQUIRE_SIG"), true);

    if (requireSig) {
      if (!secret) {
        return json(500, { success: false, error: "Server misconfigured: CPAGRIP_SECRET missing" }, corsHeaders());
      }
      if (!tsStr || !nonce || !sig) {
        return json(403, { success: false, error: "Forbidden" }, corsHeaders());
      }

      const base = buildSignatureBase({
        tracking_id,
        offer_id,
        payout,
        ts: tsStr,
        nonce,
      });

      const expected = hmacSha256Hex(secret, base);
      if (!timingSafeEqualStr(expected, sig)) {
        return json(403, { success: false, error: "Forbidden" }, corsHeaders());
      }
    } else if (postbackPassword) {
      // password mode (works with networks that can't do HMAC)
      if (!password || password !== postbackPassword) {
        return json(403, { success: false, error: "Forbidden" }, corsHeaders());
      }
    } else {
      // If you disable sig and don't set a password, you're effectively unauthenticated.
      return json(500, { success: false, error: "Server misconfigured: no auth enabled" }, corsHeaders());
    }

    // --------------- Anti-replay (nonce + timestamp window) ---------------
    const requireAntiReplay = parseBool(env("REQUIRE_ANTI_REPLAY"), true);
    const windowSeconds = parseIntSafe(env("ANTI_REPLAY_WINDOW_SECONDS") || "300", 300);

    const nowSec = Math.floor(Date.now() / 1000);
    const ts = tsStr ? parseIntSafe(tsStr, NaN) : NaN;

    if (requireAntiReplay) {
      if (!nonce || nonce.length > 128) {
        return json(400, { success: false, error: "Invalid nonce" }, corsHeaders());
      }
      if (!Number.isFinite(ts)) {
        return json(400, { success: false, error: "Invalid ts" }, corsHeaders());
      }

      const delta = Math.abs(nowSec - ts);
      if (delta > windowSeconds) {
        return json(403, { success: false, error: "Expired" }, corsHeaders());
      }
    }

    const supabase = getSupabase();

    // Record nonce first (replay detection)
    if (requireAntiReplay) {
      const { error: nonceErr } = await supabase
        .from("postback_nonces")
        .insert([{ nonce, tracking_id, ts }]);

      // 23505 = unique violation (nonce already used)
      if (nonceErr && nonceErr.code === "23505") {
        // replay — return success so networks don't keep hammering you
        return json(200, { success: true, replay: true }, corsHeaders());
      }
      if (nonceErr) {
        console.error("nonce insert error", nonceErr);
        return json(500, { success: false, error: "DB error" }, corsHeaders());
      }
    }

    // --------------- Insert conversion (strict 1 per tracking_id) ---------------
    const payoutNum = payout === "" ? null : Number(payout);
    const safePayout = payoutNum !== null && Number.isFinite(payoutNum) ? payoutNum : null;

    const { error: convErr } = await supabase.from("conversions").insert([
      {
        tracking_id,
        offer_id: offer_id || null,
        payout: safePayout,
        status: "completed",
      },
    ]);

    if (convErr && convErr.code === "23505") {
      // tracking_id already exists -> dedupe (still return success)
      return json(200, { success: true, deduped: true }, corsHeaders());
    }

    if (convErr) {
      console.error("conversion insert error", convErr);
      return json(500, { success: false, error: "DB error" }, corsHeaders());
    }

    return json(200, { success: true }, corsHeaders());
  } catch (err) {
    console.error("cpagrip-postback error", err);
    return json(500, { success: false, error: "Server error" }, corsHeaders());
  }
};

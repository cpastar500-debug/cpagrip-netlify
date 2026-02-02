import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function json200(obj) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      // allow your site to call it
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(obj),
  };
}

function getClientIp(headers) {
  const h = Object.fromEntries(
    Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const nf = h["x-nf-client-connection-ip"];
  if (nf) return nf;
  const xff = h["x-forwarded-for"];
  if (!xff) return null;
  return xff.split(",")[0].trim();
}

export async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        body: "",
      };
    }

    if (event.httpMethod !== "POST") return json200({ ok: false, error: "method_not_allowed" });

    const body = JSON.parse(event.body || "{}");

    const tracking_id = body.tracking_id;
    const ttclid = body.ttclid || null;
    const landing_url = body.landing_url || null;
    const referrer = body.referrer || null;

    if (!tracking_id) return json200({ ok: false, error: "missing_tracking_id" });

    const headers = event.headers || {};
    const ip = getClientIp(headers);
    const user_agent = (headers["user-agent"] || headers["User-Agent"] || null);

    // Insert once; dedupe if already exists
    const { error } = await supabase
      .from("click_context")
      .insert([{
        tracking_id,
        ttclid,
        ip,
        user_agent,
        landing_url,
        referrer,
      }]);

    if (error) {
      const isDedupe =
        error.code === "23505" ||
        String(error.message || "").toLowerCase().includes("duplicate") ||
        String(error.message || "").toLowerCase().includes("unique");

      if (isDedupe) return json200({ ok: true, deduped: true });
      console.error("click_context insert error:", error);
      return json200({ ok: false, error: "db_error" });
    }

    return json200({ ok: true, stored: true });
  } catch (e) {
    console.error("capture-click fatal:", e);
    return json200({ ok: false, error: "server_exception" });
  }
}

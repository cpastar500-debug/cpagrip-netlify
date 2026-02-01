// netlify/functions/conversion-status.js
import { createClient } from "@supabase/supabase-js";

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getSupabase() {
  const url = Netlify.env.get("SUPABASE_URL");
  const key = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async (req) => {
  if (req.method !== "GET") return json(405, { error: "Method not allowed" });

  try {
    const url = new URL(req.url);
    const tracking_id = (url.searchParams.get("tracking_id") || "").trim();
    if (!tracking_id) return json(400, { error: "tracking_id required" });

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("conversions")
      .select("id, tracking_id, offer_id, payout, status, created_at")
      .eq("tracking_id", tracking_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("conversion-status query error", error);
      return json(500, { error: "DB error" });
    }

    const latest = data && data.length ? data[0] : null;

    return json(200, {
      completed: Boolean(latest && latest.status === "completed"),
      latest,
    });
  } catch (err) {
    console.error("conversion-status error", err);
    return json(500, { error: "Server error" });
  }
};

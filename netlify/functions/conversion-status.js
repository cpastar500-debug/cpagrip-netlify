// netlify/functions/conversion-status.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  const tracking_id = event.queryStringParameters?.tracking_id;
  if (!tracking_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "tracking_id missing" }) };
  }

  const { data } = await supabase
    .from("conversions")
    .select("id, status, created_at, offer_id, payout")
    .eq("tracking_id", tracking_id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = data?.[0] || null;

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ completed: !!latest, latest }),
  };
}

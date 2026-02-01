const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const tracking_id = event.queryStringParameters?.tracking_id;
  if (!tracking_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing tracking_id" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from("conversions")
    .select("id")
    .eq("tracking_id", tracking_id)
    .limit(1);

  return {
    statusCode: 200,
    body: JSON.stringify({ completed: data && data.length > 0 }),
  };
};

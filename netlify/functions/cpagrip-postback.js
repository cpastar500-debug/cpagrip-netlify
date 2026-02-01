const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};

    const provided =
      qs.password ||
      qs.pass ||
      qs.secret ||
      (event.headers && event.headers["x-postback-password"]);

    const expected =
      process.env.CPAGRIP_POSTBACK_PASSWORD || process.env.CPAGRIP_SECRET;

    if (!expected || provided !== expected) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, error: "Forbidden" }),
      };
    }

    const tracking_id = qs.tracking_id;
    if (!tracking_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing tracking_id" }),
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from("conversions")
      .upsert(
        {
          tracking_id,
          offer_id: qs.offer_id || null,
          payout: qs.payout ? Number(qs.payout) : null,
          status: "completed",
        },
        { onConflict: "tracking_id" }
      );

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Server error" }),
    };
  }
};

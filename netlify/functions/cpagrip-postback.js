import crypto from "crypto";

const secret = process.env.CPAGRIP_SECRET || "cpagrip_secret_2026";

const params = {
  tracking_id: "67",
  offer_id: "TEST123",
  payout: "1.5",
  ts: Math.floor(Date.now() / 1000).toString(),
  nonce: crypto.randomBytes(8).toString("hex"),
};

// IMPORTANT: order must match server
const baseString =
  `tracking_id=${params.tracking_id}` +
  `&offer_id=${params.offer_id}` +
  `&payout=${params.payout}` +
  `&ts=${params.ts}` +
  `&nonce=${params.nonce}`;

const sig = crypto
  .createHmac("sha256", secret)
  .update(baseString)
  .digest("hex");

const url =
  `http://localhost:8888/.netlify/functions/cpagrip-postback?` +
  baseString +
  `&sig=${sig}`;

console.log("BASE STRING:", baseString);
console.log("SIG:", sig);
console.log("URL:", url);

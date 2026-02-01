import crypto from "node:crypto";

const secret = process.env.CPAGRIP_SECRET || "cpagrip_secret_2026";

const tracking_id = "67";
const offer_id = "TEST123";
const payout = "1.5";
const ts = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(8).toString("hex");

// MUST match server:
const base = [tracking_id, offer_id, payout, ts, nonce].join("|");

const sig = crypto.createHmac("sha256", secret).update(base).digest("hex");

// Query string can be normal, server only uses these values (not the query formatting) to build base
const url =
  `http://localhost:8888/.netlify/functions/cpagrip-postback` +
  `?tracking_id=${encodeURIComponent(tracking_id)}` +
  `&offer_id=${encodeURIComponent(offer_id)}` +
  `&payout=${encodeURIComponent(payout)}` +
  `&ts=${encodeURIComponent(ts)}` +
  `&nonce=${encodeURIComponent(nonce)}` +
  `&sig=${encodeURIComponent(sig)}`;

console.log("BASE:", base);
console.log("SIG :", sig);
console.log("URL :", url);

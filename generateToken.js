const jwt = require("jsonwebtoken");
const fs = require("fs");

// Service account details
const SERVICE_ACCOUNT_EMAIL = "coralmacu@vault-958c80a6cbf7.utilaserviceaccount.io";
const UTILIA_API_URI = "https://api.utila.io/";
const PRIVATE_KEY_PATH = "private_key.pem";

// Load private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

// Define JWT claims
const now = Math.floor(Date.now() / 1000);
const payload = {
    sub: SERVICE_ACCOUNT_EMAIL,
    aud: UTILIA_API_URI,
    exp: now + 3600, // Token valid for 1 hour
    iat: now, // Issued at
};

// Sign the JWT
const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

console.log("Access Token:");
console.log(token);

import crypto from "crypto";
import fs from "fs";
import path from "path";
const pem = fs.readFileSync(
  path.join(__dirname, "../../../../keys/rain.public.key.pem"),
  "utf-8"
);
export const generateSessionId = () => {
  const secretKey = crypto.randomUUID().replace(/-/g, "");

  const secretKeyBase64 = Buffer
    .from(secretKey, "hex")
    .toString("base64");
  const encrypted = crypto.publicEncrypt(
    {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha1",
    },
    Buffer.from(secretKeyBase64, "utf-8")
  );
  return {
    secretKey,   
    sessionId: encrypted.toString("base64"), 
  };
};

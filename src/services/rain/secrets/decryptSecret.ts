import crypto from "crypto";

export function decryptSecret(base64Secret, base64Iv, secretKey) {
  const secret = Buffer.from(base64Secret, "base64");
  const iv = Buffer.from(base64Iv, "base64");
  const secretKeyBuffer = Buffer.from(secretKey, "hex");

  const cryptoKey = crypto.createDecipheriv("aes-128-gcm", secretKeyBuffer, iv);
  cryptoKey.setAutoPadding(false);

  const decrypted = cryptoKey.update(secret);
  return decrypted.toString("utf-8").trim();
}
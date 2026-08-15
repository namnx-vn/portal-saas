import jwt from "jsonwebtoken";
import type { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const tenantName = process.env.ENTRA_TENANT_NAME!;
const tenantId = process.env.ENTRA_TENANT_ID!;
const clientId = process.env.ENTRA_CLIENT_ID!;

const client = jwksClient({
  jwksUri: `https://${tenantName}.ciamlogin.com/${tenantId}/discovery/v2.0/keys`,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err || !key) return callback(err);
    callback(null, key.getPublicKey());
  });
}

export interface EntraIdTokenPayload {
  oid: string;
  email: string;
}

export function verifyIdToken(idToken: string): Promise<EntraIdTokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getSigningKey,
      { audience: clientId },
      (err, decoded) => {
        if (err || !decoded) return reject(err ?? new Error("Invalid token"));
        resolve(decoded as EntraIdTokenPayload);
      },
    );
  });
}

import type { CorsOptions } from "cors";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
];

export function parseAllowedOrigins(configuredOrigins?: string): Set<string> {
  const origins = configuredOrigins?.trim()
    ? configuredOrigins.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  return new Set(origins);
}

export function createCorsOptions(
  configuredOrigins = process.env.CORS_ORIGIN,
): CorsOptions {
  const allowedOrigins = parseAllowedOrigins(configuredOrigins);

  return {
    credentials: true,
    origin(origin, callback) {
      callback(null, Boolean(origin && allowedOrigins.has(origin)));
    },
  };
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import { createCorsOptions } from "./cors.js";

interface CorsTestRequest {
  configuredOrigins?: string;
  method?: "GET" | "OPTIONS";
  origin?: string;
}

function runCorsMiddleware({
  configuredOrigins = "",
  method = "GET",
  origin,
}: CorsTestRequest) {
  const responseHeaders = new Map<string, string>();
  let ended = false;
  let nextCalled = false;
  let nextError: unknown;

  const request = {
    method,
    headers: {
      ...(origin ? { origin } : {}),
      ...(method === "OPTIONS"
        ? { "access-control-request-method": "GET" }
        : {}),
    },
  } as Request;

  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      responseHeaders.set(name.toLowerCase(), String(value));
    },
    getHeader(name: string) {
      return responseHeaders.get(name.toLowerCase());
    },
    end() {
      ended = true;
      return response;
    },
  } as unknown as Response;

  const next: NextFunction = (error?: unknown) => {
    nextCalled = true;
    nextError = error;
  };

  cors(createCorsOptions(configuredOrigins))(request, response, next);

  return {
    ended,
    getHeader: (name: string) => responseHeaders.get(name.toLowerCase()) ?? null,
    nextCalled,
    nextError,
    statusCode: response.statusCode,
  };
}

describe("CORS configuration", () => {
  it("allows the direct Vite development origin", () => {
    const result = runCorsMiddleware({ origin: "http://localhost:5173" });

    assert.equal(result.getHeader("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(result.getHeader("access-control-allow-credentials"), "true");
    assert.equal(result.nextCalled, true);
  });

  it("allows the SSH-forwarded development origin", () => {
    const result = runCorsMiddleware({ origin: "http://localhost:8080" });

    assert.equal(result.getHeader("access-control-allow-origin"), "http://localhost:8080");
    assert.equal(result.getHeader("access-control-allow-credentials"), "true");
    assert.equal(result.nextCalled, true);
  });

  it("parses and trims a configured comma-separated allowlist", () => {
    const configuredOrigins =
      " https://portal.example.com,https://admin.example.com ";

    const portalResult = runCorsMiddleware({
      configuredOrigins,
      origin: "https://portal.example.com",
    });
    const adminResult = runCorsMiddleware({
      configuredOrigins,
      origin: "https://admin.example.com",
    });

    assert.equal(
      portalResult.getHeader("access-control-allow-origin"),
      "https://portal.example.com",
    );
    assert.equal(
      adminResult.getHeader("access-control-allow-origin"),
      "https://admin.example.com",
    );
  });

  it("does not add CORS headers for an unlisted origin", () => {
    const result = runCorsMiddleware({
      origin: "https://untrusted.example.com",
    });

    assert.equal(result.getHeader("access-control-allow-origin"), null);
    assert.equal(result.getHeader("access-control-allow-credentials"), null);
    assert.equal(result.nextCalled, true);
    assert.equal(Boolean(result.nextError), false);
  });

  it("allows requests without an Origin header", () => {
    const result = runCorsMiddleware({});

    assert.equal(result.getHeader("access-control-allow-origin"), null);
    assert.equal(result.getHeader("access-control-allow-credentials"), null);
    assert.equal(result.nextCalled, true);
    assert.equal(Boolean(result.nextError), false);
  });

  it("handles credentialed preflight requests", () => {
    const result = runCorsMiddleware({
      method: "OPTIONS",
      origin: "http://localhost:8080",
    });

    assert.equal(result.statusCode, 204);
    assert.equal(result.ended, true);
    assert.equal(result.nextCalled, false);
    assert.equal(result.getHeader("access-control-allow-origin"), "http://localhost:8080");
    assert.equal(result.getHeader("access-control-allow-credentials"), "true");
  });
});

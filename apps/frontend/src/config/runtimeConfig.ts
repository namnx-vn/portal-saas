let runtimeConfig: RuntimeConfig | null = null;

export type RuntimeConfig = {
  schemaVersion: number;
  environment: string;
  apiBaseUrl: string;
  entra: {
    clientId: string;
    tenantName: string;
    tenantId: string;
    redirectUri: string;
  };
};

function assertNonEmpty(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid runtime config: ${name}`);
  }
}

function validateRuntimeConfig(config: RuntimeConfig): RuntimeConfig {
  if (config.schemaVersion !== 1) {
    throw new Error(
      `Unsupported runtime config schema: ${config.schemaVersion}`,
    );
  }

  assertNonEmpty(config.environment, "environment");
  assertNonEmpty(config.apiBaseUrl, "apiBaseUrl");

  assertNonEmpty(config.entra?.clientId, "entra.clientId");

  assertNonEmpty(config.entra?.tenantName, "entra.tenantName");

  assertNonEmpty(config.entra?.tenantId, "entra.tenantId");

  assertNonEmpty(config.entra?.redirectUri, "entra.redirectUri");

  return config;
}

export async function loadRuntimeConfig() {
  const response = await fetch("/runtime-config.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load runtime config: HTTP ${response.status}`);
  }

  const raw = await response.json();

  runtimeConfig = validateRuntimeConfig(raw);

  return runtimeConfig;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    throw new Error("Runtime config has not been loaded");
  }

  return runtimeConfig;
}

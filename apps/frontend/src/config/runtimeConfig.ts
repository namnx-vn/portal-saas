export type RuntimeConfig = {
  environment: string;
  apiBaseUrl: string;
  entra: {
    clientId: string;
    tenantName: string;
    tenantId: string;
    redirectUri: string;
  };
};

let runtimeConfig: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch("/runtime-config.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load runtime config: ${response.status}`,
    );
  }

  const config = (await response.json()) as RuntimeConfig;

  if (
    !config.entra?.clientId ||
    !config.entra?.tenantName ||
    !config.entra?.tenantId ||
    !config.entra?.redirectUri
  ) {
    throw new Error("Invalid runtime config");
  }

  runtimeConfig = config;

  return config;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    throw new Error("Runtime config has not been loaded");
  }

  return runtimeConfig;
}
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

export function useAuthRedirectHandler() {
  const { instance } = useMsal();
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then(async (result) => {
        if (!result) return;

        setStatus("processing");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/session/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-subdomain": "acme",
          },
          credentials: "include",
          body: JSON.stringify({ idToken: result.idToken }),
        });

        setStatus(res.ok ? "done" : "error");
      })
      .catch((err) => {
        console.error("Redirect handling error:", err);
        setStatus("error");
      });
  }, [instance]);

  return status;
}
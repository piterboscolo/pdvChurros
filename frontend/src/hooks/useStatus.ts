import { useEffect, useState } from "react";
import { api } from "../services/api";

export type AppStatus = {
  database: "up" | "down";
  operatorName: null;
  cash: { open: false } | { open: true; openingAmountCents: number };
  printer: { configured: boolean; count: number };
  fiscal: { label: "Desligado" | "Homologação" | "Produção" };
};

export function useStatus(): AppStatus | null {
  const [status, setStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const next = await api<AppStatus>("/api/status");
        if (!cancel) setStatus(next);
      } catch {
        if (!cancel) {
          setStatus({
            database: "down",
            operatorName: null,
            cash: { open: false },
            printer: { configured: false, count: 0 },
            fiscal: { label: "Desligado" },
          });
        }
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, []);

  return status;
}

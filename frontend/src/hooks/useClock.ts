import { useEffect, useState } from "react";

export function useClock(): string {
  const [label, setLabel] = useState(() => formatNow());
  useEffect(() => {
    const timer = window.setInterval(() => setLabel(formatNow()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return label;
}

function formatNow(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

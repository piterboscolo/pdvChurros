import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useShortcuts(onNotice: (message: string) => void): void {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const key = event.key;
      const shortcut = key === "Escape" || /^F\d{1,2}$/.test(key);
      if (!shortcut) return;
      event.preventDefault();

      if (key === "F1") {
        navigate("/");
        window.dispatchEvent(new CustomEvent("pdv:new"));
        return;
      }
      if (key === "F2") {
        navigate("/");
        window.dispatchEvent(new CustomEvent("pdv:search"));
        return;
      }
      if (key === "F3") {
        navigate("/mesas");
        return;
      }
      if (key === "F4") {
        navigate("/comandas");
        return;
      }
      if (key === "F5") {
        navigate("/");
        window.dispatchEvent(new CustomEvent("pdv:finish"));
        return;
      }
      if (key === "F6") {
        navigate("/vendas");
        return;
      }
      if (key === "F7" || key === "F8") {
        onNotice("A abertura e o fechamento do caixa entram na etapa de caixa. Nada foi lançado.");
        return;
      }
      if (key === "Escape") {
        window.dispatchEvent(new CustomEvent("pdv:escape"));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, onNotice]);
}

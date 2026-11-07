import { useEffect, useState } from "react";
import { QueryState } from "../components/QueryState";
import { api } from "../services/api";

type TabRow = {
  id: string;
  number: number;
  label: string | null;
  customerName: string | null;
  status: string;
  openedAt: string;
};

export function TabsPage() {
  const [tabs, setTabs] = useState<TabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ tabs: TabRow[] }>("/api/tabs")
      .then((body) => setTabs(body.tabs))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-auto">
      <h1 className="px-6 pt-6 text-2xl font-semibold">Comandas</h1>
      <QueryState loading={loading} error={error} empty={tabs.length === 0} emptyText="Nenhuma comanda aberta.">
        <ul className="space-y-2 p-6">
          {tabs.map((tab) => (
            <li key={tab.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-4">
              <div>
                <div className="text-lg font-semibold">Comanda {String(tab.number).padStart(3, "0")}</div>
                <div className="text-sm text-stone-500">{tab.customerName || tab.label || "Sem cliente"}</div>
              </div>
              <div className="text-sm text-stone-500">{new Date(tab.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

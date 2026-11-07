import { useEffect, useState } from "react";
import { TABLE_STATUS_LABELS } from "@shared/constants/labels";
import { QueryState } from "../components/QueryState";
import { api } from "../services/api";

type TableRow = {
  id: string;
  number: number;
  label: string | null;
  seats: number;
  status: keyof typeof TABLE_STATUS_LABELS;
};

const tone: Record<TableRow["status"], string> = {
  FREE: "bg-white",
  OCCUPIED: "bg-amber-50",
  WAITING_ORDER: "bg-stone-100",
  WAITING_PAYMENT: "bg-orange-50",
};

export function TablesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ tables: TableRow[] }>("/api/tables")
      .then((body) => setTables(body.tables))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-auto">
      <h1 className="px-6 pt-6 text-2xl font-semibold">Mesas</h1>
      <QueryState loading={loading} error={error} empty={tables.length === 0} emptyText="Nenhuma mesa cadastrada.">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-6">
          {tables.map((table) => (
            <article key={table.id} className={`min-h-28 rounded-2xl border border-stone-200 p-4 ${tone[table.status]}`}>
              <div className="text-3xl font-semibold tabular-nums">{String(table.number).padStart(2, "0")}</div>
              <div className="mt-2 text-sm">{TABLE_STATUS_LABELS[table.status]}</div>
              <div className="text-xs text-stone-500">{table.seats} lugares</div>
            </article>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

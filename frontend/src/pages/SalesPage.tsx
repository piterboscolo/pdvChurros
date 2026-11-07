import { useEffect, useState } from "react";
import { SALE_CHANNEL_LABELS, type SaleChannelCode } from "@shared/constants/labels";
import { QueryState } from "../components/QueryState";
import { api } from "../services/api";
import { formatCents } from "../utils/money";

type SaleRow = {
  id: string;
  number: number;
  status: "COMPLETED" | "CANCELLED";
  channel: SaleChannelCode;
  totalCents: number;
  createdAt: string;
};

export function SalesPage() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ sales: SaleRow[] }>("/api/sales")
      .then((body) => setSales(body.sales))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-auto">
      <h1 className="px-6 pt-6 text-2xl font-semibold">Vendas</h1>
      <QueryState loading={loading} error={error} empty={sales.length === 0} emptyText="Nenhuma venda registrada.">
        <table className="m-6 w-[calc(100%-3rem)] border-separate border-spacing-0 overflow-hidden rounded-2xl bg-white text-left">
          <thead className="text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Horário</th>
              <th className="px-4 py-3 font-medium">Modalidade</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-stone-100">
                <td className="px-4 py-3 tabular-nums">{String(sale.number).padStart(6, "0")}</td>
                <td className="px-4 py-3">{new Date(sale.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3">{SALE_CHANNEL_LABELS[sale.channel]}</td>
                <td className="px-4 py-3">{sale.status === "COMPLETED" ? "Concluída" : "Cancelada"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCents(sale.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </QueryState>
    </div>
  );
}

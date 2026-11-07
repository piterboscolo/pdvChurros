import { useEffect, useState } from "react";
import { SALE_CHANNEL_LABELS, type SaleChannelCode } from "@shared/constants/labels";
import { api } from "../services/api";

type Ticket = {
  id: string;
  number: number;
  status: "WAITING" | "PREPARING" | "READY";
  createdAt: string;
  sectorName: string | null;
  channel: SaleChannelCode;
  customerName: string | null;
  tableNumber: number | null;
  items: {
    id: string;
    productName: string;
    quantity: string;
    notes: string | null;
    addonsSummary: string | null;
  }[];
};

const columns: { status: "WAITING" | "PREPARING" | "READY"; title: string }[] = [
  { status: "WAITING", title: "Aguardando" },
  { status: "PREPARING", title: "Em preparação" },
  { status: "READY", title: "Pronto" },
];

export function KitchenPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = () => {
      api<{ tickets: Ticket[] }>("/api/kitchen/tickets")
        .then((body) => {
          if (!cancel) {
            setTickets(body.tickets);
            setError(null);
          }
        })
        .catch((reason: Error) => {
          if (!cancel) setError(reason.message);
        });
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {error && <p className="px-4 pt-4 text-sm text-stone-700">{error}</p>}
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 p-4">
      {columns.map((column) => {
        const items = tickets.filter((ticket) => ticket.status === column.status);
        return (
          <section key={column.status} className="flex min-h-0 flex-col rounded-2xl bg-white">
            <h1 className="border-b border-stone-100 px-4 py-3 text-lg font-semibold">{column.title}</h1>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
              {!error && items.length === 0 && <p className="text-sm text-stone-500">Nenhum pedido.</p>}
              {items.map((ticket) => (
                <article key={ticket.id} className={`rounded-xl border p-3 ${ageClass(ticket.createdAt)}`}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold">#{String(ticket.number).padStart(4, "0")}</span>
                    <span className="text-xs text-stone-500">{elapsed(ticket.createdAt)}</span>
                  </div>
                  <p className="text-sm text-stone-600">
                    {ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : SALE_CHANNEL_LABELS[ticket.channel]}
                    {ticket.customerName ? ` · ${ticket.customerName}` : ""}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {ticket.items.map((item) => (
                      <li key={item.id}>
                        <span className="font-medium">{item.quantity}× {item.productName}</span>
                        {item.addonsSummary && <div className="text-stone-500">{item.addonsSummary}</div>}
                        {item.notes && <div className="text-stone-500">{item.notes}</div>}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      </div>
    </div>
  );
}

function elapsed(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return `${minutes} min`;
}

function ageClass(iso: string): string {
  const minutes = (Date.now() - new Date(iso).getTime()) / 60000;
  if (minutes >= 20) return "border-orange-300 bg-orange-50";
  if (minutes >= 10) return "border-amber-300 bg-amber-50";
  return "border-stone-200 bg-stone-50";
}

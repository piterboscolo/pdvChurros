import { ChefHat, ClipboardList, LayoutGrid, Receipt, UtensilsCrossed } from "lucide-react";
import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { useClock } from "../hooks/useClock";
import { useShortcuts } from "../hooks/useShortcuts";
import { useStatus } from "../hooks/useStatus";
import { formatCents } from "../utils/money";

const links = [
  { to: "/", label: "PDV", hint: "F1", icon: UtensilsCrossed, end: true },
  { to: "/mesas", label: "Mesas", hint: "F3", icon: LayoutGrid, end: false },
  { to: "/comandas", label: "Comandas", hint: "F4", icon: Receipt, end: false },
  { to: "/vendas", label: "Vendas", hint: "F6", icon: ClipboardList, end: false },
  { to: "/cozinha", label: "Cozinha", hint: "", icon: ChefHat, end: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const clock = useClock();
  const status = useStatus();
  const [notice, setNotice] = useState<string | null>(null);
  useShortcuts(setNotice);

  const cashLabel = status?.cash.open
    ? `Caixa aberto · ${formatCents(status.cash.openingAmountCents)}`
    : "Caixa fechado";
  const printerLabel = status?.printer.configured ? "Impressora configurada" : "Sem impressora";
  const fiscalLabel = status?.fiscal.label ?? "Fiscal";

  return (
    <div className="flex h-full bg-[#f4f1ec] text-stone-900">
      <aside className="flex w-[92px] shrink-0 flex-col items-center gap-1 bg-stone-950 py-4 text-stone-300">
        <div className="mb-4 text-center text-xs font-semibold tracking-wide text-white">PDV</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={link.hint ? `${link.label} (${link.hint})` : link.label}
            className={({ isActive }) =>
              `flex w-[76px] flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium ${
                isActive ? "bg-white text-stone-950" : "hover:bg-stone-800 hover:text-white"
              }`
            }
          >
            <link.icon size={20} strokeWidth={1.75} />
            {link.label}
          </NavLink>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-6 border-b border-amber-900/30 bg-white px-5 text-sm">
          <StatusItem label="Operador" value="Operador" />
          <StatusItem label="Caixa" value={cashLabel} />
          <StatusItem label="Impressora" value={printerLabel} />
          <StatusItem label="Fiscal" value={fiscalLabel} />
          <div className="ml-auto tabular-nums text-stone-600">{clock}</div>
        </header>
        {status?.database === "down" && (
          <div className="bg-amber-100 px-5 py-2 text-sm text-amber-950">
            Sem conexão com o banco. O rascunho fica nesta tela e a venda não é gravada.
          </div>
        )}
        {notice && (
          <div className="flex items-center justify-between gap-4 bg-stone-900 px-5 py-2 text-sm text-white">
            <span>{notice}</span>
            <button type="button" className="min-h-10 rounded-lg bg-white px-3 text-stone-900" onClick={() => setNotice(null)}>
              Fechar
            </button>
          </div>
        )}
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-stone-400">{label}</div>
      <div className="truncate font-medium">{value}</div>
    </div>
  );
}

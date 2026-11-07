import { useEffect, useMemo, useState } from "react";
import { lineTotalCents, parseCents } from "@shared/types/money";
import { api } from "../services/api";
import { draftSubtotalCents, useDraft, type SaleChannel } from "../store/draft";
import { formatCents } from "../utils/money";

type Product = {
  id: string;
  name: string;
  code: string;
  barcode: string | null;
  priceCents: number;
  categoryId: string | null;
  unit: string;
};

type Category = { id: string; name: string; color: string | null };

const channels: { id: SaleChannel; label: string }[] = [
  { id: "TABLE", label: "Mesa" },
  { id: "COUNTER", label: "Balcão" },
  { id: "PICKUP", label: "Retirada" },
  { id: "DELIVERY", label: "Delivery" },
];

const payments = [
  { id: "CASH", label: "Dinheiro" },
  { id: "PIX", label: "PIX" },
  { id: "CREDIT", label: "Crédito" },
  { id: "DEBIT", label: "Débito" },
];

export function PdvPage() {
  const draft = useDraft();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<string | null>(null);
  const [received, setReceived] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"finish" | "discard" | null>(null);

  useEffect(() => {
    let cancel = false;
    api<{ categories: Category[] }>("/api/catalog/categories")
      .then((body) => {
        if (!cancel) setCategories(body.categories);
      })
      .catch((error: Error) => {
        if (!cancel) setCatalogError(error.message);
      });
    api<{ products: Product[] }>("/api/catalog/products")
      .then((body) => {
        if (!cancel) setProducts(body.products);
      })
      .catch((error: Error) => {
        if (!cancel) setCatalogError(error.message);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const focusSearch = () => document.getElementById("product-search")?.focus();
    const onNew = () => {
      if (useDraft.getState().lines.length > 0) setDialog("discard");
      else useDraft.getState().clear();
    };
    const onFinish = () => {
      if (useDraft.getState().lines.length === 0) {
        setMessage("Inclua um item para finalizar.");
        return;
      }
      setDialog("finish");
    };
    const onEscape = () => {
      setDialog(null);
      setMessage(null);
    };
    window.addEventListener("pdv:search", focusSearch);
    window.addEventListener("pdv:new", onNew);
    window.addEventListener("pdv:finish", onFinish);
    window.addEventListener("pdv:escape", onEscape);
    return () => {
      window.removeEventListener("pdv:search", focusSearch);
      window.removeEventListener("pdv:new", onNew);
      window.removeEventListener("pdv:finish", onFinish);
      window.removeEventListener("pdv:escape", onEscape);
    };
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryId && product.categoryId !== categoryId) return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.barcode === search.trim()
      );
    });
  }, [products, categoryId, search]);

  const subtotal = draftSubtotalCents(draft.lines);
  const fee = draft.channel === "DELIVERY" ? parseCents(draft.deliveryFee) ?? 0 : 0;
  const total = subtotal + fee;
  const receivedCents = parseCents(received);
  const change = payment === "CASH" && receivedCents !== null ? receivedCents - total : null;

  function addFromSearch() {
    const term = search.trim();
    const match = products.find((product) => product.barcode === term || product.code.toLowerCase() === term.toLowerCase());
    if (!match) {
      setMessage(visible.length === 0 ? "Nenhum produto encontrado." : null);
      return;
    }
    draft.addProduct({ id: match.id, name: match.name, priceCents: match.priceCents });
    setSearch("");
    setMessage(null);
  }

  return (
    <div className="grid h-full min-h-[640px] min-w-[1180px] grid-cols-[minmax(440px,38%)_minmax(400px,34%)_minmax(300px,28%)]">
      <section className="flex min-h-0 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-3">
          <input
            id="product-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addFromSearch();
            }}
            placeholder="Buscar nome ou código (F2)"
            className="h-14 w-full rounded-xl border border-stone-300 px-4 text-base"
          />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex w-[148px] shrink-0 flex-col gap-2 overflow-auto border-r border-stone-100 p-3">
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className={`min-h-14 rounded-xl px-3 text-left text-sm font-semibold ${categoryId === null ? "bg-stone-900 text-white" : "bg-stone-100"}`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`min-h-14 rounded-xl px-3 text-left text-sm font-semibold ${categoryId === category.id ? "bg-stone-900 text-white" : "bg-stone-100"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {catalogError && <p className="text-sm text-stone-600">{catalogError}</p>}
            {!catalogError && visible.length === 0 && (
              <p className="px-2 py-6 text-sm text-stone-500">Nenhum produto cadastrado.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {visible.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    draft.addProduct({ id: product.id, name: product.name, priceCents: product.priceCents });
                    setMessage(null);
                  }}
                  className="min-h-[104px] rounded-xl border border-stone-200 bg-[#faf8f5] px-3 py-3 text-left hover:border-stone-500"
                >
                  <span className="block text-base font-semibold leading-snug">{product.name}</span>
                  <span className="mt-3 block text-sm tabular-nums text-stone-600">{formatCents(product.priceCents)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-col bg-[#f7f4ef]">
        <div className="grid grid-cols-4 gap-2 p-3">
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => draft.setChannel(channel.id)}
              className={`h-12 min-w-0 rounded-xl px-1 text-sm font-semibold ${draft.channel === channel.id ? "bg-stone-900 text-white" : "bg-white text-stone-800"}`}
            >
              {channel.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 px-3">
          {draft.channel === "TABLE" && (
            <>
              <Field label="Mesa" value={draft.tableNumber} onChange={(value) => draft.setField("tableNumber", value)} />
              <Field label="Pessoas" value={draft.peopleCount} onChange={(value) => draft.setField("peopleCount", value)} />
              <Field label="Cliente" value={draft.customerName} onChange={(value) => draft.setField("customerName", value)} />
            </>
          )}
          {draft.channel === "PICKUP" && (
            <Field label="Nome para chamar" value={draft.customerName} onChange={(value) => draft.setField("customerName", value)} />
          )}
          {draft.channel === "DELIVERY" && (
            <>
              <Field label="Cliente" value={draft.customerName} onChange={(value) => draft.setField("customerName", value)} />
              <Field label="Telefone" value={draft.phone} onChange={(value) => draft.setField("phone", value)} />
              <Field label="Endereço" value={draft.street} onChange={(value) => draft.setField("street", value)} />
              <Field label="Número" value={draft.addressNumber} onChange={(value) => draft.setField("addressNumber", value)} />
              <Field label="Complemento" value={draft.complement} onChange={(value) => draft.setField("complement", value)} />
              <Field label="Referência" value={draft.reference} onChange={(value) => draft.setField("reference", value)} />
              <Field label="Bairro" value={draft.district} onChange={(value) => draft.setField("district", value)} />
              <Field label="Taxa" value={draft.deliveryFee} onChange={(value) => draft.setField("deliveryFee", value)} />
            </>
          )}
          {draft.channel === "COUNTER" && (
            <p className="col-span-2 px-1 text-sm text-stone-500">Venda imediata no balcão.</p>
          )}
        </div>
        <p className="px-4 pt-3 text-xs text-stone-500">Rascunho deste caixa. A venda ainda não é gravada.</p>
        <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
          {draft.lines.length === 0 && <p className="px-1 py-8 text-center text-stone-500">Nenhum item na conta.</p>}
          <ul className="space-y-2">
            {draft.lines.map((line) => (
              <li key={line.key} className="rounded-xl bg-white px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{line.name}</div>
                    <div className="text-sm tabular-nums text-stone-500">{formatCents(line.unitPriceCents)}</div>
                  </div>
                  <div className="tabular-nums font-semibold">{formatCents(lineTotalCents(line.unitPriceCents, line.quantity))}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" className="h-12 w-12 rounded-lg bg-stone-100 text-xl" onClick={() => draft.setQuantity(line.key, line.quantity - 1)}>−</button>
                  <span className="w-8 text-center tabular-nums">{line.quantity}</span>
                  <button type="button" className="h-12 w-12 rounded-lg bg-stone-100 text-xl" onClick={() => draft.setQuantity(line.key, line.quantity + 1)}>+</button>
                  <button type="button" className="ml-auto h-12 rounded-lg px-3 text-sm text-stone-600" onClick={() => draft.removeLine(line.key)}>Remover</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {message && <p className="px-4 pb-3 text-sm text-stone-700">{message}</p>}
      </section>

      <section className="flex min-h-0 flex-col border-l border-stone-200 bg-white">
        <div className="space-y-3 p-4">
          <Row label="Subtotal" value={formatCents(subtotal)} />
          <Row label="Desconto" value={formatCents(0)} />
          <Row label="Taxa" value={formatCents(fee)} />
        </div>
        <div className="mx-4 rounded-2xl bg-stone-950 px-4 py-4 text-white">
          <div className="text-xs uppercase tracking-wide text-stone-400">Total</div>
          <div className="text-4xl font-semibold tabular-nums">{formatCents(total)}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-4">
          {payments.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPayment(item.id)}
              className={`h-14 rounded-xl text-sm font-semibold ${payment === item.id ? "bg-stone-900 text-white" : "bg-stone-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {payment === "CASH" && (
          <div className="px-4">
            <label className="text-xs text-stone-500" htmlFor="received">Valor recebido</label>
            <input
              id="received"
              value={received}
              onChange={(event) => setReceived(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 h-14 w-full rounded-xl border border-stone-300 px-3 text-lg tabular-nums"
            />
            {change !== null && change < 0 && <p className="mt-2 text-sm">Valor recebido menor que o total.</p>}
            {change !== null && change >= 0 && <p className="mt-2 text-sm tabular-nums">Troco {formatCents(change)}</p>}
          </div>
        )}
        <div className="mt-auto p-4">
          <button
            type="button"
            onClick={() => {
              if (draft.lines.length === 0) {
                setMessage("Inclua um item para finalizar.");
                return;
              }
              setDialog("finish");
            }}
            className="h-14 w-full rounded-xl bg-stone-900 text-base font-semibold text-white"
          >
            Finalizar · F5
          </button>
        </div>
      </section>

      {dialog && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/40 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-xl font-semibold">
              {dialog === "finish" ? "A venda ainda não é gravada" : "Descartar o rascunho?"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {dialog === "finish"
                ? "Caixa, pagamento e envio para a cozinha entram nas próximas etapas. Nada foi lançado no caixa."
                : "Os itens desta tela serão apagados. Não existe venda gravada neste rascunho."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="h-12 rounded-xl px-4" onClick={() => setDialog(null)}>Voltar</button>
              {dialog === "discard" && (
                <button
                  type="button"
                  className="h-12 rounded-xl bg-stone-900 px-4 text-white"
                  onClick={() => {
                    draft.clear();
                    setDialog(null);
                    setMessage(null);
                  }}
                >
                  Descartar
                </button>
              )}
              {dialog === "finish" && (
                <button type="button" className="h-12 rounded-xl bg-stone-900 px-4 text-white" onClick={() => setDialog(null)}>
                  Continuar o atendimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-stone-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-stone-200 bg-white px-3" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

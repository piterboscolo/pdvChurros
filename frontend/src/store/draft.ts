import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { lineTotalCents } from "@shared/types/money";

export type SaleChannel = "TABLE" | "COUNTER" | "PICKUP" | "DELIVERY";

export type DraftLine = {
  key: string;
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

type DraftState = {
  channel: SaleChannel;
  tableNumber: string;
  peopleCount: string;
  customerName: string;
  phone: string;
  street: string;
  addressNumber: string;
  complement: string;
  district: string;
  reference: string;
  deliveryFee: string;
  lines: DraftLine[];
  setChannel: (channel: SaleChannel) => void;
  setField: (field: DraftField, value: string) => void;
  addProduct: (product: { id: string; name: string; priceCents: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
};

type DraftField =
  | "tableNumber"
  | "peopleCount"
  | "customerName"
  | "phone"
  | "street"
  | "addressNumber"
  | "complement"
  | "district"
  | "reference"
  | "deliveryFee";

const empty = {
  channel: "COUNTER" as const,
  tableNumber: "",
  peopleCount: "",
  customerName: "",
  phone: "",
  street: "",
  addressNumber: "",
  complement: "",
  district: "",
  reference: "",
  deliveryFee: "",
  lines: [] as DraftLine[],
};

export const useDraft = create<DraftState>()(
  persist(
    (set) => ({
      ...empty,
      setChannel: (channel) => set({ channel }),
      setField: (field, value) => set({ [field]: value }),
      addProduct: (product) =>
        set((state) => {
          const existing = state.lines.find((line) => line.productId === product.id);
          if (existing) {
            const quantity = Math.min(existing.quantity + 1, 999);
            return {
              lines: state.lines.map((line) =>
                line.key === existing.key ? { ...line, quantity } : line,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                key: crypto.randomUUID(),
                productId: product.id,
                name: product.name,
                unitPriceCents: product.priceCents,
                quantity: 1,
              },
            ],
          };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.key !== key)
              : state.lines.map((line) =>
                  line.key === key ? { ...line, quantity: Math.min(quantity, 999) } : line,
                ),
        })),
      removeLine: (key) => set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),
      clear: () => set({ ...empty }),
    }),
    {
      name: "pdv-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        channel: state.channel,
        tableNumber: state.tableNumber,
        peopleCount: state.peopleCount,
        customerName: state.customerName,
        phone: state.phone,
        street: state.street,
        addressNumber: state.addressNumber,
        complement: state.complement,
        district: state.district,
        reference: state.reference,
        deliveryFee: state.deliveryFee,
        lines: state.lines,
      }),
    },
  ),
);

export function draftSubtotalCents(lines: DraftLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line.unitPriceCents, line.quantity), 0);
}

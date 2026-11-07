/**
 * Valor em centavos de real. R$ 10,50 é 1050.
 * Operações de dinheiro usam inteiro. Quantidade de estoque usa Decimal no banco.
 */
export type MoneyCents = number;

/** Quantidade decimal representada como texto até o serviço converter com Decimal. */
export type DecimalString = string;

/** Total da linha em centavos. Quantidade inteira nesta etapa da tela. */
export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  if (!Number.isInteger(unitPriceCents) || !Number.isInteger(quantity)) {
    throw new Error("Preço e quantidade da linha precisam ser inteiros.");
  }
  return unitPriceCents * quantity;
}

/**
 * Converte texto digitado em centavos.
 * Aceita 10,50 e 1.234,56. Devolve null quando o texto não é um valor.
 */
export function parseCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const [reais, frac = ""] = normalized.split(".");
  const cents = Number(reais) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

/**
 * Conversões padrão de unidade, em texto decimal.
 * O serviço converte com Decimal. Fatores específicos de um produto ficam em unit_conversions.
 */
export const STANDARD_UNIT_FACTORS = [
  { from: "kg", to: "g", factor: "1000" },
  { from: "g", to: "kg", factor: "0.001" },
  { from: "l", to: "ml", factor: "1000" },
  { from: "ml", to: "l", factor: "0.001" },
] as const;

export const COMMON_UNITS = ["un", "g", "kg", "ml", "l", "porcao"] as const;

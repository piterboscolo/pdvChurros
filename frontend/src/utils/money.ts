export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const reais = Math.trunc(absolute / 100);
  const frac = String(absolute % 100).padStart(2, "0");
  return `${sign}R$ ${reais.toLocaleString("pt-BR")},${frac}`;
}

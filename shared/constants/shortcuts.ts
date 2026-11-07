/** Atalhos iniciais. Um registro em shortcut_bindings substitui o padrão da ação. */
export const SHORTCUT_ACTIONS = {
  SALE_NEW: "sale.new",
  PRODUCT_SEARCH: "product.search",
  TABLES_OPEN: "tables.open",
  TABS_OPEN: "tabs.open",
  SALE_FINISH: "sale.finish",
  SALES_LIST: "sales.list",
  CASH_OPEN: "cash.open",
  CASH_CLOSE: "cash.close",
  NAVIGATION_BACK: "navigation.back",
} as const;

export type ShortcutAction = (typeof SHORTCUT_ACTIONS)[keyof typeof SHORTCUT_ACTIONS];

export const DEFAULT_SHORTCUTS: Record<ShortcutAction, string> = {
  [SHORTCUT_ACTIONS.SALE_NEW]: "F1",
  [SHORTCUT_ACTIONS.PRODUCT_SEARCH]: "F2",
  [SHORTCUT_ACTIONS.TABLES_OPEN]: "F3",
  [SHORTCUT_ACTIONS.TABS_OPEN]: "F4",
  [SHORTCUT_ACTIONS.SALE_FINISH]: "F5",
  [SHORTCUT_ACTIONS.SALES_LIST]: "F6",
  [SHORTCUT_ACTIONS.CASH_OPEN]: "F7",
  [SHORTCUT_ACTIONS.CASH_CLOSE]: "F8",
  [SHORTCUT_ACTIONS.NAVIGATION_BACK]: "Escape",
};

export const SHORTCUT_LABELS: Record<ShortcutAction, string> = {
  [SHORTCUT_ACTIONS.SALE_NEW]: "Nova venda",
  [SHORTCUT_ACTIONS.PRODUCT_SEARCH]: "Pesquisar produto",
  [SHORTCUT_ACTIONS.TABLES_OPEN]: "Consultar mesas",
  [SHORTCUT_ACTIONS.TABS_OPEN]: "Consultar comandas",
  [SHORTCUT_ACTIONS.SALE_FINISH]: "Finalizar pedido",
  [SHORTCUT_ACTIONS.SALES_LIST]: "Consultar vendas",
  [SHORTCUT_ACTIONS.CASH_OPEN]: "Abrir caixa",
  [SHORTCUT_ACTIONS.CASH_CLOSE]: "Fechar caixa",
  [SHORTCUT_ACTIONS.NAVIGATION_BACK]: "Voltar ou fechar",
};

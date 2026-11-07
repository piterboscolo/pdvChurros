/**
 * Chaves estáveis de permissão. O banco guarda as mesmas strings.
 * Um usuário recebe a permissão do perfil, salvo exceção em user_permissions.
 */
export const PERMISSIONS = {
  PDV_OPERATE: "pdv.operate",
  KITCHEN_VIEW: "kitchen.view",
  DELIVERY_MANAGE: "delivery.manage",
  DISCOUNT_APPLY: "discount.apply",
  SALE_CANCEL: "sale.cancel",
  ORDER_ITEM_CANCEL: "order_item.cancel",
  CASH_OPEN: "cash.open",
  CASH_CLOSE: "cash.close",
  CASH_WITHDRAW: "cash.withdraw",
  CASH_SUPPLY: "cash.supply",
  CASH_EXPENSE: "cash.expense",
  PRICE_OVERRIDE: "price.override",
  STOCK_ADJUST: "stock.adjust",
  STOCK_INVENTORY: "stock.inventory",
  DOCUMENT_REPRINT: "document.reprint",
  REPORT_FINANCIAL: "report.financial.view",
  REPORT_OPERATIONAL: "report.operational.view",
  PRODUCT_MANAGE: "product.manage",
  USER_MANAGE: "user.manage",
  USER_RECOVER: "user.recover",
  FISCAL_ISSUE: "fiscal.issue",
  FISCAL_CANCEL: "fiscal.cancel",
  FISCAL_CONFIGURE: "fiscal.configure",
  PRINTER_CONFIGURE: "printer.configure",
  BACKUP_CREATE: "backup.create",
  BACKUP_RESTORE: "backup.restore",
  TABLE_MANAGE: "table.manage",
  TAB_MANAGE: "tab.manage",
  ORDER_TRANSFER: "order.transfer",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  [PERMISSIONS.PDV_OPERATE]: "Operar vendas, mesas e comandas",
  [PERMISSIONS.KITCHEN_VIEW]: "Ver e atualizar a produção da cozinha",
  [PERMISSIONS.DELIVERY_MANAGE]: "Registrar e acompanhar delivery",
  [PERMISSIONS.DISCOUNT_APPLY]: "Aplicar descontos",
  [PERMISSIONS.SALE_CANCEL]: "Cancelar vendas",
  [PERMISSIONS.ORDER_ITEM_CANCEL]: "Cancelar itens",
  [PERMISSIONS.CASH_OPEN]: "Abrir caixa",
  [PERMISSIONS.CASH_CLOSE]: "Fechar caixa",
  [PERMISSIONS.CASH_WITHDRAW]: "Realizar sangria",
  [PERMISSIONS.CASH_SUPPLY]: "Realizar suprimento",
  [PERMISSIONS.CASH_EXPENSE]: "Lançar despesa de caixa",
  [PERMISSIONS.PRICE_OVERRIDE]: "Alterar preço na venda",
  [PERMISSIONS.STOCK_ADJUST]: "Ajustar estoque",
  [PERMISSIONS.STOCK_INVENTORY]: "Fazer inventário",
  [PERMISSIONS.DOCUMENT_REPRINT]: "Reimprimir documentos",
  [PERMISSIONS.REPORT_FINANCIAL]: "Consultar relatórios financeiros",
  [PERMISSIONS.REPORT_OPERATIONAL]: "Consultar relatórios de operação",
  [PERMISSIONS.PRODUCT_MANAGE]: "Cadastrar produtos e fichas técnicas",
  [PERMISSIONS.USER_MANAGE]: "Cadastrar e ativar funcionários",
  [PERMISSIONS.USER_RECOVER]: "Recuperar acesso de usuário",
  [PERMISSIONS.FISCAL_ISSUE]: "Emitir NFC-e",
  [PERMISSIONS.FISCAL_CANCEL]: "Cancelar NFC-e",
  [PERMISSIONS.FISCAL_CONFIGURE]: "Alterar configuração fiscal",
  [PERMISSIONS.PRINTER_CONFIGURE]: "Configurar impressoras",
  [PERMISSIONS.BACKUP_CREATE]: "Gerar backup",
  [PERMISSIONS.BACKUP_RESTORE]: "Restaurar backup",
  [PERMISSIONS.TABLE_MANAGE]: "Abrir, transferir e fechar mesas",
  [PERMISSIONS.TAB_MANAGE]: "Abrir, juntar e encerrar comandas",
  [PERMISSIONS.ORDER_TRANSFER]: "Transferir itens entre mesas ou comandas",
  [PERMISSIONS.SETTINGS_MANAGE]: "Alterar configurações do estabelecimento",
};

export const ROLES = {
  ADMIN: "ADMINISTRADOR",
  MANAGER: "GERENTE",
  OPERATOR: "OPERADOR",
  KITCHEN: "COZINHA",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const MANAGER_EXCLUDED = new Set<PermissionKey>([
  PERMISSIONS.USER_MANAGE,
  PERMISSIONS.USER_RECOVER,
  PERMISSIONS.FISCAL_CONFIGURE,
  PERMISSIONS.FISCAL_CANCEL,
  PERMISSIONS.BACKUP_RESTORE,
  PERMISSIONS.SETTINGS_MANAGE,
]);

/** Permissões iniciais do perfil. Exceções por funcionário ficam em user_permissions. */
export const ROLE_DEFAULT_PERMISSIONS: Record<RoleCode, readonly PermissionKey[]> = {
  [ROLES.ADMIN]: ALL_PERMISSIONS,
  [ROLES.MANAGER]: ALL_PERMISSIONS.filter((key) => !MANAGER_EXCLUDED.has(key)),
  [ROLES.OPERATOR]: [
    PERMISSIONS.PDV_OPERATE,
    PERMISSIONS.DELIVERY_MANAGE,
    PERMISSIONS.TABLE_MANAGE,
    PERMISSIONS.TAB_MANAGE,
  ],
  [ROLES.KITCHEN]: [PERMISSIONS.KITCHEN_VIEW],
};

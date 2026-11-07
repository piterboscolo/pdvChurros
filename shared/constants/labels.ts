/** Rótulos de tela. O banco persiste o código; a interface mostra o texto. */

export const SALE_CHANNELS = {
  TABLE: "TABLE",
  COUNTER: "COUNTER",
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
  TAB: "TAB",
} as const;

export type SaleChannelCode = (typeof SALE_CHANNELS)[keyof typeof SALE_CHANNELS];

export const SALE_CHANNEL_LABELS: Record<SaleChannelCode, string> = {
  TABLE: "Mesa",
  COUNTER: "Balcão",
  PICKUP: "Retirada",
  DELIVERY: "Delivery",
  TAB: "Comanda",
};

export const ORDER_STATUS_LABELS = {
  OPEN: "Recebido",
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "Em preparação",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  AWAITING_PAYMENT: "Aguardando pagamento",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
} as const;

export const TABLE_STATUS_LABELS = {
  FREE: "Livre",
  OCCUPIED: "Ocupada",
  WAITING_ORDER: "Aguardando pedido",
  WAITING_PAYMENT: "Aguardando fechamento",
} as const;

export const KITCHEN_TICKET_LABELS = {
  WAITING: "Aguardando",
  PREPARING: "Em preparação",
  READY: "Pronto",
  DONE: "Finalizado",
  CANCELLED: "Cancelado",
} as const;

export const PAYMENT_KIND_LABELS = {
  CASH: "Dinheiro",
  PIX: "PIX",
  CREDIT: "Crédito",
  DEBIT: "Débito",
  OTHER: "Outros",
} as const;

export const FISCAL_STATUS_LABELS = {
  NOT_ISSUED: "Não emitida",
  PENDING: "Pendente",
  PROCESSING: "Em processamento",
  AUTHORIZED: "Autorizada",
  REJECTED: "Rejeitada",
  CANCELLED: "Cancelada",
  CONTINGENCY: "Em contingência",
} as const;

/** Sequências operacionais. A numeração da NFC-e fica em fiscal_number_sequences. */
export const NUMBER_SEQUENCES = {
  ORDER: "ORDER",
  SALE: "SALE",
  KITCHEN: "KITCHEN",
} as const;

export type BudgetItemCategory =
  | "espacio"
  | "catering"
  | "bebidas"
  | "tarta"
  | "decoracion"
  | "foto_video"
  | "musica"
  | "transporte"
  | "alojamiento"
  | "papeleria"
  | "regalos"
  | "vestuario"
  | "belleza"
  | "alianzas"
  | "imprevistos"
  | "otro";

export type BudgetItemType = "fixed" | "variable";

export type BudgetVariableSource =
  | "confirmedAdults"
  | "confirmedChildren"
  | "confirmedGuests"
  | "requestedTransportSeats";

export interface BudgetVariableConfig {
  sourceType: BudgetVariableSource;
  unitPrice: number;
  plannedQuantity: number;
}

export interface BudgetItem {
  id: string;
  name: string;
  category: BudgetItemCategory;
  type: BudgetItemType;
  plannedAmount: number;
  paidAmount: number;
  notes?: string;
  active: boolean;
  order: number;
  variableConfig?: BudgetVariableConfig;
}

export interface BudgetDocument {
  items: BudgetItem[];
  updatedAt: number;
}

export interface BudgetDynamicContext {
  confirmedAdults: number;
  confirmedChildren: number;
  confirmedGuests: number;
  requestedTransportSeats: number;
}

export interface BudgetComputedItem extends BudgetItem {
  plannedAmountComputed: number;
  currentAmountComputed: number;
  pendingAmountComputed: number;
  currentQuantity?: number;
  plannedQuantity?: number;
  sourceLabel?: string;
}

export interface BudgetComputedSummary {
  plannedTotal: number;
  paidTotal: number;
  pendingTotal: number;
  currentEstimatedTotal: number;
  deviationTotal: number;
  dynamicPlannedTotal: number;
  dynamicCurrentTotal: number;
  dynamicImpact: number;
}

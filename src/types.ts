export interface Equipment {
  id: string;
  assetNumber: string;
  description: string;
  brand: string;
  model: string;
  specs?: string;
  status: 'ativo' | 'manutenção' | 'desativado';
  location: string;
  responsible: string;
  acquisitionDate: string;
  value: number;
}

export interface HistoryEntry {
  id: string;
  equipmentId: string;
  timestamp: string;
  user: string;
  changeType: 'criou' | 'editou' | 'excluiu' | 'alterou status';
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export type ToastType = 'success' | 'error' | 'info';
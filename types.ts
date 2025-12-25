
export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED'
}

export type ReturnCondition = 'GOOD' | 'DAMAGED' | 'PARTIAL' | 'LOST';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  location: string;
  lastUpdated: string;
}

export interface BorrowRecord {
  id: string;
  itemId: string;
  itemName: string;
  specialistName: string;
  department: string;
  borrowDate: string;
  expectedReturnDate: string;
  quantity: number;
  status: 'ACTIVE' | 'RETURNED';
  acknowledgementSignature: string;
  borrowProof?: string; // New field for base64 image
}

export interface TransactionLog {
  id: string;
  type: 'RECEIVE' | 'BORROW' | 'RETURN' | 'ADJUST';
  itemId: string;
  itemName: string;
  quantity: number;
  user: string;
  timestamp: string;
  notes?: string;
  condition?: ReturnCondition;
  proofImage?: string; // New field for base64 image
}

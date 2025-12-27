
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

export type UserRole = 'ADMIN' | 'MEMBER';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  pin?: string;
  avatar?: string;
}

export interface TransactionLog {
  id: string;
  type: 'RECEIVE' | 'BORROW' | 'RETURN' | 'ADJUST' | 'DELETE' | 'ADD';
  itemId: string;
  itemName: string;
  quantity: number;
  user: string; // The person borrowing/returning (Specialist)
  operator: string; // The person performing the action in the app (Admin/Member)
  timestamp: string;
  notes?: string;
  condition?: ReturnCondition;
  proofImage?: string;
}

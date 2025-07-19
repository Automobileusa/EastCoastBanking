export interface User {
  id: number;
  userId: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: 'chequing' | 'savings' | 'tfsa' | 'term_deposit';
  accountName: string;
  balance: string;
  currency: string;
  isActive: boolean;
  interestRate?: string;
  maturityDate?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  transactionType: 'debit' | 'credit' | 'transfer';
  amount: string;
  description: string;
  category?: string;
  referenceNumber?: string;
  balanceAfter: string;
  status: 'pending' | 'completed' | 'failed';
  transactionDate: string;
}

export interface BillPayment {
  id: number;
  userId: number;
  fromAccountId: number;
  payeeName: string;
  amount: string;
  accountNumber?: string;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'failed';
  scheduledDate?: string;
  processedDate?: string;
  createdAt: string;
}

export interface ChequeOrder {
  id: number;
  userId: number;
  accountId: number;
  orderNumber: string;
  chequeStyle: string;
  quantity: number;
  startingNumber: number;
  deliveryAddress: string;
  deliveryMethod: string;
  totalCost: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
}

export interface ExternalAccount {
  id: number;
  userId: number;
  institutionName: string;
  accountType: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  accountNickname?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  microDeposit1?: string;
  microDeposit2?: string;
  verificationAttempts: number;
  linkedDate?: string;
  createdAt: string;
}

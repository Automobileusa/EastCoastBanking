import { ShoppingCart, ArrowDown, Home, ArrowLeftRight, CreditCard } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface TransactionItemProps {
  transaction: Transaction;
}

const transactionIcons = {
  grocery: ShoppingCart,
  deposit: ArrowDown,
  bill: Home,
  transfer: ArrowLeftRight,
  card: CreditCard,
};

const getTransactionIcon = (description: string, type: string) => {
  const desc = description.toLowerCase();
  
  if (desc.includes("grocery") || desc.includes("store")) return ShoppingCart;
  if (desc.includes("deposit") || desc.includes("salary")) return ArrowDown;
  if (desc.includes("water") || desc.includes("power") || desc.includes("utility")) return Home;
  if (desc.includes("transfer")) return ArrowLeftRight;
  if (type === "credit") return ArrowDown;
  
  return ShoppingCart; // Default icon
};

const getTransactionColor = (type: string, amount: string) => {
  const isPositive = parseFloat(amount) > 0;
  
  if (type === "credit" || isPositive) {
    return "bg-green-100 text-green-600";
  }
  
  return "bg-gray-100 text-gray-600";
};

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const Icon = getTransactionIcon(transaction.description, transaction.transactionType);
  const iconColor = getTransactionColor(transaction.transactionType, transaction.amount);
  const isPositive = parseFloat(transaction.amount) > 0;

  const formatCurrency = (amount: string) => {
    const value = parseFloat(amount);
    const formatted = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(Math.abs(value));
    
    return isPositive ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (transactionDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (transactionDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">{formatDate(transaction.transactionDate)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
      </div>
    </div>
  );
}

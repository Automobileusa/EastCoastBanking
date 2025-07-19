import { Card, CardContent } from "@/components/ui/card";
import { Wallet, PiggyBank, TrendingUp, Award } from "lucide-react";
import type { Account } from "@/lib/types";

interface AccountCardProps {
  account: Account;
}

const accountIcons = {
  chequing: Wallet,
  savings: PiggyBank,
  tfsa: TrendingUp,
  term_deposit: Award,
};

const accountColors = {
  chequing: "bg-green-100 text-green-600",
  savings: "bg-blue-100 text-blue-600",
  tfsa: "bg-purple-100 text-purple-600",
  term_deposit: "bg-orange-100 text-orange-600",
};

export default function AccountCard({ account }: AccountCardProps) {
  const Icon = accountIcons[account.accountType as keyof typeof accountIcons] || Wallet;
  const iconColor = accountColors[account.accountType as keyof typeof accountColors] || "bg-gray-100 text-gray-600";

  const formatAccountType = (type: string) => {
    switch (type) {
      case "chequing":
        return "Chequing";
      case "savings":
        return "Savings";
      case "tfsa":
        return "TFSA";
      case "term_deposit":
        return "Term Deposit";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(parseFloat(amount));
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (accountNumber.length >= 4) {
      return `****${accountNumber.slice(-4)}`;
    }
    return accountNumber;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatAccountType(account.accountType)}
          </h3>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mb-2">
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(account.balance)}
          </p>
          <p className="text-sm text-gray-500">
            {account.accountType === "term_deposit" && account.maturityDate
              ? `Maturity: ${new Date(account.maturityDate).toLocaleDateString()}`
              : "Available Balance"}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Account: {formatAccountNumber(account.accountNumber)}
        </p>
        {account.interestRate && (
          <p className="text-xs text-gray-500 mt-1">
            Rate: {parseFloat(account.interestRate).toFixed(2)}% APY
          </p>
        )}
      </CardContent>
    </Card>
  );
}

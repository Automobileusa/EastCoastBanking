import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AccountCard from "@/components/AccountCard";
import TransactionItem from "@/components/TransactionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Send, Receipt, CheckSquare, Link } from "lucide-react";
import type { Account, Transaction } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: !!user,
  });

  // Get recent transactions from the first account (chequing)
  const chequingAccount = accounts.find((acc) => acc.accountType === "chequing");
  
  const { data: recentTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/accounts", chequingAccount?.id, "transactions"],
    enabled: !!chequingAccount,
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${chequingAccount!.id}/transactions?limit=5`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const quickActions = [
    {
      title: "Transfer Money",
      icon: Send,
      path: "/transfer",
    },
    {
      title: "Pay Bills",
      icon: Receipt,
      path: "/bills",
    },
    {
      title: "Order Cheques",
      icon: CheckSquare,
      path: "/cheques",
    },
    {
      title: "Link Accounts",
      icon: Link,
      path: "/external",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Welcome back, {user?.name}. Here's your account overview.
          </p>
        </div>

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>

        {/* Recent Transactions and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Recent Transactions
                  </CardTitle>
                  <Button
                    variant="link"
                    onClick={() => setLocation("/transactions")}
                    className="text-eccu-blue hover:text-eccu-blue-dark text-sm font-medium"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="w-full flex items-center justify-between p-4 h-auto border-gray-200 hover:bg-gray-50"
                      onClick={() => setLocation(action.path)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-eccu-blue" />
                        <span className="font-medium text-gray-900">{action.title}</span>
                      </div>
                      <div className="h-4 w-4 text-gray-400">→</div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Total Balance Card */}
            <Card className="bg-gradient-to-r from-eccu-blue to-eccu-blue-dark text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
                <p className="text-3xl font-bold mb-4">{formatCurrency(totalBalance)}</p>
                <p className="text-blue-100 text-sm">Across all accounts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

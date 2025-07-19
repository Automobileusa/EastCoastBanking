import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AccountCard from "@/components/AccountCard";
import { useAuth } from "@/hooks/use-auth";
import type { Account } from "@/lib/types";

export default function Accounts() {
  const { user } = useAuth();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Accounts</h2>
            <p className="text-gray-600">View and manage all your accounts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Accounts</h2>
          <p className="text-gray-600">View and manage all your accounts.</p>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No accounts found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Contact us if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

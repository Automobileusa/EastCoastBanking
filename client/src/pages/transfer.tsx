import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Transfer() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Money</h2>
          <p className="text-gray-600">Transfer funds between your accounts or to external accounts.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Money Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Transfer functionality coming soon</p>
              <p className="text-gray-400 text-sm mt-2">
                This feature will allow you to transfer money between accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

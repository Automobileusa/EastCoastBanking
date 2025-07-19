import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Zap, Droplets, Wifi, CreditCard } from "lucide-react";
import type { Account, BillPayment } from "@/lib/types";

const billPaymentSchema = z.object({
  fromAccountId: z.string().min(1, "Please select an account"),
  payeeName: z.string().min(1, "Please select a payee"),
  amount: z.string().regex(/^\d+\.?\d{0,2}$/, "Please enter a valid amount"),
  accountNumber: z.string().optional(),
});

type BillPaymentForm = z.infer<typeof billPaymentSchema>;

const predefinedPayees = [
  { name: "Halifax Power", icon: Zap, color: "text-red-600 bg-red-100" },
  { name: "Halifax Water", icon: Droplets, color: "text-blue-600 bg-blue-100" },
  { name: "Rogers Communications", icon: Wifi, color: "text-purple-600 bg-purple-100" },
  { name: "TD Mastercard", icon: CreditCard, color: "text-green-600 bg-green-100" },
];

export default function Bills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: !!user,
  });

  const { data: billPayments = [] } = useQuery<BillPayment[]>({
    queryKey: ["/api/bill-payments"],
    enabled: !!user,
  });

  const form = useForm<BillPaymentForm>({
    resolver: zodResolver(billPaymentSchema),
    defaultValues: {
      fromAccountId: "",
      payeeName: "",
      amount: "",
      accountNumber: "",
    },
  });

  const billPaymentMutation = useMutation({
    mutationFn: async (data: BillPaymentForm) => {
      const response = await apiRequest("POST", "/api/bill-payments", {
        fromAccountId: parseInt(data.fromAccountId),
        payeeName: data.payeeName,
        amount: data.amount,
        accountNumber: data.accountNumber,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresOTP) {
        setPendingPaymentId(data.billPaymentId);
        setShowOTPDialog(true);
        toast({
          title: "OTP Required",
          description: "We've sent a verification code to your email.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Unable to process payment. Please try again.",
      });
    },
  });

  const onSubmit = async (data: BillPaymentForm) => {
    await billPaymentMutation.mutateAsync(data);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPayeeIcon = (payeeName: string) => {
    const payee = predefinedPayees.find(p => p.name === payeeName);
    return payee || { icon: CreditCard, color: "text-gray-600 bg-gray-100" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay Bills</h2>
          <p className="text-gray-600">Make secure bill payments to your registered payees.</p>
        </div>

        {/* Quick Pay Section */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Quick Pay</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="fromAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Account</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountName} - {formatCurrency(account.balance)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payeeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Payee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {predefinedPayees.map((payee) => (
                              <SelectItem key={payee.name} value={payee.name}>
                                {payee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={billPaymentMutation.isPending}
                    className="bg-eccu-blue hover:bg-eccu-blue-dark"
                  >
                    {billPaymentMutation.isPending ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Bill Payments */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Recent Bill Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {billPayments.length > 0 ? (
              <div className="space-y-4">
                {billPayments.map((payment) => {
                  const payeeData = getPayeeIcon(payment.payeeName);
                  const Icon = payeeData.icon;
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payeeData.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.payeeName}</p>
                          <p className="text-sm text-gray-500">
                            Paid on {formatDate(payment.processedDate || payment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{formatCurrency(payment.amount)}</p>
                        <p className={`text-xs ${
                          payment.status === "completed" ? "text-green-600" : 
                          payment.status === "pending" ? "text-orange-600" : "text-red-600"
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No bill payments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

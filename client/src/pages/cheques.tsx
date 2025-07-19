import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckSquare, Info } from "lucide-react";
import type { Account, ChequeOrder } from "@/lib/types";

const chequeOrderSchema = z.object({
  accountId: z.string().min(1, "Please select an account"),
  chequeStyle: z.string().min(1, "Please select a cheque style"),
  quantity: z.string().min(1, "Please select quantity"),
  startingNumber: z.string().regex(/^\d+$/, "Please enter a valid starting number"),
  deliveryAddress: z.string().min(1, "Please enter delivery address"),
  deliveryMethod: z.string().min(1, "Please select delivery method"),
});

type ChequeOrderForm = z.infer<typeof chequeOrderSchema>;

const chequeStyles = [
  { value: "standard", label: "Standard Blue", description: "Classic blue design" },
  { value: "security", label: "Security Plus", description: "Enhanced security features" },
  { value: "premium", label: "Premium Design", description: "Elegant professional style" },
];

const quantities = [
  { value: "50", label: "50 Cheques", price: 25.00 },
  { value: "100", label: "100 Cheques", price: 45.00 },
  { value: "200", label: "200 Cheques", price: 85.00 },
];

const deliveryMethods = [
  { value: "standard", label: "Standard Mail (5-7 days)", price: 0 },
  { value: "express", label: "Express Mail (2-3 days)", price: 15.00 },
  { value: "pickup", label: "Branch Pickup", price: 0 },
];

export default function Cheques() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    enabled: !!user,
  });

  const { data: chequeOrders = [] } = useQuery<ChequeOrder[]>({
    queryKey: ["/api/cheque-orders"],
    enabled: !!user,
  });

  const form = useForm<ChequeOrderForm>({
    resolver: zodResolver(chequeOrderSchema),
    defaultValues: {
      accountId: "",
      chequeStyle: "",
      quantity: "",
      startingNumber: "001",
      deliveryAddress: "",
      deliveryMethod: "",
    },
  });

  const chequeOrderMutation = useMutation({
    mutationFn: async (data: ChequeOrderForm) => {
      const response = await apiRequest("POST", "/api/cheque-orders", {
        accountId: parseInt(data.accountId),
        chequeStyle: data.chequeStyle,
        quantity: parseInt(data.quantity),
        startingNumber: parseInt(data.startingNumber),
        deliveryAddress: data.deliveryAddress,
        deliveryMethod: data.deliveryMethod,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresOTP) {
        setPendingOrderId(data.chequeOrderId);
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
        title: "Order Failed",
        description: error.message || "Unable to place cheque order. Please try again.",
      });
    },
  });

  const calculateTotalCost = () => {
    const quantityValue = form.watch("quantity");
    const deliveryMethod = form.watch("deliveryMethod");
    
    const quantityPrice = quantities.find(q => q.value === quantityValue)?.price || 0;
    const deliveryPrice = deliveryMethods.find(d => d.value === deliveryMethod)?.price || 0;
    
    return quantityPrice + deliveryPrice;
  };

  const onSubmit = async (data: ChequeOrderForm) => {
    await chequeOrderMutation.mutateAsync(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "shipped":
        return "text-blue-600";
      case "processing":
        return "text-orange-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  // Filter accounts to only show chequing accounts
  const chequingAccounts = accounts.filter(account => account.accountType === "chequing");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Cheques</h2>
          <p className="text-gray-600">Order personalized cheques for your accounts.</p>
        </div>

        {/* Order Form */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>New Cheque Order</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chequingAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountName} - ****{account.accountNumber.slice(-4)}
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
                    name="chequeStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cheque Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chequeStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
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
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Quantity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quantities.map((qty) => (
                              <SelectItem key={qty.value} value={qty.value}>
                                {qty.label} - {formatCurrency(qty.price)}
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
                    name="startingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Number</FormLabel>
                        <FormControl>
                          <Input placeholder="001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your delivery address"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deliveryMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}{method.price > 0 ? ` - ${formatCurrency(method.price)}` : " - Free"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
                      <div className="text-2xl font-bold text-eccu-blue">
                        {formatCurrency(calculateTotalCost())}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={chequeOrderMutation.isPending}
                    className="bg-eccu-blue hover:bg-eccu-blue-dark"
                  >
                    {chequeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {chequeOrders.length > 0 ? (
              <div className="space-y-4">
                {chequeOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-eccu-blue-light rounded-lg flex items-center justify-center">
                        <CheckSquare className="h-5 w-5 text-eccu-blue" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {order.quantity} {order.chequeStyle} Cheques
                        </p>
                        <p className="text-sm text-gray-500">
                          Ordered on {formatDate(order.orderDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(parseFloat(order.totalCost))}
                      </p>
                      <p className={`text-xs ${getStatusColor(order.status)} capitalize`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No cheque orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

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
import { University, Clock, Trash2, Info } from "lucide-react";
import type { ExternalAccount } from "@/lib/types";

const externalAccountSchema = z.object({
  institutionName: z.string().min(1, "Please enter institution name"),
  accountType: z.string().min(1, "Please select account type"),
  institutionNumber: z.string().length(3, "Institution number must be 3 digits").regex(/^\d+$/, "Only numbers allowed"),
  transitNumber: z.string().length(5, "Transit number must be 5 digits").regex(/^\d+$/, "Only numbers allowed"),
  accountNumber: z.string().min(1, "Please enter account number"),
});

type ExternalAccountForm = z.infer<typeof externalAccountSchema>;

const accountTypes = [
  { value: "chequing", label: "Chequing" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit Card" },
];

const commonInstitutions = [
  "TD Bank",
  "RBC Royal Bank",
  "BMO Bank of Montreal",
  "Scotiabank",
  "CIBC",
  "Desjardins",
  "Tangerine",
  "PC Financial",
];

export default function External() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: externalAccounts = [] } = useQuery<ExternalAccount[]>({
    queryKey: ["/api/external-accounts"],
    enabled: !!user,
  });

  const form = useForm<ExternalAccountForm>({
    resolver: zodResolver(externalAccountSchema),
    defaultValues: {
      institutionName: "",
      accountType: "",
      institutionNumber: "",
      transitNumber: "",
      accountNumber: "",
    },
  });

  const linkAccountMutation = useMutation({
    mutationFn: async (data: ExternalAccountForm) => {
      const response = await apiRequest("POST", "/api/external-accounts", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Linking Started",
        description: data.message,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/external-accounts"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Linking Failed",
        description: error.message || "Unable to link external account. Please try again.",
      });
    },
  });

  const onSubmit = async (data: ExternalAccountForm) => {
    await linkAccountMutation.mutateAsync(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-800 bg-green-100";
      case "pending":
        return "text-orange-800 bg-orange-100";
      case "failed":
        return "text-red-800 bg-red-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <University className="h-6 w-6 text-green-600" />;
      case "pending":
        return <Clock className="h-6 w-6 text-orange-600" />;
      case "failed":
        return <University className="h-6 w-6 text-red-600" />;
      default:
        return <University className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (accountNumber.length >= 4) {
      return `****${accountNumber.slice(-4)}`;
    }
    return accountNumber;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link External Accounts</h2>
          <p className="text-gray-600">Connect your accounts from other financial institutions.</p>
        </div>

        {/* Add New Account */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Link New Account</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Institution</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="e.g., TD Bank, RBC, BMO"
                              {...field}
                              list="institutions"
                            />
                            <datalist id="institutions">
                              {commonInstitutions.map((institution) => (
                                <option key={institution} value={institution} />
                              ))}
                            </datalist>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="institutionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 004"
                            maxLength={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transitNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transit Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12345"
                            maxLength={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your account number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Verification Process</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        We'll make two small deposits (under $1.00) to verify your account. 
                        This process usually takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={linkAccountMutation.isPending}
                    className="bg-eccu-blue hover:bg-eccu-blue-dark"
                  >
                    {linkAccountMutation.isPending ? "Starting Verification..." : "Start Verification"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Linked Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {externalAccounts.length > 0 ? (
              <div className="space-y-4">
                {externalAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(account.verificationStatus)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {account.institutionName} - {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatAccountNumber(account.accountNumber)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.verificationStatus === "verified" && account.linkedDate
                            ? `Linked on ${formatDate(account.linkedDate)}`
                            : `Started on ${formatDate(account.createdAt)}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(account.verificationStatus)}`}>
                        {account.verificationStatus === "verified" ? "Verified" : 
                         account.verificationStatus === "pending" ? "Pending Verification" : "Failed"}
                      </span>
                      {account.verificationStatus === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-eccu-blue hover:text-eccu-blue-dark"
                        >
                          Verify Deposits
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <University className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No external accounts linked</p>
                <p className="text-gray-400 text-sm mt-2">
                  Link your accounts from other banks to manage all your finances in one place.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const otpSchema = z.object({
  code: z.string().length(6, "Please enter a 6-digit code"),
});

type OTPForm = z.infer<typeof otpSchema>;

export default function OTP() {
  const { user, verifyOTP } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: OTPForm) => {
    try {
      setIsLoading(true);
      await verifyOTP(data.code);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid or expired code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // In a real implementation, this would call an API to resend the OTP
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eccu-blue-light to-white">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center mb-8">
              <img
                src="https://auth.eastcoastcu.ca/resources/themes/theme-eastcoast-md-refresh-mobile/assets/images/logo.png"
                alt="East Coast Credit Union Logo"
                className="h-16 mx-auto mb-4"
              />
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your Identity</h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to your email address
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="w-12 h-12 text-xl" />
                              <InputOTPSlot index={1} className="w-12 h-12 text-xl" />
                              <InputOTPSlot index={2} className="w-12 h-12 text-xl" />
                              <InputOTPSlot index={3} className="w-12 h-12 text-xl" />
                              <InputOTPSlot index={4} className="w-12 h-12 text-xl" />
                              <InputOTPSlot index={5} className="w-12 h-12 text-xl" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-eccu-blue hover:bg-eccu-blue-dark text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={handleResendOTP}
                className="text-sm text-eccu-blue hover:text-eccu-blue-dark"
              >
                Didn't receive the code? Resend
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

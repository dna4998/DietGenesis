import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Stethoscope, Lock, Mail } from "lucide-react";
import { useLocation } from "wouter";
import FreshLogo from "@/components/fresh-logo";

const providerLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type ProviderLoginForm = z.infer<typeof providerLoginSchema>;

export default function ProviderLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ProviderLoginForm>({
    resolver: zodResolver(providerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ProviderLoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login/provider", data);
      
      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back, provider!",
        });
        setLocation("/provider-dashboard");
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FreshLogo size="login" />
          </div>
          <CardTitle className="text-2xl font-bold text-health-primary flex items-center justify-center gap-2">
            <Stethoscope className="h-6 w-6" />
            Provider Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="provider@dnadietclub.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-health-primary hover:bg-health-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Patient login?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/login")}>
                Click here
              </Button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-sm text-blue-800 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Email:</strong> dr.emily@dnadietclub.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Heart, Stethoscope, UserCheck, Shield } from "lucide-react";
import FreshLogo from "@/components/fresh-logo";
import { AccessibleLoading, AccessibleError, StatusAnnouncer } from "@/components/accessibility-features";
import { announceToScreenReader, generateUniqueId } from "@/lib/accessibility";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.number().min(16, "Must be at least 16 years old").max(120, "Please enter a valid age"),
  weight: z.number().min(50, "Please enter a valid weight").max(500, "Please enter a valid weight"),
  weightGoal: z.number().min(50, "Please enter a valid weight goal").max(500, "Please enter a valid weight goal"),
  bodyFat: z.number().min(3, "Please enter a valid body fat percentage").max(50, "Please enter a valid body fat percentage"),
  bodyFatGoal: z.number().min(3, "Please enter a valid body fat goal").max(50, "Please enter a valid body fat goal"),
  bloodPressure: z.string().min(1, "Please enter your blood pressure"),
});

const registerProviderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialty: z.string().optional(),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patient-login");
  const [statusMessage, setStatusMessage] = useState("");
  const queryClient = useQueryClient();
  
  // Generate unique IDs for accessibility
  const formId = generateUniqueId('login-form');
  const titleId = generateUniqueId('login-title');
  const subtitleId = generateUniqueId('login-subtitle');

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerPatientForm = useForm({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      age: 30,
      weight: 160,
      weightGoal: 150,
      bodyFat: 20,
      bodyFatGoal: 15,
      bloodPressure: "120/80",
    },
  });

  const registerProviderForm = useForm({
    resolver: zodResolver(registerProviderSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialty: "",
    },
  });

  const loginPatientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/login/patient", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStatusMessage("Login successful. Redirecting to dashboard...");
      announceToScreenReader("Login successful. Redirecting to dashboard.");
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Invalid email or password";
      setStatusMessage(`Patient login failed: ${errorMessage}`);
      announceToScreenReader(`Patient login failed: ${errorMessage}`);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const loginProviderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/login/provider", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStatusMessage("Provider login successful. Redirecting to dashboard...");
      announceToScreenReader("Provider login successful. Redirecting to dashboard.");
      toast({
        title: "Welcome back, Doctor!",
        description: "Successfully logged in to your provider account.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Invalid email or password";
      setStatusMessage(`Provider login failed: ${errorMessage}`);
      announceToScreenReader(`Provider login failed: ${errorMessage}`);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerPatientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerPatientSchema>) => {
      const response = await apiRequest("POST", "/api/register/patient", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account Created!",
        description: "Welcome to DNA Diet Club! Your personalized health journey begins now.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const registerProviderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerProviderSchema>) => {
      const response = await apiRequest("POST", "/api/register/provider", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Provider Account Created!",
        description: "Welcome to DNA Diet Club! You can now manage patients and create treatment plans.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create provider account",
        variant: "destructive",
      });
    },
  });

  const isLoading = loginPatientMutation.isPending || loginProviderMutation.isPending || 
                   registerPatientMutation.isPending || registerProviderMutation.isPending;

  return (
    <main 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4"
      role="main"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div className="w-full max-w-4xl">
        {/* Status announcements for screen readers */}
        {statusMessage && (
          <StatusAnnouncer message={statusMessage} priority="assertive" />
        )}
        
        <header className="text-center mb-8" role="banner">
          <div className="flex items-center justify-center mb-4">
            <FreshLogo size="login" showTitle={false} />
          </div>
          <h1 
            id={titleId} 
            className="sr-only"
          >
            DNA Diet Club Login
          </h1>
          <p 
            id={subtitleId} 
            className="text-gray-600"
            aria-label="Platform description"
          >
            Personalized health and wellness platform
          </p>
        </header>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Access Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <AccessibleLoading isLoading={isLoading} message="Processing your request...">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
                aria-label="Login and registration options"
              >
                <TabsList 
                  className="grid w-full grid-cols-4"
                  role="tablist"
                  aria-label="User type and action selection"
                >
                  <TabsTrigger 
                    value="patient-login" 
                    className="flex items-center gap-1 focus:ring-accessible"
                    role="tab"
                    aria-controls="patient-login-panel"
                    aria-selected={activeTab === "patient-login"}
                    aria-label="Patient login form"
                  >
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Patient Login</span>
                    <span className="sm:hidden">Login</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="patient-register" 
                    className="flex items-center gap-1 focus:ring-accessible"
                    role="tab"
                    aria-controls="patient-register-panel"
                    aria-selected={activeTab === "patient-register"}
                    aria-label="Patient registration form"
                  >
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Patient Register</span>
                    <span className="sm:hidden">Register</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="provider-login" 
                    className="flex items-center gap-1 focus:ring-accessible"
                    role="tab"
                    aria-controls="provider-login-panel"
                    aria-selected={activeTab === "provider-login"}
                    aria-label="Healthcare provider login form"
                  >
                    <Stethoscope className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Provider Login</span>
                    <span className="sm:hidden">Dr Login</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="provider-register" 
                    className="flex items-center gap-1 focus:ring-accessible"
                    role="tab"
                    aria-controls="provider-register-panel"
                    aria-selected={activeTab === "provider-register"}
                    aria-label="Healthcare provider registration form"
                  >
                    <Shield className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Provider Register</span>
                    <span className="sm:hidden">Dr Register</span>
                  </TabsTrigger>
                </TabsList>

              <TabsContent 
                value="patient-login" 
                className="space-y-4"
                role="tabpanel"
                id="patient-login-panel"
                aria-labelledby="patient-login-title"
              >
                <div className="text-center space-y-2">
                  <h3 id="patient-login-title" className="text-lg font-semibold">Patient Login</h3>
                  <p className="text-sm text-gray-600">Access your personalized health dashboard</p>
                  <Badge variant="secondary">Free Basic Access + Subscription for AI Features</Badge>
                </div>
                <Form {...loginForm}>
                  <form 
                    onSubmit={loginForm.handleSubmit((data) => {
                      setStatusMessage("Logging in...");
                      announceToScreenReader("Logging in as patient...");
                      loginPatientMutation.mutate(data);
                    })} 
                    className="space-y-4"
                    role="form"
                    aria-label="Patient login form"
                    noValidate
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`${formId}-patient-email`}>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              id={`${formId}-patient-email`}
                              placeholder="your@email.com" 
                              type="email"
                              autoComplete="email"
                              required
                              aria-describedby={loginForm.formState.errors.email ? `${formId}-patient-email-error` : undefined}
                              className="focus:ring-accessible"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage 
                            id={`${formId}-patient-email-error`}
                            role="alert"
                            aria-live="polite"
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`${formId}-patient-password`}>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginPatientMutation.isPending}>
                      {loginPatientMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm text-gray-600">
                  Demo Account: john.doe@email.com / password123
                </div>
              </TabsContent>

              <TabsContent value="patient-register" className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Create Patient Account</h3>
                  <p className="text-sm text-gray-600">Start your personalized health journey</p>
                  <Badge variant="secondary">Free Basic Access + Subscription for AI Features</Badge>
                </div>
                <Form {...registerPatientForm}>
                  <form onSubmit={registerPatientForm.handleSubmit((data) => registerPatientMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerPatientForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Weight (lbs)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="weightGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Weight (lbs)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="bodyFat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Body Fat (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="bodyFatGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Body Fat (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPatientForm.control}
                        name="bloodPressure"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Blood Pressure</FormLabel>
                            <FormControl>
                              <Input placeholder="120/80" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={registerPatientMutation.isPending}>
                      {registerPatientMutation.isPending ? "Creating Account..." : "Create Patient Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="provider-login" className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Provider Login</h3>
                  <p className="text-sm text-gray-600">Access your healthcare provider dashboard</p>
                  <Badge variant="outline">Full Access to All Features</Badge>
                </div>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginProviderMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="doctor@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginProviderMutation.isPending}>
                      {loginProviderMutation.isPending ? "Signing In..." : "Sign In as Provider"}
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm text-gray-600">
                  Demo Account: dr.emily@dnadietclub.com / password123
                </div>
              </TabsContent>

              <TabsContent value="provider-register" className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Create Provider Account</h3>
                  <p className="text-sm text-gray-600">Join as a healthcare provider</p>
                  <Badge variant="outline">Full Access to All Features</Badge>
                </div>
                <Form {...registerProviderForm}>
                  <form onSubmit={registerProviderForm.handleSubmit((data) => registerProviderMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={registerProviderForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jane Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerProviderForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Email</FormLabel>
                          <FormControl>
                            <Input placeholder="doctor@clinic.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerProviderForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerProviderForm.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Specialty (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Functional Medicine, Endocrinology, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerProviderMutation.isPending}>
                      {registerProviderMutation.isPending ? "Creating Account..." : "Create Provider Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            </AccessibleLoading>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 DNA Diet Club. Personalized health management platform.</p>
        </div>
      </div>
    </main>
  );
}
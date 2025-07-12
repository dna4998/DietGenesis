import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Shield, 
  Check,
  X,
  Clock,
  Zap
} from "lucide-react";
import { SiPaypal, SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  selectedPlan: 'monthly' | 'yearly' | null;
}

export default function SubscriptionPaymentModal({ 
  isOpen, 
  onClose, 
  patientId, 
  selectedPlan 
}: SubscriptionPaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'stripe' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const planDetails = {
    monthly: { price: 4.99, period: 'month', savings: null },
    yearly: { price: 50, period: 'year', savings: '17%' }
  };

  const currentPlan = selectedPlan ? planDetails[selectedPlan] : null;

  // PayPal subscription mutation
  const paypalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patientId}/subscription`, {
        plan: selectedPlan
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        // Demo mode - simulate success
        window.location.href = `/patient-dashboard?subscription=success`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process PayPal payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Stripe subscription mutation
  const stripeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/patients/${patientId}/subscription/stripe`, {
        plan: selectedPlan
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Demo mode - simulate success
        window.location.href = `/patient-dashboard?subscription=success`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed", 
        description: error.message || "Failed to process Stripe payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePaymentMethodSelect = (method: 'paypal' | 'stripe') => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod || !selectedPlan) return;

    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === 'paypal') {
        await paypalMutation.mutateAsync();
      } else if (selectedPaymentMethod === 'stripe') {
        await stripeMutation.mutateAsync();
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (!selectedPlan || !currentPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            Complete Your Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="capitalize">{selectedPlan} Plan</span>
                {currentPlan.savings && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Save {currentPlan.savings}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${currentPlan.price}</span>
                <span className="text-muted-foreground">/{currentPlan.period}</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>AI-powered health insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Personalized meal & exercise plans</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Dexcom CGM integration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>24/7 health monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Choose Payment Method</h3>
            
            {/* PayPal Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedPaymentMethod === 'paypal' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaymentMethodSelect('paypal')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SiPaypal className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-muted-foreground">
                        Pay with your PayPal account
                      </div>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'paypal' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stripe/Credit Card Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedPaymentMethod === 'stripe' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaymentMethodSelect('stripe')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-gray-600" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-muted-foreground">
                        Secure payment with Stripe
                      </div>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'stripe' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <SiVisa className="w-8 h-5 text-blue-600" />
                  <SiMastercard className="w-8 h-5 text-red-600" />
                  <SiAmericanexpress className="w-8 h-5 text-blue-600" />
                  <span className="text-xs text-muted-foreground ml-2">& more</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              Your payment information is encrypted and secure. We never store your card details.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProceedToPayment}
              disabled={!selectedPaymentMethod || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
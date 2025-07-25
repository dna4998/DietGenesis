import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Clock, CheckCircle, XCircle, Crown } from "lucide-react";
import SubscriptionPaymentModal from "./subscription-payment-modal";
import type { Patient } from "@shared/schema";

interface SubscriptionStatus {
  subscriptionStatus: string;
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isActive: boolean;
}

interface SubscriptionCardProps {
  patient: Patient;
}

export default function SubscriptionCard({ patient }: SubscriptionCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);

  const { data: subscriptionStatus, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/patients', patient.id, 'subscription', 'status'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/patients/${patient.id}/subscription/status`);
      return response.json();
    },
  });

  const handleSubscribeClick = (plan: 'monthly' | 'yearly') => {
    console.log('Subscribe button clicked:', plan);
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
    console.log('Modal should be open now');
  };



  const getStatusIcon = () => {
    if (!subscriptionStatus) return <Clock className="h-4 w-4" />;
    
    switch (subscriptionStatus.subscriptionStatus) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!subscriptionStatus) return null;
    
    if (subscriptionStatus.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    } else if (subscriptionStatus.subscriptionStatus === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Manage your health platform subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionStatus?.isActive === true ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge()}
            </div>
            
            {subscriptionStatus.subscriptionPlan && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan:</span>
                <span className="text-sm capitalize">
                  {subscriptionStatus.subscriptionPlan} 
                  {subscriptionStatus.subscriptionPlan === 'monthly' ? ' - $4.99/month' : ' - $50/year'}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Started:</span>
              <span className="text-sm">{formatDate(subscriptionStatus.subscriptionStartDate)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next billing:</span>
              <span className="text-sm">{formatDate(subscriptionStatus.subscriptionEndDate)}</span>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-green-600 font-medium">
                ✓ Full access to all health platform features
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="font-medium text-lg mb-2">Choose Your Plan</h3>
              <p className="text-xs text-gray-500">Debug: isActive = {subscriptionStatus?.isActive ? 'true' : 'false'}, status = {subscriptionStatus?.subscriptionStatus}</p>
              <p className="text-sm text-gray-600 mb-4">
                Subscribe to access personalized diet plans, AI insights, and provider consultations
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Monthly Plan</h4>
                  <span className="text-lg font-bold">$4.99/month</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personalized diet & exercise plans</li>
                  <li>• AI-powered nutrition insights</li>
                  <li>• Provider messaging & consultations</li>
                  <li>• Progress tracking & analytics</li>
                </ul>
                <Button 
                  onClick={(e) => {
                    console.log('Monthly button clicked', e);
                    handleSubscribeClick('monthly');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  variant="default"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Monthly
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Yearly Plan</h4>
                    <Badge variant="secondary" className="text-xs">Save 17%</Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">$50/year</span>
                    <div className="text-xs text-gray-500">$4.17/month</div>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Everything in Monthly Plan</li>
                  <li>• Priority provider support</li>
                  <li>• Advanced health analytics</li>
                  <li>• Early access to new features</li>
                </ul>
                <Button 
                  onClick={(e) => {
                    console.log('Yearly button clicked', e);
                    handleSubscribeClick('yearly');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  variant="default"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Yearly
                </Button>
              </div>
            </div>

            {subscriptionStatus?.subscriptionStatus === 'cancelled' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your subscription was cancelled. Resubscribe to regain access to all features.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Debug: Show modal state */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Payment Options</h2>
            <p className="mb-4">Selected Plan: {selectedPlan}</p>
            <div className="space-y-3">
              <button 
                className="w-full p-3 border rounded-lg hover:bg-gray-50"
                onClick={() => {
                  console.log('PayPal selected');
                  window.location.href = `/patient-dashboard?subscription=success`;
                }}
              >
                💳 PayPal Payment
              </button>
              <button 
                className="w-full p-3 border rounded-lg hover:bg-gray-50"
                onClick={() => {
                  console.log('Stripe selected');
                  window.location.href = `/patient-dashboard?subscription=success`;
                }}
              >
                🏦 Credit/Debit Card (Stripe)
              </button>
            </div>
            <button 
              className="mt-4 w-full p-2 bg-gray-200 rounded"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <SubscriptionPaymentModal
        isOpen={false}
        onClose={() => setIsPaymentModalOpen(false)}
        patientId={patient.id}
        selectedPlan={selectedPlan}
      />
    </Card>
  );
}
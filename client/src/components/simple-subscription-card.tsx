import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Patient } from "@shared/schema";

interface SimpleSubscriptionCardProps {
  patient: Patient;
}

export default function SimpleSubscriptionCard({ patient }: SimpleSubscriptionCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/patients', patient.id, 'subscription/status'],
  });

  const handleSubscribe = (plan: 'monthly' | 'yearly') => {
    console.log('Button clicked:', plan);
    setSelectedPlan(plan);
    setShowModal(true);
    console.log('Modal should be visible now');
  };

  const handlePayment = (method: 'paypal' | 'stripe') => {
    console.log('Payment method selected:', method);
    // Simulate successful payment
    window.location.href = `/patient-dashboard?subscription=success`;
  };

  if (subscriptionStatus?.isActive) {
    return (
      <div className="p-6 border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-800">Active Subscription</h3>
        <p className="text-green-600">Your {subscriptionStatus.subscriptionPlan} plan is active</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
      <p className="text-sm text-gray-600 mb-4">
        Debug: Status = {subscriptionStatus?.subscriptionStatus}, Active = {subscriptionStatus?.isActive ? 'true' : 'false'}
      </p>
      
      <div className="space-y-4">
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Monthly Plan</h4>
            <span className="font-bold">$4.99/month</span>
          </div>
          <button
            onClick={() => handleSubscribe('monthly')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Subscribe Monthly
          </button>
        </div>

        <div className="border rounded p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Yearly Plan</h4>
            <span className="font-bold">$50/year</span>
          </div>
          <span className="text-xs text-blue-600 font-medium">Save 17%</span>
          <button
            onClick={() => handleSubscribe('yearly')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors mt-2"
          >
            Subscribe Yearly
          </button>
        </div>
      </div>

      {/* Professional Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedPlan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}</strong>
              </p>
              <p className="text-lg font-bold text-blue-900">
                ${selectedPlan === 'monthly' ? '4.99/month' : '50/year'}
                {selectedPlan === 'yearly' && <span className="text-sm text-green-600 ml-2">(Save 17%)</span>}
              </p>
            </div>
            
            <div className="space-y-3">
              {/* PayPal Option */}
              <button
                onClick={() => handlePayment('paypal')}
                className="w-full p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">PP</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-xs text-gray-500">Pay with your PayPal account</p>
                    </div>
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-700">→</div>
                </div>
              </button>
              
              {/* Stripe Credit Card Option */}
              <button
                onClick={() => handlePayment('stripe')}
                className="w-full p-4 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm">💳</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Credit or Debit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <div className="text-purple-600 group-hover:text-purple-700">→</div>
                </div>
              </button>
            </div>
            
            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <span className="mr-1">🔒</span>
              <span>Secured by 256-bit SSL encryption</span>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
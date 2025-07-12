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

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
            <p className="mb-4">Selected Plan: {selectedPlan} (${selectedPlan === 'monthly' ? '4.99/month' : '50/year'})</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('paypal')}
                className="w-full p-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
              >
                <span className="mr-2">💳</span>
                PayPal Payment
              </button>
              
              <button
                onClick={() => handlePayment('stripe')}
                className="w-full p-3 border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center justify-center"
              >
                <span className="mr-2">🏦</span>
                Credit/Debit Card (Stripe)
              </button>
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
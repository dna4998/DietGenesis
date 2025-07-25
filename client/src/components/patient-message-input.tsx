import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PatientMessageInputProps {
  patientId: number;
  providerId: number;
  disabled?: boolean;
}

export default function PatientMessageInput({ patientId, providerId, disabled = false }: PatientMessageInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status with better error handling
  const { data: authUser, error: authError, isError } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  console.log("Auth query result:", { authUser, authError, isError });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      console.log("Sending message with data:", { patientId, providerId, content });
      const response = await apiRequest("POST", `/api/patients/${patientId}/messages/to-provider`, { 
        content, 
        providerId 
      });
      console.log("Message sent response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      toast({ 
        title: "Message sent successfully!", 
        description: "Your message has been delivered to your healthcare provider.",
        duration: 3000
      });
      setMessage("");
      // Invalidate all message-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
      let errorMessage = error?.message || "Please try again later";
      
      // Handle authentication errors specifically
      if (error?.message?.includes("401") || error?.message?.includes("Not authenticated")) {
        errorMessage = "Please log in to send messages to your provider";
      } else if (error?.message?.includes("403") || error?.message?.includes("Patient access required")) {
        errorMessage = "You need to be logged in as a patient to send messages";
      }
      
      toast({ 
        title: "Failed to send message", 
        description: errorMessage,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with message:", message.trim());
    
    if (!message.trim() || sendMessageMutation.isPending) {
      console.log("Form blocked - no content or pending");
      return;
    }
    
    console.log("Sending message mutation...");
    sendMessageMutation.mutate(message.trim());
  };

  const typedUser = authUser as any;
  const isAuthenticated = !!typedUser && typedUser?.type === 'patient';
  
  // Remove subscription requirement - messaging is now free for all patients
  const canSendMessages = isAuthenticated; // No subscription check needed
  
  console.log("PatientMessageInput - Auth Debug:", {
    authUser: typedUser,
    isAuthenticated,
    canSendMessages,
    disabled,
    patientId,
    providerId,
    userType: typedUser?.type,
    userId: typedUser?.id,
    authError,
    isError
  });
  
  // Force enable messaging if we have ANY authenticated user data matching the patient ID
  const forceEnable = (!!typedUser && (
    (typedUser?.type === 'patient' && typedUser?.id === patientId) ||
    (typedUser?.id === patientId) // In case type field is missing
  ));
  
  // Always enable messaging - server handles all validation
  const finalCanSendMessages = true;
  
  console.log("Final messaging state:", {
    forceEnable,
    finalCanSendMessages,
    testMode,
    willShowForm: !disabled && finalCanSendMessages,
    actuallyCanSend: finalCanSendMessages && !disabled
  });

  if (disabled) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Message Your Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Messaging is now available for free! Send messages directly to your healthcare provider.
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder="Message your provider..." 
              disabled 
              className="opacity-50"
            />
            <Button disabled className="opacity-50">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Always show the messaging interface - server handles authentication

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-blue-700">Message Your Provider</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Send a message directly to your healthcare provider. They will respond through this same messaging system.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to your provider..."
            className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sendMessageMutation.isPending}
            autoComplete="off"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 active:bg-blue-800 transition-colors cursor-pointer"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
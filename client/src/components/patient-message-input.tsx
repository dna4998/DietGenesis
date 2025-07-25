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

  // Check authentication status
  const { data: authUser } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/patients/${patientId}/messages/to-provider`, { 
        content, 
        providerId 
      });
    },
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      toast({ 
        title: "Message sent successfully!", 
        description: "Your provider will receive your message and respond through this same system.",
        duration: 3000
      });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'messages'] });
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
    if (!message.trim() || sendMessageMutation.isPending || !canSendMessages) return;
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
    providerId
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

  if (!canSendMessages) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Message Your Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              {!typedUser ? "Please log in to send messages to your healthcare provider." : 
               "Authentication error. Please refresh the page and try again."}
            </p>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Login required to send messages..." 
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
            disabled={!message.trim() || sendMessageMutation.isPending || !canSendMessages}
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/patients/${patientId}/messages/to-provider`, { 
        content, 
        providerId 
      });
    },
    onSuccess: () => {
      toast({ title: "Message sent to your provider!" });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'messages'] });
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
      toast({ 
        title: "Failed to send message", 
        description: error?.message || "Please try again later",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  if (disabled) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-gray-600">Message Your Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Messaging is available with an active subscription. Please subscribe for full access to communicate with your healthcare provider.
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
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  FileText, 
  Video, 
  ExternalLink,
  Download,
  Clock,
  FlaskConical,
  Activity
} from "lucide-react";
import type { Patient, Message } from "@shared/schema";
import { format } from "date-fns";

interface MessagingCardProps {
  patient: Patient;
}

export default function MessagingCard({ patient }: MessagingCardProps) {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/patients', patient.id, 'messages'],
  });

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'lab_results':
        return <FlaskConical className="h-4 w-4 text-blue-600" />;
      case 'gut_biome_test':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'video_link':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'pdf_link':
        return <ExternalLink className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleFileClick = (message: Message) => {
    if (message.fileUrl) {
      if (message.messageType === 'pdf') {
        // For uploaded PDFs, open in new tab
        window.open(message.fileUrl, '_blank');
      } else {
        // For external links, open directly
        window.open(message.fileUrl, '_blank');
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages from Your Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages from Your Provider
          {messages.filter((m: Message) => !m.isRead).length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {messages.filter((m: Message) => !m.isRead).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Your provider will send you updates and resources here.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message: Message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg border ${
                  message.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(message.messageType)}
                    <span className="text-sm font-medium">
                      {message.messageType === 'pdf' && 'PDF Document'}
                      {message.messageType === 'lab_results' && 'Lab Results'}
                      {message.messageType === 'gut_biome_test' && 'Gut Biome Test'}
                      {message.messageType === 'video_link' && 'Video Resource'}
                      {message.messageType === 'pdf_link' && 'PDF Link'}
                      {message.messageType === 'text' && 'Message'}
                    </span>
                    {!message.isRead && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {format(new Date(message.createdAt!), 'MMM d, h:mm a')}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{message.content}</p>
                
                {message.fileUrl && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileClick(message)}
                      className="flex items-center gap-2"
                    >
                      {(message.messageType === 'pdf' || message.messageType === 'lab_results' || message.messageType === 'gut_biome_test') ? (
                        <>
                          <Download className="h-4 w-4" />
                          View PDF
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Open Link
                        </>
                      )}
                    </Button>
                    
                    {message.fileName && (
                      <span className="text-xs text-gray-500">
                        {message.fileName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
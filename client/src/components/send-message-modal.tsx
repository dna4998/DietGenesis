import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  FileText, 
  Video, 
  ExternalLink,
  Upload,
  Send,
  FlaskConical,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient } from "@shared/schema";

interface SendMessageModalProps {
  patient: Patient;
  providerId: number;
  trigger?: React.ReactNode;
}

const textMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

const linkMessageSchema = z.object({
  content: z.string().optional(),
  link: z.string().url("Please enter a valid URL"),
  linkType: z.enum(["video_link", "pdf_link"]),
});

const pdfMessageSchema = z.object({
  content: z.string().optional(),
  file: z.any().refine((file) => file instanceof File, "Please select a PDF file")
    .refine((file) => file?.type === "application/pdf", "Only PDF files are allowed")
    .refine((file) => file?.size <= 5 * 1024 * 1024, "File size must be less than 5MB"),
});

type PdfMessageForm = {
  content?: string;
  file: File;
};

export default function SendMessageModal({ patient, providerId, trigger }: SendMessageModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const textForm = useForm({
    resolver: zodResolver(textMessageSchema),
    defaultValues: { content: "" },
  });

  const linkForm = useForm({
    resolver: zodResolver(linkMessageSchema),
    defaultValues: { content: "", link: "", linkType: "video_link" as const },
  });

  const pdfForm = useForm<PdfMessageForm>({
    resolver: zodResolver(pdfMessageSchema),
    defaultValues: { content: "", file: undefined as any },
  });

  const labResultsForm = useForm<PdfMessageForm>({
    resolver: zodResolver(pdfMessageSchema),
    defaultValues: { content: "", file: undefined as any },
  });

  const gutBiomeForm = useForm<PdfMessageForm>({
    resolver: zodResolver(pdfMessageSchema),
    defaultValues: { content: "", file: undefined as any },
  });

  const sendTextMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return apiRequest("POST", `/api/patients/${patient.id}/messages/text`, { ...data, providerId });
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      textForm.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const sendLinkMutation = useMutation({
    mutationFn: async (data: { content?: string; link: string; linkType: string }) => {
      return apiRequest("POST", `/api/patients/${patient.id}/messages/link`, { ...data, providerId });
    },
    onSuccess: () => {
      toast({ title: "Link sent successfully" });
      linkForm.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to send link", variant: "destructive" });
    },
  });

  const sendPdfMutation = useMutation({
    mutationFn: async (data: PdfMessageForm) => {
      const formData = new FormData();
      formData.append("pdf", data.file);
      formData.append("providerId", providerId.toString());
      if (data.content) {
        formData.append("content", data.content);
      }

      const response = await fetch(`/api/patients/${patient.id}/messages/pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "PDF uploaded successfully" });
      pdfForm.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to upload PDF", variant: "destructive" });
    },
  });

  const sendLabResultsMutation = useMutation({
    mutationFn: async (data: PdfMessageForm) => {
      const formData = new FormData();
      formData.append("pdf", data.file);
      formData.append("providerId", providerId.toString());
      if (data.content) {
        formData.append("content", data.content);
      }

      const response = await fetch(`/api/patients/${patient.id}/messages/lab-results`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload lab results");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Lab results uploaded successfully" });
      labResultsForm.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to upload lab results", variant: "destructive" });
    },
  });

  const sendGutBiomeMutation = useMutation({
    mutationFn: async (data: PdfMessageForm) => {
      const formData = new FormData();
      formData.append("pdf", data.file);
      formData.append("providerId", providerId.toString());
      if (data.content) {
        formData.append("content", data.content);
      }

      const response = await fetch(`/api/patients/${patient.id}/messages/gut-biome`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload gut biome test");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Gut biome test uploaded successfully" });
      gutBiomeForm.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to upload gut biome test", variant: "destructive" });
    },
  });

  const onTextSubmit = (data: { content: string }) => {
    sendTextMutation.mutate(data);
  };

  const onLinkSubmit = (data: { content?: string; link: string; linkType: string }) => {
    sendLinkMutation.mutate(data);
  };

  const onPdfSubmit = (data: { content?: string; file: File }) => {
    sendPdfMutation.mutate(data);
  };

  const onLabResultsSubmit = (data: { content?: string; file: File }) => {
    sendLabResultsMutation.mutate(data);
  };

  const onGutBiomeSubmit = (data: { content?: string; file: File }) => {
    sendGutBiomeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Message
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send Message to {patient.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="text" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="lab-results" className="flex items-center gap-1">
              <FlaskConical className="h-4 w-4" />
              Labs
            </TabsTrigger>
            <TabsTrigger value="gut-biome" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Gut
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <Form {...textForm}>
              <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-4">
                <FormField
                  control={textForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your message here..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendTextMutation.isPending}
                >
                  {sendTextMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="link">
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
                <FormField
                  control={linkForm.control}
                  name="linkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Type</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={field.value === "video_link" ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange("video_link")}
                            className="flex items-center gap-1"
                          >
                            <Video className="h-4 w-4" />
                            Video
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "pdf_link" ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange("pdf_link")}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={linkForm.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={linkForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a description..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendLinkMutation.isPending}
                >
                  {sendLinkMutation.isPending ? "Sending..." : "Send Link"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="pdf">
            <Form {...pdfForm}>
              <form onSubmit={pdfForm.handleSubmit(onPdfSubmit)} className="space-y-4">
                <FormField
                  control={pdfForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF File</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                            className="hidden"
                            id="pdf-upload"
                          />
                          <label htmlFor="pdf-upload" className="cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Click to select PDF file
                            </p>
                            <p className="text-xs text-gray-400">
                              Max size: 5MB
                            </p>
                          </label>
                          {field.value && (
                            <Badge variant="secondary" className="mt-2">
                              {field.value.name}
                            </Badge>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pdfForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a description for this PDF..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendPdfMutation.isPending}
                >
                  {sendPdfMutation.isPending ? "Uploading..." : "Upload PDF"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="lab-results">
            <Form {...labResultsForm}>
              <form onSubmit={labResultsForm.handleSubmit(onLabResultsSubmit)} className="space-y-4">
                <FormField
                  control={labResultsForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Results PDF</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                            className="hidden"
                            id="lab-results-upload"
                          />
                          <label htmlFor="lab-results-upload" className="cursor-pointer">
                            <FlaskConical className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <p className="text-sm text-blue-700 font-medium">
                              Upload Lab Results
                            </p>
                            <p className="text-xs text-blue-600">
                              Blood work, metabolic panels, lipid profiles, etc.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max size: 5MB
                            </p>
                          </label>
                          {field.value && (
                            <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                              {field.value.name}
                            </Badge>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={labResultsForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about these lab results..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={sendLabResultsMutation.isPending}
                >
                  {sendLabResultsMutation.isPending ? "Uploading..." : "Upload Lab Results"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="gut-biome">
            <Form {...gutBiomeForm}>
              <form onSubmit={gutBiomeForm.handleSubmit(onGutBiomeSubmit)} className="space-y-4">
                <FormField
                  control={gutBiomeForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gut Biome Test PDF</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center bg-green-50">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                            className="hidden"
                            id="gut-biome-upload"
                          />
                          <label htmlFor="gut-biome-upload" className="cursor-pointer">
                            <Activity className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <p className="text-sm text-green-700 font-medium">
                              Upload Gut Biome Test
                            </p>
                            <p className="text-xs text-green-600">
                              Microbiome analysis, SIBO tests, food sensitivity
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max size: 5MB
                            </p>
                          </label>
                          {field.value && (
                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                              {field.value.name}
                            </Badge>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={gutBiomeForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analysis Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about these gut biome test results..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={sendGutBiomeMutation.isPending}
                >
                  {sendGutBiomeMutation.isPending ? "Uploading..." : "Upload Gut Biome Test"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
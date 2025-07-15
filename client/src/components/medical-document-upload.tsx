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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload,
  FlaskConical,
  Activity,
  FileText,
  Heart,
  Brain,
  Dna,
  Microscope
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@shared/schema";

interface MedicalDocumentUploadProps {
  patient: Patient;
  providerId: number;
  trigger?: React.ReactNode;
}

const documentTypes = [
  { value: "lab_results", label: "Lab Results", icon: <FlaskConical className="h-4 w-4" />, color: "bg-blue-50 border-blue-300" },
  { value: "gut_biome_test", label: "Gut Biome Test", icon: <Activity className="h-4 w-4" />, color: "bg-green-50 border-green-300" },
  { value: "genetic_test", label: "Genetic Test", icon: <Dna className="h-4 w-4" />, color: "bg-purple-50 border-purple-300" },
  { value: "imaging_results", label: "Imaging Results", icon: <Microscope className="h-4 w-4" />, color: "bg-orange-50 border-orange-300" },
  { value: "cardiology_report", label: "Cardiology Report", icon: <Heart className="h-4 w-4" />, color: "bg-red-50 border-red-300" },
  { value: "general_report", label: "General Medical Report", icon: <FileText className="h-4 w-4" />, color: "bg-gray-50 border-gray-300" },
];

const uploadSchema = z.object({
  content: z.string().optional(),
  file: z.any().refine((file) => file instanceof File, "Please select a PDF file")
    .refine((file) => file?.type === "application/pdf", "Only PDF files are allowed")
    .refine((file) => file?.size <= 5 * 1024 * 1024, "File size must be less than 5MB"),
  documentType: z.string().min(1, "Please select a document type"),
});

export default function MedicalDocumentUpload({ patient, providerId, trigger }: MedicalDocumentUploadProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: { content: "", file: null, documentType: "" },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { content?: string; file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append("pdf", data.file);
      formData.append("providerId", providerId.toString());
      formData.append("documentType", data.documentType);
      if (data.content) {
        formData.append("content", data.content);
      }

      // Use the appropriate endpoint based on document type
      let endpoint = `/api/patients/${patient.id}/messages/medical-document`;
      if (data.documentType === "lab_results") {
        endpoint = `/api/patients/${patient.id}/messages/lab-results`;
      } else if (data.documentType === "gut_biome_test") {
        endpoint = `/api/patients/${patient.id}/messages/gut-biome`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return response.json();
    },
    onSuccess: () => {
      const docType = documentTypes.find(d => d.value === form.getValues().documentType)?.label || "Document";
      toast({ title: `${docType} uploaded successfully` });
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patient.id, 'messages'] });
    },
    onError: () => {
      toast({ title: "Failed to upload document", variant: "destructive" });
    },
  });

  const onSubmit = (data: { content?: string; file: File; documentType: string }) => {
    uploadMutation.mutate(data);
  };

  const selectedDocType = documentTypes.find(d => d.value === form.watch("documentType"));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Medical Document
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Medical Document</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${selectedDocType?.color || 'bg-gray-50 border-gray-300'}`}>
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
                        id="document-upload"
                      />
                      <label htmlFor="document-upload" className="cursor-pointer">
                        {selectedDocType?.icon || <FileText className="h-8 w-8 mx-auto mb-2" />}
                        <p className="text-sm font-medium mb-1">
                          {selectedDocType ? `Upload ${selectedDocType.label}` : "Upload Medical Document"}
                        </p>
                        <p className="text-xs text-gray-600">
                          PDF files only, max 5MB
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
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this document..."
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
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
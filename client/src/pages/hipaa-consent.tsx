import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Shield, FileCheck, Lock, Eye, UserCheck } from "lucide-react";
import FreshLogo from "@/components/fresh-logo";

const hipaaConsentSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  consentToUse: z.boolean().refine(val => val === true, "You must consent to use and disclosure"),
  consentToDisclosure: z.boolean().refine(val => val === true, "You must consent to disclosure"),
  consentToTreatment: z.boolean().refine(val => val === true, "You must consent to treatment"),
  consentToElectronicRecords: z.boolean().refine(val => val === true, "You must consent to electronic records"),
  consentToSecureMessaging: z.boolean().refine(val => val === true, "You must consent to secure messaging"),
  rightsAcknowledgment: z.boolean().refine(val => val === true, "You must acknowledge your rights"),
  privacyPolicyRead: z.boolean().refine(val => val === true, "You must read and accept the privacy policy"),
  signature: z.string().min(2, "Electronic signature is required"),
  signatureDate: z.string().min(1, "Signature date is required"),
  witnessName: z.string().optional(),
  additionalComments: z.string().optional(),
});

interface HipaaConsentProps {
  patientId: number;
  onComplete: () => void;
}

export default function HipaaConsent({ patientId, onComplete }: HipaaConsentProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [signatureValue, setSignatureValue] = useState("");

  const form = useForm({
    resolver: zodResolver(hipaaConsentSchema),
    mode: "onChange",
    defaultValues: {
      patientName: "",
      dateOfBirth: "",
      consentToUse: false,
      consentToDisclosure: false,
      consentToTreatment: false,
      consentToElectronicRecords: false,
      consentToSecureMessaging: false,
      rightsAcknowledgment: false,
      privacyPolicyRead: false,
      signature: "",
      signatureDate: new Date().toISOString().split('T')[0],
      witnessName: "",
      additionalComments: "",
    },
  });

  // Debug form state
  const watchedSignature = form.watch("signature");
  console.log("Current signature value:", watchedSignature);
  
  useEffect(() => {
    console.log("HIPAA form mounted, current section:", currentSection);
  }, [currentSection]);

  const submitConsentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof hipaaConsentSchema>) => {
      const response = await apiRequest("POST", `/api/patients/${patientId}/hipaa-consent`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "HIPAA Consent Submitted",
        description: "Your HIPAA consent form has been successfully submitted and recorded.",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit HIPAA consent form",
        variant: "destructive",
      });
    },
  });

  const sections = [
    {
      title: "Patient Information",
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full legal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Privacy Rights & Disclosures",
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Your Health Information Rights</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Right to request restrictions on use and disclosure</li>
              <li>• Right to receive confidential communications</li>
              <li>• Right to inspect and copy your health information</li>
              <li>• Right to request amendments to your health information</li>
              <li>• Right to receive an accounting of disclosures</li>
              <li>• Right to obtain a paper copy of this notice</li>
            </ul>
          </div>
          <FormField
            control={form.control}
            name="rightsAcknowledgment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I acknowledge that I have been provided with a copy of the Notice of Privacy Practices and understand my rights regarding my health information.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Consent for Treatment & Services",
      icon: <FileCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Treatment & Services</h3>
            <p className="text-sm text-green-800">
              DNA Diet Club provides personalized health and wellness services including AI-powered nutrition analysis, 
              meal planning, exercise recommendations, and health monitoring through secure digital platforms.
            </p>
          </div>
          <FormField
            control={form.control}
            name="consentToTreatment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I consent to treatment and services provided by DNA Diet Club and its healthcare providers.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consentToUse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I consent to the use of my health information for treatment, payment, and healthcare operations.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consentToDisclosure"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I consent to the disclosure of my health information to authorized healthcare providers and business associates as necessary for my care.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Electronic Records & Communication",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Digital Health Platform</h3>
            <p className="text-sm text-purple-800">
              DNA Diet Club uses secure, encrypted electronic health records and communication systems to protect your privacy 
              and ensure HIPAA compliance. All data is stored and transmitted using industry-standard security measures.
            </p>
          </div>
          <FormField
            control={form.control}
            name="consentToElectronicRecords"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I consent to the use of electronic health records and digital storage of my health information.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="consentToSecureMessaging"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I consent to secure electronic messaging with my healthcare providers through the DNA Diet Club platform.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="privacyPolicyRead"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">
                    I have read and agree to the DNA Diet Club Privacy Policy and Terms of Service.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      )
    },
    {
      title: "Electronic Signature",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Electronic Signature</h3>
            <p className="text-sm text-yellow-800">
              By providing your electronic signature below, you acknowledge that you have read, understood, and agree to all the terms and conditions outlined in this HIPAA consent form.
            </p>
          </div>
          <div className="space-y-4 p-4 bg-white border-2 border-blue-300 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900">Electronic Signature Required</h3>
            
            <label htmlFor="signature-input" className="text-base font-medium text-gray-900 block">
              Type your full legal name below:
            </label>
            
            {/* Simple textarea approach */}
            <textarea
              id="signature-input"
              value={signatureValue}
              onChange={(e) => {
                console.log("Textarea change:", e.target.value);
                const newValue = e.target.value;
                setSignatureValue(newValue);
                form.setValue("signature", newValue);
              }}
              placeholder="Enter your full legal name here..."
              className="w-full min-h-[60px] text-lg p-4 border-3 border-blue-400 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-200 bg-yellow-50 font-mono"
              style={{ 
                fontSize: '18px',
                lineHeight: '1.5',
                fontFamily: 'monospace',
                backgroundColor: '#fffbeb',
                border: '3px solid #3b82f6'
              }}
              autoFocus
              rows={2}
            />
            
            {/* Alternative simple input */}
            <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded">
              <label className="block text-sm font-medium text-green-800 mb-2">
                Alternative: Type here if above doesn't work
              </label>
              <input
                type="text"
                value={signatureValue}
                onChange={(e) => {
                  console.log("Alternative input:", e.target.value);
                  setSignatureValue(e.target.value);
                  form.setValue("signature", e.target.value);
                }}
                className="w-full p-3 text-lg border-2 border-green-400 rounded bg-white"
                placeholder="Your full name here..."
              />
            </div>
            
            {/* Debug display */}
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded text-sm">
                <strong>What you've typed:</strong> "{signatureValue}"
              </div>
              <div className="p-3 bg-blue-100 rounded text-sm">
                <strong>Length:</strong> {signatureValue.length} characters
              </div>
            </div>
            
            {form.formState.errors.signature && (
              <div className="p-3 bg-red-100 border-2 border-red-300 rounded text-red-800">
                Error: {form.formState.errors.signature.message}
              </div>
            )}
          </div>
          <FormField
            control={form.control}
            name="signatureDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signature Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="witnessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Witness Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Name of witness if applicable" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalComments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Comments (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional comments or questions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FreshLogo size="login" showTitle={false} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HIPAA Consent Form</h1>
          <p className="text-gray-600">Protected Health Information Authorization</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {sections[currentSection].icon}
                <CardTitle className="text-xl">{sections[currentSection].title}</CardTitle>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {currentSection + 1} of {sections.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitConsentMutation.mutate(data))}>
                {sections[currentSection].content}
                
                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevSection}
                    disabled={currentSection === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentSection < sections.length - 1 ? (
                    <Button type="button" onClick={nextSection}>
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={submitConsentMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitConsentMutation.isPending ? "Submitting..." : "Submit HIPAA Consent"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2025 DNA Diet Club. HIPAA Compliant Healthcare Platform.</p>
          <p>For questions about your privacy rights, contact our Privacy Officer at privacy@dnadietclub.com</p>
        </div>
      </div>
    </div>
  );
}
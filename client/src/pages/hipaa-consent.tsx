import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Shield, FileCheck, Lock, Eye, UserCheck, FileText, PenTool } from "lucide-react";
import FreshLogo from "@/components/fresh-logo";



interface HipaaConsentProps {
  patientId: number;
  onComplete: () => void;
}

export default function HipaaConsent({ patientId, onComplete }: HipaaConsentProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [signatureValue, setSignatureValue] = useState("");

  const [formData, setFormData] = useState({
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
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(`Updated ${field}:`, value);
  };

  const handleSubmit = async () => {
    console.log("Submitting form data:", formData);
    
    // Basic validation
    if (!formData.signature || formData.signature.length < 2) {
      toast({
        title: "Signature Required",
        description: "Please enter your full legal name as your electronic signature.",
        variant: "destructive",
      });
      return;
    }

    // Check required checkboxes
    const requiredFields = ['consentToUse', 'consentToDisclosure', 'consentToTreatment', 'consentToElectronicRecords', 'consentToSecureMessaging', 'rightsAcknowledgment', 'privacyPolicyRead'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Consents Missing",
        description: "Please check all required consent boxes to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", `/api/patients/${patientId}/hipaa-consent`, formData);
      await response.json();
      
      toast({
        title: "HIPAA Consent Submitted",
        description: "Your HIPAA consent form has been successfully submitted and recorded.",
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit HIPAA consent form",
        variant: "destructive",
      });
    }
  };

  const sections = [
    {
      title: "Patient Information",
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => updateFormData('patientName', e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
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
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="rightsAcknowledgment"
              checked={formData.rightsAcknowledgment}
              onChange={(e) => updateFormData('rightsAcknowledgment', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="rightsAcknowledgment" className="text-sm font-medium text-gray-700 cursor-pointer">
              I acknowledge that I have been provided with a copy of the Notice of Privacy Practices and understand my rights regarding my health information.
            </label>
          </div>
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
              Our health platform provides personalized health and wellness services including AI-powered nutrition analysis, 
              meal planning, exercise recommendations, and health monitoring through secure digital platforms.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentToTreatment"
              checked={formData.consentToTreatment}
              onChange={(e) => updateFormData('consentToTreatment', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentToTreatment" className="text-sm font-medium text-gray-700 cursor-pointer">
              I consent to treatment and services provided by our health platform and its healthcare providers.
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentToUse"
              checked={formData.consentToUse}
              onChange={(e) => updateFormData('consentToUse', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentToUse" className="text-sm font-medium text-gray-700 cursor-pointer">
              I consent to the use of my health information for treatment, payment, and healthcare operations.
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentToDisclosure"
              checked={formData.consentToDisclosure}
              onChange={(e) => updateFormData('consentToDisclosure', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentToDisclosure" className="text-sm font-medium text-gray-700 cursor-pointer">
              I consent to the disclosure of my health information to authorized healthcare providers and business associates as necessary for my care.
            </label>
          </div>
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
              Our health platform uses secure, encrypted electronic health records and communication systems to protect your privacy 
              and ensure HIPAA compliance. All data is stored and transmitted using industry-standard security measures.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentToElectronicRecords"
              checked={formData.consentToElectronicRecords}
              onChange={(e) => updateFormData('consentToElectronicRecords', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentToElectronicRecords" className="text-sm font-medium text-gray-700 cursor-pointer">
              I consent to the use of electronic health records and digital storage of my health information.
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consentToSecureMessaging"
              checked={formData.consentToSecureMessaging}
              onChange={(e) => updateFormData('consentToSecureMessaging', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consentToSecureMessaging" className="text-sm font-medium text-gray-700 cursor-pointer">
              I consent to secure electronic messaging with my healthcare providers through our health platform.
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacyPolicyRead"
              checked={formData.privacyPolicyRead}
              onChange={(e) => updateFormData('privacyPolicyRead', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="privacyPolicyRead" className="text-sm font-medium text-gray-700 cursor-pointer">
              I have read and agree to our Privacy Policy and Terms of Service.
            </label>
          </div>
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
          <div className="space-y-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900">Electronic Signature Required</h3>
            
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Type your full legal name as your electronic signature:
              </label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => {
                  console.log("Signature input:", e.target.value);
                  updateFormData('signature', e.target.value);
                }}
                placeholder="Your full legal name..."
                className="w-full text-lg p-4 border-2 border-blue-400 rounded-md focus:border-blue-600 focus:ring-2 focus:ring-blue-200 bg-white"
                autoFocus
              />
              <p className="mt-2 text-sm text-blue-700 bg-blue-100 p-2 rounded">
                Current signature: "{formData.signature}" ({formData.signature.length} characters)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature Date</label>
              <input
                type="date"
                value={formData.signatureDate}
                onChange={(e) => updateFormData('signatureDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witness Name (Optional)</label>
              <input
                type="text"
                value={formData.witnessName}
                onChange={(e) => updateFormData('witnessName', e.target.value)}
                placeholder="Name of witness if applicable"
                className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments (Optional)</label>
              <textarea
                value={formData.additionalComments}
                onChange={(e) => updateFormData('additionalComments', e.target.value)}
                placeholder="Any additional comments or questions"
                className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
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
            <div>
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
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit HIPAA Consent
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2025 Health Platform. HIPAA Compliant Healthcare Platform.</p>
          <p>For questions about your privacy rights, contact our Privacy Officer at privacy@dnadietclub.com</p>
        </div>
      </div>
    </div>
  );
}
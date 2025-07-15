import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, Lock, Eye, FileCheck, Users, Server } from "lucide-react";
import logoPath from "@assets/Logo-1_1752362928812.png";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img 
            src={logoPath} 
            alt="DNA Diet Club" 
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">HIPAA Compliant Healthcare Platform</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <CardTitle className="text-2xl">Notice of Privacy Practices</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Effective Date: January 15, 2025 | Last Updated: January 15, 2025
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Our Commitment to Your Privacy</h2>
              </div>
              <p className="text-gray-700">
                DNA Diet Club is committed to protecting the privacy and security of your health information. This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> We are required by law to maintain the privacy of your protected health information (PHI) and to provide you with this notice of our legal duties and privacy practices with respect to PHI.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold">How We Use and Disclose Your Health Information</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-semibold text-green-800">For Treatment</h3>
                  <p className="text-sm text-gray-700">
                    We use your health information to provide, coordinate, or manage your healthcare and related services. This includes AI-powered nutrition analysis, meal planning, exercise recommendations, and health monitoring.
                  </p>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-semibold text-blue-800">For Payment</h3>
                  <p className="text-sm text-gray-700">
                    We use your health information to bill and collect payment for services provided, including subscription management and insurance processing where applicable.
                  </p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h3 className="font-semibold text-purple-800">For Healthcare Operations</h3>
                  <p className="text-sm text-gray-700">
                    We use your health information for quality assessment, outcomes evaluation, population health management, and improvement of our AI algorithms and services.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Your Rights Regarding Your Health Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Right to Request Restrictions</h3>
                  <p className="text-sm text-purple-700">
                    You have the right to request restrictions on how we use or disclose your health information for treatment, payment, or healthcare operations.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Right to Access</h3>
                  <p className="text-sm text-green-700">
                    You have the right to inspect and copy your health information, including electronic records and AI-generated insights.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Right to Amend</h3>
                  <p className="text-sm text-blue-700">
                    You have the right to request amendments to your health information if you believe it is incorrect or incomplete.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Right to Accounting</h3>
                  <p className="text-sm text-yellow-700">
                    You have the right to receive an accounting of disclosures of your health information made by us.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold">Security Measures</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Technical Safeguards</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• End-to-end encryption for all data transmission</li>
                    <li>• Secure, encrypted database storage</li>
                    <li>• Multi-factor authentication for all accounts</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Administrative Safeguards</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• HIPAA compliance training for all staff</li>
                    <li>• Strict access controls and user authentication</li>
                    <li>• Regular backup and disaster recovery procedures</li>
                    <li>• Incident response and breach notification protocols</li>
                  </ul>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">Physical Safeguards</h3>
                  <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Secure data centers with 24/7 monitoring</li>
                    <li>• Biometric access controls for server facilities</li>
                    <li>• Environmental controls and fire suppression</li>
                    <li>• Secure disposal of electronic media</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">AI and Machine Learning</h2>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-2">AI-Powered Health Insights</h3>
                <p className="text-sm text-indigo-700 mb-2">
                  DNA Diet Club uses advanced AI algorithms to analyze your health data and provide personalized recommendations. Here's how we protect your privacy:
                </p>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• All AI processing occurs on secure, HIPAA-compliant servers</li>
                  <li>• Personal identifiers are removed from AI training datasets</li>
                  <li>• AI models are regularly audited for bias and accuracy</li>
                  <li>• You have the right to opt out of AI analysis at any time</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-semibold">Business Associates</h2>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-pink-700">
                  We may disclose your health information to business associates who perform services on our behalf. All business associates sign agreements requiring them to protect your health information and comply with HIPAA regulations.
                </p>
                <div className="mt-2">
                  <h4 className="font-semibold text-pink-800">Current Business Associates:</h4>
                  <ul className="text-sm text-pink-700 mt-1">
                    <li>• Cloud hosting providers (AWS, Google Cloud)</li>
                    <li>• Payment processors (Stripe, PayPal)</li>
                    <li>• Analytics services (HIPAA-compliant only)</li>
                    <li>• Third-party integrations (Dexcom CGM)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Privacy Officer</h3>
                    <p className="text-sm text-gray-600">
                      Email: privacy@dnadietclub.com<br />
                      Phone: 1-800-DNA-DIET<br />
                      Address: 123 Health St, Wellness City, HC 12345
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Compliance Department</h3>
                    <p className="text-sm text-gray-600">
                      Email: compliance@dnadietclub.com<br />
                      Phone: 1-800-DNA-HELP<br />
                      Hours: Mon-Fri 9AM-5PM EST
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Changes to This Notice</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  We reserve the right to change this notice and make the new notice apply to health information we already have about you as well as any information we receive in the future. We will post a copy of the current notice on our website and make copies available upon request.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Complaints</h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700 mb-2">
                  If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of the Department of Health and Human Services. We will not retaliate against you for filing a complaint.
                </p>
                <p className="text-sm text-red-700">
                  <strong>To file a complaint:</strong> Contact our Privacy Officer at privacy@dnadietclub.com or call 1-800-DNA-DIET.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
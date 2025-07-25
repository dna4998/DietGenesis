import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { Patient } from "@shared/schema";

interface SupplementsCardProps {
  patient: Patient;
}

export default function SupplementsCard({ patient }: SupplementsCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Supplement Protocol</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patient.supplements && patient.supplements.length > 0 ? (
            patient.supplements.map((supplement, idx) => {
              const colors = [
                { bg: 'bg-gradient-to-r from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-900', subtext: 'text-orange-700', button: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' },
                { bg: 'bg-gradient-to-r from-teal-50 to-teal-100', border: 'border-teal-200', text: 'text-teal-900', subtext: 'text-teal-700', button: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' },
                { bg: 'bg-gradient-to-r from-indigo-50 to-indigo-100', border: 'border-indigo-200', text: 'text-indigo-900', subtext: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700' },
                { bg: 'bg-gradient-to-r from-pink-50 to-pink-100', border: 'border-pink-200', text: 'text-pink-900', subtext: 'text-pink-700', button: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700' },
                { bg: 'bg-gradient-to-r from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-900', subtext: 'text-amber-700', button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' }
              ];
              const colorScheme = colors[idx % colors.length];
              
              return (
                <div key={idx} className={`flex items-center justify-between p-3 ${colorScheme.bg} border ${colorScheme.border} rounded-lg transform hover:scale-105 transition-all shadow-lg hover:shadow-xl`}>
                  <div>
                    <div className={`font-medium ${colorScheme.text}`}>{supplement}</div>
                    <div className={`text-sm ${colorScheme.subtext}`}>Take as directed on label</div>
                  </div>
                  <Button
                    size="sm"
                    className={`${colorScheme.button} text-white shadow-lg hover:shadow-xl`}
                    onClick={() => window.open(`https://www.thorne.com`, '_blank')}
                  >
                    <span className="flex items-center gap-1">
                      Order
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No supplements assigned</div>
          )}
        </div>
        {patient.glp1Prescription && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">GLP-1 Prescription</h4>
            <p className="text-amber-700">{patient.glp1Prescription}</p>
            <p className="text-sm text-amber-600 mt-1">Consult with your provider for administration guidance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

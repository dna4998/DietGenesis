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
            patient.supplements.map((supplement, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{supplement}</div>
                  <div className="text-sm text-gray-600">Take as directed on label</div>
                </div>
                <Button
                  size="sm"
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => window.open(`https://www.thorne.com/u/PR115297`, '_blank')}
                >
                  <span className="flex items-center gap-1">
                    Order
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </Button>
              </div>
            ))
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

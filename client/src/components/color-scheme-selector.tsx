import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";

interface ColorScheme {
  name: string;
  description: string;
  themes: {
    excellent: { primary: string; secondary: string; accent: string };
    good: { primary: string; secondary: string; accent: string };
    fair: { primary: string; secondary: string; accent: string };
    needsAttention: { primary: string; secondary: string; accent: string };
    critical: { primary: string; secondary: string; accent: string };
  };
}

const colorSchemes: ColorScheme[] = [
  {
    name: "Medical Professional",
    description: "Current scheme - Professional blues and greens with medical feel",
    themes: {
      excellent: { primary: "hsl(142, 76%, 36%)", secondary: "hsl(142, 76%, 46%)", accent: "hsl(142, 76%, 26%)" },
      good: { primary: "hsl(221, 83%, 53%)", secondary: "hsl(221, 83%, 63%)", accent: "hsl(221, 83%, 43%)" },
      fair: { primary: "hsl(48, 96%, 53%)", secondary: "hsl(48, 96%, 63%)", accent: "hsl(48, 96%, 43%)" },
      needsAttention: { primary: "hsl(25, 95%, 53%)", secondary: "hsl(25, 95%, 63%)", accent: "hsl(25, 95%, 43%)" },
      critical: { primary: "hsl(0, 84%, 60%)", secondary: "hsl(0, 84%, 70%)", accent: "hsl(0, 84%, 50%)" }
    }
  },
  {
    name: "Nature Wellness",
    description: "Earth tones with calming greens and warm browns",
    themes: {
      excellent: { primary: "hsl(120, 60%, 35%)", secondary: "hsl(120, 60%, 45%)", accent: "hsl(120, 60%, 25%)" },
      good: { primary: "hsl(95, 50%, 45%)", secondary: "hsl(95, 50%, 55%)", accent: "hsl(95, 50%, 35%)" },
      fair: { primary: "hsl(45, 80%, 50%)", secondary: "hsl(45, 80%, 60%)", accent: "hsl(45, 80%, 40%)" },
      needsAttention: { primary: "hsl(30, 75%, 55%)", secondary: "hsl(30, 75%, 65%)", accent: "hsl(30, 75%, 45%)" },
      critical: { primary: "hsl(15, 70%, 50%)", secondary: "hsl(15, 70%, 60%)", accent: "hsl(15, 70%, 40%)" }
    }
  },
  {
    name: "Ocean Therapy",
    description: "Soothing blues and teals inspired by ocean wellness",
    themes: {
      excellent: { primary: "hsl(174, 62%, 47%)", secondary: "hsl(174, 62%, 57%)", accent: "hsl(174, 62%, 37%)" },
      good: { primary: "hsl(197, 71%, 52%)", secondary: "hsl(197, 71%, 62%)", accent: "hsl(197, 71%, 42%)" },
      fair: { primary: "hsl(39, 84%, 56%)", secondary: "hsl(39, 84%, 66%)", accent: "hsl(39, 84%, 46%)" },
      needsAttention: { primary: "hsl(24, 74%, 58%)", secondary: "hsl(24, 74%, 68%)", accent: "hsl(24, 74%, 48%)" },
      critical: { primary: "hsl(4, 69%, 56%)", secondary: "hsl(4, 69%, 66%)", accent: "hsl(4, 69%, 46%)" }
    }
  },
  {
    name: "Sunset Vitality",
    description: "Warm sunset colors promoting energy and vitality",
    themes: {
      excellent: { primary: "hsl(340, 75%, 55%)", secondary: "hsl(340, 75%, 65%)", accent: "hsl(340, 75%, 45%)" },
      good: { primary: "hsl(280, 65%, 60%)", secondary: "hsl(280, 65%, 70%)", accent: "hsl(280, 65%, 50%)" },
      fair: { primary: "hsl(35, 85%, 58%)", secondary: "hsl(35, 85%, 68%)", accent: "hsl(35, 85%, 48%)" },
      needsAttention: { primary: "hsl(15, 80%, 60%)", secondary: "hsl(15, 80%, 70%)", accent: "hsl(15, 80%, 50%)" },
      critical: { primary: "hsl(355, 75%, 58%)", secondary: "hsl(355, 75%, 68%)", accent: "hsl(355, 75%, 48%)" }
    }
  },
  {
    name: "Forest Zen",
    description: "Deep forest greens with natural, calming tones",
    themes: {
      excellent: { primary: "hsl(155, 100%, 30%)", secondary: "hsl(155, 100%, 40%)", accent: "hsl(155, 100%, 20%)" },
      good: { primary: "hsl(120, 73%, 42%)", secondary: "hsl(120, 73%, 52%)", accent: "hsl(120, 73%, 32%)" },
      fair: { primary: "hsl(60, 70%, 50%)", secondary: "hsl(60, 70%, 60%)", accent: "hsl(60, 70%, 40%)" },
      needsAttention: { primary: "hsl(38, 88%, 50%)", secondary: "hsl(38, 88%, 60%)", accent: "hsl(38, 88%, 40%)" },
      critical: { primary: "hsl(12, 76%, 48%)", secondary: "hsl(12, 76%, 58%)", accent: "hsl(12, 76%, 38%)" }
    }
  },
  {
    name: "Modern Minimalist",
    description: "Clean, modern colors with sophisticated grays and accents",
    themes: {
      excellent: { primary: "hsl(156, 73%, 44%)", secondary: "hsl(156, 73%, 54%)", accent: "hsl(156, 73%, 34%)" },
      good: { primary: "hsl(213, 94%, 68%)", secondary: "hsl(213, 94%, 78%)", accent: "hsl(213, 94%, 58%)" },
      fair: { primary: "hsl(47, 100%, 68%)", secondary: "hsl(47, 100%, 78%)", accent: "hsl(47, 100%, 58%)" },
      needsAttention: { primary: "hsl(22, 93%, 67%)", secondary: "hsl(22, 93%, 77%)", accent: "hsl(22, 93%, 57%)" },
      critical: { primary: "hsl(0, 72%, 65%)", secondary: "hsl(0, 72%, 75%)", accent: "hsl(0, 72%, 55%)" }
    }
  }
];

interface ColorSchemeSelectorProps {
  onSchemeSelect: (scheme: ColorScheme) => void;
  currentScheme?: string;
}

export default function ColorSchemeSelector({ onSchemeSelect, currentScheme }: ColorSchemeSelectorProps) {
  const [selectedScheme, setSelectedScheme] = useState<string>(currentScheme || "Medical Professional");

  const handleSchemeSelect = (scheme: ColorScheme) => {
    setSelectedScheme(scheme.name);
    onSchemeSelect(scheme);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Color Scheme Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {colorSchemes.map((scheme) => (
          <div key={scheme.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{scheme.name}</h3>
                <p className="text-sm text-muted-foreground">{scheme.description}</p>
              </div>
              <Button
                variant={selectedScheme === scheme.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleSchemeSelect(scheme)}
                className="min-w-[80px]"
              >
                {selectedScheme === scheme.name && <Check className="h-4 w-4 mr-1" />}
                {selectedScheme === scheme.name ? "Active" : "Select"}
              </Button>
            </div>
            
            {/* Color Preview */}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(scheme.themes).map(([status, colors]) => (
                <div key={status} className="text-center">
                  <div
                    className="w-full h-12 rounded-lg border-2 border-white shadow-sm mb-1"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <Badge variant="outline" className="text-xs">
                    {status === 'needsAttention' ? 'Needs Attention' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">How It Works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Colors automatically change based on patient health metrics</li>
            <li>• Better health scores show greener/positive colors</li>
            <li>• Lower scores display warmer warning colors</li>
            <li>• The entire app theme adapts including headers, buttons, and cards</li>
            <li>• Works perfectly on mobile devices and tablets</li>
          </ul>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">
            💡 <strong>Tip:</strong> Each color scheme maintains the same health-based logic but with different color palettes. 
            Try different schemes to see which visual style best fits your brand and patient preferences!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
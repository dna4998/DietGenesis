import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdaptiveTheme } from "@/hooks/use-adaptive-theme";
import { Smartphone, Tablet, Monitor, Palette } from "lucide-react";
import type { Patient } from "@/../../shared/schema";

interface MobilePreviewProps {
  patient?: Patient;
}

export default function MobilePreview({ patient }: MobilePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const healthStatus = useAdaptiveTheme(patient);

  const deviceSizes = {
    mobile: {
      portrait: { width: 375, height: 667 }, // iPhone SE
      landscape: { width: 667, height: 375 }
    },
    tablet: {
      portrait: { width: 768, height: 1024 }, // iPad
      landscape: { width: 1024, height: 768 }
    },
    desktop: {
      portrait: { width: 1200, height: 800 },
      landscape: { width: 1200, height: 800 }
    }
  };

  const currentSize = deviceSizes[selectedDevice][orientation];
  const scale = Math.min(400 / currentSize.width, 300 / currentSize.height);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Mobile & Tablet Preview</span>
          <Badge style={{ backgroundColor: healthStatus.primary, color: 'white' }}>
            {healthStatus.statusColor.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selection */}
        <div className="flex space-x-2">
          <Button
            variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            Phone
          </Button>
          <Button
            variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('tablet')}
          >
            <Tablet className="h-4 w-4 mr-1" />
            Tablet
          </Button>
          <Button
            variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDevice('desktop')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            Desktop
          </Button>
        </div>

        {/* Orientation Toggle */}
        {selectedDevice !== 'desktop' && (
          <div className="flex space-x-2">
            <Button
              variant={orientation === 'portrait' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </Button>
            <Button
              variant={orientation === 'landscape' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </Button>
          </div>
        )}

        {/* Mobile Preview Frame */}
        <div className="flex justify-center">
          <div 
            className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-lg"
            style={{
              width: currentSize.width * scale,
              height: currentSize.height * scale,
              backgroundColor: healthStatus.primary
            }}
          >
            <div 
              className="w-full h-full bg-background text-foreground p-2 overflow-hidden"
              style={{ 
                fontSize: `${8 * scale}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${100 / scale}%`,
                height: `${100 / scale}%`
              }}
            >
              {/* Mock Mobile App UI */}
              <div className="flex flex-col h-full">
                {/* Header */}
                <div 
                  className="flex items-center justify-between p-3 border-b"
                  style={{ backgroundColor: healthStatus.primary, color: 'white' }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white rounded" />
                    <span className="font-bold text-sm">DNA Diet Club</span>
                  </div>
                  <div className="text-xs">{healthStatus.healthScore}/100</div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-3 space-y-2">
                  {/* Health Status Card */}
                  <div 
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: healthStatus.primary }}
                  >
                    <div className="text-xs font-medium">Health Status</div>
                    <div className="text-sm font-bold">{healthStatus.statusColor.replace('-', ' ').toUpperCase()}</div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-1">
                      <div 
                        className="bg-white h-1 rounded-full"
                        style={{ width: `${healthStatus.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-card p-2 rounded border">
                      <div className="text-xs text-muted-foreground">Weight</div>
                      <div className="text-sm font-medium">{patient?.weight || 'N/A'} lbs</div>
                    </div>
                    <div className="bg-card p-2 rounded border">
                      <div className="text-xs text-muted-foreground">Body Fat</div>
                      <div className="text-sm font-medium">{patient?.bodyFat || 'N/A'}%</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-1">
                    <div 
                      className="p-2 rounded text-center text-white text-xs"
                      style={{ backgroundColor: healthStatus.primary }}
                    >
                      View Health Insights
                    </div>
                    <div className="p-2 rounded text-center border text-xs">
                      Messages from Provider
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex border-t">
                  <div className="flex-1 p-2 text-center text-xs">Dashboard</div>
                  <div className="flex-1 p-2 text-center text-xs">Messages</div>
                  <div className="flex-1 p-2 text-center text-xs">Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Features Info */}
        <div className="text-sm space-y-2">
          <h4 className="font-medium">Mobile Optimizations:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Touch-First Design:</strong> Large buttons and swipe gestures</li>
            <li>• <strong>Adaptive Colors:</strong> Health status themes work perfectly on mobile</li>
            <li>• <strong>Responsive Layout:</strong> Single column design for easy scrolling</li>
            <li>• <strong>PWA Ready:</strong> Can be installed as a native app</li>
            <li>• <strong>Offline Support:</strong> Core features work without internet</li>
            <li>• <strong>Dark Mode:</strong> Automatically follows system preferences</li>
          </ul>
        </div>

        {/* Platform-Specific Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h5 className="font-medium">iOS Features:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Safari PWA support</li>
              <li>• iOS status bar theming</li>
              <li>• Touch haptics feedback</li>
              <li>• Share sheet integration</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium">Android Features:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Chrome PWA install</li>
              <li>• Material Design elements</li>
              <li>• Back button support</li>
              <li>• Android theming</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
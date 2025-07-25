import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Type, Palette, Download, RefreshCw, Eye, Settings } from "lucide-react";
import FreshLogo from "./fresh-logo";

interface LogoCustomizationPanelProps {
  onLogoChange?: (logoUrl: string) => void;
  onSettingsChange?: (settings: LogoSettings) => void;
}

interface LogoSettings {
  size: 'sm' | 'md' | 'lg' | 'login';
  showTitle: boolean;
  title: string;
  titleColor: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  shadow: boolean;
}

export default function LogoCustomizationPanel({ onLogoChange, onSettingsChange }: LogoCustomizationPanelProps) {
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [settings, setSettings] = useState<LogoSettings>({
    size: 'md',
    showTitle: true,
    title: 'Health Platform',
    titleColor: '#1f2937',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadow: true
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or SVG file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedLogo(result);
      onLogoChange?.(result);
    };
    reader.readAsDataURL(file);
  }, [toast, onLogoChange]);

  const handleUploadToServer = async () => {
    if (!logoFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      toast({
        title: "Logo uploaded successfully",
        description: "Your logo has been saved and will appear throughout the application",
      });

      onLogoChange?.(data.logoUrl);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSettingsChange = (key: keyof LogoSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const resetToDefault = () => {
    setUploadedLogo(null);
    setLogoFile(null);
    setSettings({
      size: 'md',
      showTitle: true,
      title: 'DNA Diet Club',
      titleColor: '#1f2937',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16,
      shadow: true
    });
    onLogoChange?.('/logo.png');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadLogo = () => {
    if (!uploadedLogo) return;
    
    const link = document.createElement('a');
    link.href = uploadedLogo;
    link.download = `${settings.title.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Customize Logo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Logo Customization Panel
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <Image className="w-12 h-12 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, or SVG (max 5MB)
                          </p>
                        </div>
                      </Label>
                    </div>

                    {logoFile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          <span className="text-sm font-medium">{logoFile.name}</span>
                        </div>
                        <Button
                          onClick={handleUploadToServer}
                          disabled={isUploading}
                          size="sm"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            'Save to Server'
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={resetToDefault}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                      {uploadedLogo && (
                        <Button
                          variant="outline"
                          onClick={downloadLogo}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Appearance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Logo Size</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {['sm', 'md', 'lg', 'login'].map((size) => (
                          <Button
                            key={size}
                            variant={settings.size === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSettingsChange('size', size)}
                          >
                            {size.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius: {settings.borderRadius}px</Label>
                      <Slider
                        value={[settings.borderRadius]}
                        onValueChange={(value) => handleSettingsChange('borderRadius', value[0])}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Padding: {settings.padding}px</Label>
                      <Slider
                        value={[settings.padding]}
                        onValueChange={(value) => handleSettingsChange('padding', value[0])}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="shadow"
                        checked={settings.shadow}
                        onCheckedChange={(checked) => handleSettingsChange('shadow', checked)}
                      />
                      <Label htmlFor="shadow">Drop Shadow</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Text Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-title"
                        checked={settings.showTitle}
                        onCheckedChange={(checked) => handleSettingsChange('showTitle', checked)}
                      />
                      <Label htmlFor="show-title">Show Title</Label>
                    </div>

                    {settings.showTitle && (
                      <>
                        <div className="space-y-2">
                          <Label>Title Text</Label>
                          <Input
                            value={settings.title}
                            onChange={(e) => handleSettingsChange('title', e.target.value)}
                            placeholder="Enter title..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Title Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={settings.titleColor}
                              onChange={(e) => handleSettingsChange('titleColor', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              value={settings.titleColor}
                              onChange={(e) => handleSettingsChange('titleColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current uploaded logo preview */}
                  {uploadedLogo && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-700">Current Logo</div>
                      <div 
                        className="border rounded-lg p-4 flex items-center justify-center"
                        style={{
                          backgroundColor: settings.backgroundColor,
                          borderRadius: `${settings.borderRadius}px`,
                          padding: `${settings.padding}px`,
                          boxShadow: settings.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                      >
                        <img 
                          src={uploadedLogo} 
                          alt="Current logo" 
                          className="max-h-20 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Live preview with FreshLogo component */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700">Live Preview</div>
                    <div 
                      className="border rounded-lg p-4 flex items-center justify-center"
                      style={{
                        backgroundColor: settings.backgroundColor,
                        borderRadius: `${settings.borderRadius}px`,
                        padding: `${settings.padding}px`,
                        boxShadow: settings.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ color: settings.titleColor }}>
                        <FreshLogo
                          title={settings.title}
                          size={settings.size}
                          showTitle={settings.showTitle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size comparison preview */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700">Size Comparison</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border rounded-lg p-2 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Header</div>
                          <FreshLogo
                            title={settings.title}
                            size="md"
                            showTitle={settings.showTitle}
                          />
                        </div>
                      </div>
                      <div className="border rounded-lg p-2 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Login</div>
                          <FreshLogo
                            title={settings.title}
                            size="login"
                            showTitle={settings.showTitle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
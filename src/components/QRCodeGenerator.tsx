import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { qrService } from "@/services/qr-service";
import QRCode from 'qrcode.react';
import { Download } from 'lucide-react';
import { nanoid } from 'nanoid';

interface QRCodeGeneratorProps {
  onQRGenerated?: () => void;
}

export function QRCodeGenerator({ onQRGenerated }: QRCodeGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [qrColor, setQrColor] = useState('#8B5CF6');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size, setSize] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    // Reset state when changing tabs
    if (activeTab === 'generate') {
      setQrGenerated(false);
    }
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to generate a QR code.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate URL format
      new URL(url);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (user) {
        // Save to service if user is logged in
        const slug = nanoid(8); // Generate a random slug
        const newQRLink = await qrService.createQRLink({
          name: name || 'Untitled QR Code',
          target_url: url,
          slug: slug,
          color: qrColor,
          background_color: bgColor
        });
        
        // Generate the redirect URL using the service to ensure consistency
        // This will work correctly on any domain, including custom domains
        const newRedirectUrl = qrService.getRedirectUrl(newQRLink.slug);
        setRedirectUrl(newRedirectUrl);
      } else {
        // For non-logged in users, just create a demo redirect URL
        const demoSlug = `demo-${nanoid(6)}`;
        setRedirectUrl(qrService.getRedirectUrl(demoSlug));
      }
      
      setQrGenerated(true);
      setActiveTab('download');
      
      toast({
        title: "QR Code Generated!",
        description: "Your QR code has been created successfully.",
      });
      
      if (onQRGenerated) {
        onQRGenerated();
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        title: "Generation Failed",
        description: "There was a problem generating your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = (format: 'svg' | 'png') => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;
    
    if (format === 'svg') {
      // For SVG we need to extract the SVG element
      const svgElement = canvas.querySelector('svg');
      if (!svgElement) return;
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'qr-code'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For PNG, we convert the canvas to an image
      const canvasElement = canvas.querySelector('canvas');
      if (!canvasElement) return;
      
      const url = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'qr-code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({
      title: "Download Started",
      description: `Your QR code is being downloaded as ${format.toUpperCase()}.`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text">QR Code Generator</CardTitle>
        <CardDescription>
          Create custom QR codes for your business or personal use
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="download" disabled={!qrGenerated}>Preview & Download</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">QR Code Name</Label>
                <Input 
                  id="name" 
                  placeholder="My QR Code" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="mt-1" 
                />
              </div>
              
              <div>
                <Label htmlFor="url">
                  Destination URL <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="url" 
                  placeholder="https://example.com" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  required 
                  className="mt-1" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qr-color">QR Color</Label>
                  <div className="flex items-center mt-1">
                    <input
                      type="color"
                      id="qr-color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input 
                      value={qrColor} 
                      onChange={(e) => setQrColor(e.target.value)} 
                      className="ml-2" 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex items-center mt-1">
                    <input
                      type="color"
                      id="bg-color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                      className="ml-2" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="size">Size: {size}px</Label>
                <input
                  type="range"
                  id="size"
                  min="100"
                  max="500"
                  step="10"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              className="w-full" 
              size="lg" 
              disabled={isLoading || !url}
            >
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </TabsContent>
          
          <TabsContent value="download" className="space-y-6">
            {qrGenerated && (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div 
                  id="qr-code-canvas" 
                  className="p-4 border rounded-lg shadow-sm" 
                  style={{ backgroundColor: bgColor }}
                >
                  <QRCode 
                    value={redirectUrl || url} 
                    size={size} 
                    fgColor={qrColor} 
                    bgColor={bgColor} 
                    level="H"
                    includeMargin
                  />
                </div>
                
                <div className="text-center">
                  <p className="font-medium">{name || 'Untitled QR Code'}</p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-medium">Redirect URL:</p>
                    <p className="text-xs text-muted-foreground break-all mt-1 bg-muted p-2 rounded-md">{redirectUrl || url}</p>
                    <p className="text-xs text-muted-foreground mt-2">Destination URL:</p>
                    <p className="text-xs text-muted-foreground break-all mt-1">{url}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => downloadQRCode('svg')}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download SVG
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => downloadQRCode('png')}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PNG
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {user ? 'This QR code will be saved to your account.' : 'Sign in to save and track your QR codes.'}
        </p>
      </CardFooter>
    </Card>
  );
}

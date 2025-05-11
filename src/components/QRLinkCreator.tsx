
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { qrService } from '@/services/qr-service';
import { Loader2, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { nanoid } from 'nanoid';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  target_url: z.string().url('Please enter a valid URL'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'),
  background_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
});

type FormValues = z.infer<typeof formSchema>;

interface QRLinkCreatorProps {
  onSuccess?: (qrLink: any) => void;
}

export function QRLinkCreator({ onSuccess }: QRLinkCreatorProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      target_url: 'https://',
      slug: '',
      color: '#8B5CF6',
      background_color: '#FFFFFF'
    }
  });
  
  const { watch } = form;
  const targetUrl = watch('target_url');
  const slug = watch('slug');
  const color = watch('color');
  const backgroundColor = watch('background_color');
  
  // Generate preview QR code with the redirect URL
  React.useEffect(() => {
    if (targetUrl.startsWith('http')) {
      // Generate preview redirect URL
      const baseUrl = window.location.origin;
      const previewSlug = slug || nanoid(8); // Use a random slug if not provided
      const previewRedirectUrl = `${baseUrl}/r/${previewSlug}`;
      setRedirectUrl(previewRedirectUrl);
      setPreviewUrl(previewRedirectUrl); // Use redirect URL for QR code
    }
  }, [targetUrl, slug]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(redirectUrl);
    toast({
      title: "Copied!",
      description: "Redirect URL copied to clipboard",
    });
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsCreating(true);
    try {
      // Generate random slug if not provided
      const finalSlug = values.slug || nanoid(8);
      
      const newQRLink = await qrService.createQRLink({
        name: values.name,
        target_url: values.target_url,
        slug: finalSlug,
        color: values.color,
        background_color: values.background_color
      });
      
      const shortUrl = `${window.location.origin}/r/${newQRLink.slug}`;
      toast({
        title: "QR Code Created!",
        description: (
          <div className="space-y-2">
            <p>Your QR code "{values.name}" has been created successfully.</p>
            <p className="text-xs font-mono bg-muted p-1 rounded">
              Trackable URL: {shortUrl}
            </p>
          </div>
        ),
      });
      
      if (onSuccess) {
        onSuccess(newQRLink);
      }
      
      // Reset form
      form.reset({
        name: '',
        target_url: 'https://',
        slug: '',
        color: '#8B5CF6',
        background_color: '#FFFFFF'
      });
    } catch (error: any) {
      console.error('Error creating QR link:', error);
      toast({
        title: "Error Creating QR Code",
        description: error.message || "There was a problem creating your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Create a New Trackable QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My QR Code" {...field} />
                      </FormControl>
                      <FormDescription>
                        A name to help you identify this QR code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="target_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where should this QR code take people?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Slug (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="my-custom-link" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customize your short link (e.g., yourdomain.com/r/<span className="font-mono">my-custom-link</span>)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QR Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-12 h-10 p-1" />
                            <Input type="text" {...field} className="flex-1" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="background_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-12 h-10 p-1" />
                            <Input type="text" {...field} className="flex-1" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create QR Code
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <div className="text-center mb-4">
              <h3 className="font-medium">Preview</h3>
              <p className="text-sm text-muted-foreground">Your QR code will look like this</p>
            </div>
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <QRCodeSVG 
                    value={previewUrl}
                    size={200}
                    fgColor={color}
                    bgColor={backgroundColor}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                
                {redirectUrl && (
                  <div className="w-full">
                    <div className="text-center text-sm mb-1">Redirect URL</div>
                    <div className="flex items-center gap-1">
                      <div className="bg-muted p-2 rounded text-xs font-mono flex-1 overflow-hidden text-ellipsis">
                        {redirectUrl}
                      </div>
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" 
                        onClick={() => window.open(redirectUrl, '_blank')}
                        className="flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 w-48 bg-muted rounded-lg">
                <p className="text-muted-foreground">Enter a valid URL to preview</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-center py-2">
        <p className="text-xs text-muted-foreground">All QR codes include real-time tracking and analytics</p>
      </CardFooter>
    </Card>
  );
}

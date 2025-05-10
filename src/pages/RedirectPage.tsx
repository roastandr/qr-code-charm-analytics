
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirectService } from '@/services/redirect-service';
import { QrCode, ExternalLink } from 'lucide-react';

export default function RedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [qrName, setQrName] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    // Process redirect
    const processRedirect = async () => {
      if (!shortCode) {
        setError('Invalid QR code link');
        setLoading(false);
        return;
      }
      
      try {
        const result = await redirectService.trackAndRedirect(shortCode);
        
        if (result.success && result.url) {
          setDestination(result.url);
          setQrName(result.name || null);
          
          // Start countdown for automatic redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                window.location.href = result.url;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setError(result.error || 'Invalid QR code');
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError('An error occurred while processing your request');
      } finally {
        setLoading(false);
      }
    };
    
    processRedirect();
  }, [shortCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            {loading ? 'Processing...' : error ? 'Error' : 'Redirecting...'}
          </CardTitle>
          {qrName && (
            <CardDescription className="text-center">
              {qrName}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center space-y-4">
              <p className="text-destructive">{error}</p>
              <p className="text-muted-foreground text-sm">
                This QR code is invalid, expired, or has been deleted.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p>
                You are being redirected to:
              </p>
              <p className="font-medium break-all bg-muted p-2 rounded">
                {destination}
              </p>
              <p className="text-muted-foreground">
                Automatic redirect in {countdown} seconds...
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pt-4">
          {!loading && !error && destination && (
            <Button onClick={() => window.location.href = destination} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Go Now
            </Button>
          )}
          
          {!loading && error && (
            <Button asChild variant="outline">
              <Link to="/">Return to Homepage</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { qrService } from '@/services/qr-service';
import { QRCode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeList } from './QRCodeList';
import { QRCodeStats } from './QRCodeStats';
import { QRCodeGenerator } from './QRCodeGenerator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, QrCode } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("qrcodes");
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);

  useEffect(() => {
    if (user) {
      loadQRCodes();
    }
  }, [user]);

  const loadQRCodes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const codes = await qrService.getQRCodes(user.id);
      setQRCodes(codes);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
      toast({
        title: "Failed to load QR codes",
        description: "There was a problem loading your QR codes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRGenerated = () => {
    loadQRCodes();
  };

  const handleQRCodeSelect = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode);
    setActiveTab('stats');
  };

  const handleCreateNew = () => {
    setSelectedQRCode(null);
    setActiveTab('create');
  };

  const handleBackToList = () => {
    setSelectedQRCode(null);
    setActiveTab('qrcodes');
  };

  const handleDeleteQRCode = async (id: string) => {
    try {
      await qrService.deleteQRCode(id);
      
      if (selectedQRCode?.id === id) {
        setSelectedQRCode(null);
        setActiveTab('qrcodes');
      }
      
      setQRCodes(qrCodes.filter(qr => qr.id !== id));
      
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete QR code:', error);
      toast({
        title: "Failed to Delete",
        description: "There was a problem deleting the QR code.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in or create an account to access the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">QR Code Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your QR codes
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" /> Create New QR Code
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="qrcodes">My QR Codes</TabsTrigger>
          <TabsTrigger value="stats" disabled={!selectedQRCode}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcodes">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[120px] w-full rounded-lg" />
              <Skeleton className="h-[120px] w-full rounded-lg" />
              <Skeleton className="h-[120px] w-full rounded-lg" />
            </div>
          ) : qrCodes.length > 0 ? (
            <QRCodeList 
              qrCodes={qrCodes} 
              onSelect={handleQRCodeSelect} 
              onDelete={handleDeleteQRCode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No QR Codes Yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven't created any QR codes yet. Get started by creating your first QR code.
              </p>
              <Button onClick={() => setActiveTab('create')}>
                Create Your First QR Code
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          {selectedQRCode && (
            <>
              <Button 
                variant="ghost" 
                onClick={handleBackToList}
                className="mb-4"
              >
                ← Back to QR Codes
              </Button>
              <QRCodeStats qrCode={selectedQRCode} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <QRCodeGenerator onQRGenerated={handleQRGenerated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QRLinkCreator } from "@/components/QRLinkCreator";
import { QRCodeList } from "@/components/QRCodeList";
import { QRCodeStats } from '@/components/QRCodeStats';
import { useAuth } from '@/hooks/use-auth';
import { qrService } from '@/services/qr-service';
import { QRCode } from '@/types';
import { Loader2, PlusCircle, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrLinks, setQrLinks] = useState<QRCode[]>([]);
  const [selectedQrLink, setSelectedQrLink] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-codes');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  const loadQRLinks = async () => {
    if (deleteInProgress) return; // Don't reload while deletion is in progress
    
    setLoading(true);
    try {
      const data = await qrService.getQRLinks();
      
      // Ensure we have scan counts for all QR links
      const linksWithTotalScans = await Promise.all(
        data.map(async (link) => {
          try {
            const stats = await qrService.getQRCodeStats(link.id);
            return {
              ...link,
              totalScans: stats.totalScans
            };
          } catch (error) {
            console.error('Error loading stats for QR link:', error);
            return link;
          }
        })
      );
      
      setQrLinks(linksWithTotalScans);
      
      // If there are QR codes and none is selected, select the first one
      if (linksWithTotalScans.length > 0 && !selectedQrLink) {
        setSelectedQrLink(linksWithTotalScans[0]);
      } else if (linksWithTotalScans.length === 0) {
        // If no QR codes exist, clear the selected QR
        setSelectedQrLink(null);
        // If we were on stats tab but no QR is selected, go to my-codes tab
        if (activeTab === 'stats') {
          setActiveTab('my-codes');
        }
      } else if (selectedQrLink) {
        // Update the selected QR link with fresh data if it still exists
        const updatedSelectedQR = linksWithTotalScans.find(link => link.id === selectedQrLink.id);
        if (updatedSelectedQR) {
          setSelectedQrLink(updatedSelectedQR);
        } else {
          // If previously selected QR was deleted, select the first QR
          setSelectedQrLink(linksWithTotalScans.length > 0 ? linksWithTotalScans[0] : null);
          // If stats tab was active but QR was deleted, switch to my-codes tab
          if (activeTab === 'stats') {
            setActiveTab('my-codes');
          }
        }
      }
    } catch (error) {
      console.error('Error loading QR links:', error);
      toast({
        title: "Error Loading QR Codes",
        description: "There was a problem loading your QR codes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadQRLinks();
    }
  }, [user]);
  
  const handleQRLinkCreated = (newQRLink: QRCode) => {
    setQrLinks(prev => [newQRLink, ...prev]);
    setSelectedQrLink(newQRLink);
    setActiveTab('my-codes');
  };
  
  const handleQRLinkDeleted = async (id: string) => {
    try {
      setDeleteInProgress(true);
      
      // First check if the deleted QR was the selected one
      const wasSelected = selectedQrLink && selectedQrLink.id === id;
      
      // Remove the deleted QR from the list immediately for UI feedback
      const updatedLinks = qrLinks.filter(qr => qr.id !== id);
      setQrLinks(updatedLinks);
      
      // If the deleted QR was selected, select another one or clear selection
      if (wasSelected) {
        if (updatedLinks.length > 0) {
          setSelectedQrLink(updatedLinks[0]);
        } else {
          setSelectedQrLink(null);
          // If we were on stats tab but no QR is selected, go to my-codes tab
          if (activeTab === 'stats') {
            setActiveTab('my-codes');
          }
        }
      }
      
      // Show success message
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been successfully deleted.",
      });
      
      // Reload QR links to ensure everything is in sync
      await loadQRLinks();
    } catch (error) {
      console.error('Error during QR deletion cleanup:', error);
      toast({
        title: "Error During Cleanup",
        description: "There was an issue refreshing data after deletion.",
        variant: "destructive"
      });
    } finally {
      setDeleteInProgress(false);
    }
  };
  
  const handleQRLinkSelected = (qrLink: QRCode) => {
    setSelectedQrLink(qrLink);
    setActiveTab('stats');
  };
  
  return (
    <div className="container max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
          <p className="text-muted-foreground">Manage and track your QR codes</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New QR
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="my-codes" className="gap-2">
              My QR Codes
              {qrLinks.length > 0 && <span className="ml-1 bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">{qrLinks.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2" disabled={!selectedQrLink}>
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="my-codes">
          <Card>
            <CardHeader>
              <CardTitle>My QR Codes</CardTitle>
              <CardDescription>
                View, edit and track your QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : qrLinks.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No QR Codes Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first trackable QR code to start monitoring its performance.
                  </p>
                  <Button onClick={() => setActiveTab('create')}>Create Your First QR Code</Button>
                </div>
              ) : (
                <QRCodeList 
                  qrCodes={qrLinks} 
                  onSelect={handleQRLinkSelected}
                  onDelete={handleQRLinkDeleted}
                  selectedId={selectedQrLink?.id}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          {selectedQrLink && (
            <QRCodeStats qrCode={selectedQrLink} />
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <QRLinkCreator onSuccess={handleQRLinkCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

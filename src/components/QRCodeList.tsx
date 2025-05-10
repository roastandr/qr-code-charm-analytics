
import { QRCode } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCodeCanvas from 'qrcode.react';
import { useState } from 'react';
import { Download, MoreVertical, QrCode, Trash2, ExternalLink } from 'lucide-react';
import ReactDOM from 'react-dom';

interface QRCodeListProps {
  qrCodes: QRCode[];
  onSelect: (qrCode: QRCode) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export function QRCodeList({ qrCodes, onSelect, onDelete, selectedId }: QRCodeListProps) {
  const [qrToPreview, setQrToPreview] = useState<QRCode | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);
  
  const handlePreview = (qrCode: QRCode) => {
    setQrToPreview(qrCode);
  };
  
  const handleDeleteClick = (id: string) => {
    setQrToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    if (qrToDelete) {
      onDelete(qrToDelete);
      setDeleteConfirmOpen(false);
      setQrToDelete(null);
    }
  };
  
  const downloadQRCode = (qrCode: QRCode, format: 'svg' | 'png') => {
    // Create a temporary hidden QR code and download it
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Render the QR code
    const qrElement = document.createElement('div');
    tempContainer.appendChild(qrElement);
    
    // Use ReactDOM to render the QR code
    ReactDOM.render(
      <QRCodeCanvas
        value={qrCode.url || qrCode.target_url || ''}
        size={qrCode.size || 300}
        fgColor={qrCode.color || '#000000'}
        bgColor={qrCode.backgroundColor || qrCode.background_color || '#FFFFFF'}
        level="H"
        includeMargin
      />,
      qrElement
    );
    
    // Get the canvas element
    setTimeout(() => {
      const canvas = qrElement.querySelector('canvas');
      if (!canvas) {
        document.body.removeChild(tempContainer);
        return;
      }
      
      if (format === 'png') {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qrCode.name || 'qr-code'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For SVG, convert canvas to SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', String(qrCode.size || 300));
        svg.setAttribute('height', String(qrCode.size || 300));
        
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');
        
        const div = document.createElement('div');
        div.innerHTML = canvas.outerHTML;
        
        foreignObject.appendChild(div);
        svg.appendChild(foreignObject);
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qrCode.name || 'qr-code'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      document.body.removeChild(tempContainer);
    }, 100);
  };

  return (
    <div className="space-y-4">
      {qrCodes.map((qrCode) => (
        <Card 
          key={qrCode.id} 
          className="overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* QR Code Preview */}
              <div className="w-full sm:w-[140px] h-[140px] p-4 flex items-center justify-center bg-secondary/30">
                <QRCodeCanvas 
                  value={qrCode.url || qrCode.target_url || ''} 
                  size={100} 
                  fgColor={qrCode.color || '#000000'}
                  bgColor={qrCode.backgroundColor || qrCode.background_color || '#FFFFFF'}
                />
              </div>
              
              {/* QR Code Details */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg">{qrCode.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelect(qrCode)}>
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePreview(qrCode)}>
                          Preview QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(qrCode.url || qrCode.target_url || '', '_blank')}>
                          Open URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadQRCode(qrCode, 'png')}>
                          Download PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadQRCode(qrCode, 'svg')}>
                          Download SVG
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(qrCode.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    {qrCode.url || qrCode.target_url}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <div className="text-sm text-muted-foreground">
                      {qrCode.totalScans} scans · Created {formatDistanceToNow(new Date(qrCode.createdAt || qrCode.created_at || ''))} ago
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => onSelect(qrCode)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* QR Code Preview Dialog */}
      <Dialog open={!!qrToPreview} onOpenChange={(open) => !open && setQrToPreview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Preview</DialogTitle>
            <DialogDescription>
              {qrToPreview?.name}
            </DialogDescription>
          </DialogHeader>
          
          {qrToPreview && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="p-4 border rounded-lg" style={{ backgroundColor: qrToPreview.backgroundColor || '#FFFFFF' }}>
                <QRCodeCanvas 
                  value={qrToPreview.url} 
                  size={qrToPreview.size || 300} 
                  fgColor={qrToPreview.color || '#000000'}
                  bgColor={qrToPreview.backgroundColor || '#FFFFFF'}
                  level="H"
                  includeMargin
                />
              </div>
              
              <p className="mt-4 text-sm text-center text-muted-foreground break-all">
                {qrToPreview.url}
              </p>
            </div>
          )}
          
          <DialogFooter className="flex flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (qrToPreview) window.open(qrToPreview.url, '_blank');
              }}
              className="flex-1 sm:flex-none gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open URL
            </Button>
            <div className="flex gap-2 flex-1 sm:flex-none">
              <Button
                variant="secondary"
                onClick={() => qrToPreview && downloadQRCode(qrToPreview, 'svg')}
                className="flex-1 sm:flex-none gap-2"
              >
                <Download className="h-4 w-4" />
                SVG
              </Button>
              <Button
                onClick={() => qrToPreview && downloadQRCode(qrToPreview, 'png')}
                className="flex-1 sm:flex-none gap-2"
              >
                <Download className="h-4 w-4" />
                PNG
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this QR code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

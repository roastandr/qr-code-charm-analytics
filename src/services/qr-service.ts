
import { QRCode, QRCodeStats, ScanEvent } from '../types';

// Mock QR code database (would be replaced with real backend)
let qrCodes: QRCode[] = [];
let scanEvents: ScanEvent[] = [];

// Generate mock data for demo purposes
const initializeMockData = (userId: string) => {
  if (qrCodes.length === 0) {
    const mockQRData = [
      {
        id: 'qr-1',
        userId,
        name: 'Company Website',
        url: 'https://example.com',
        shortUrl: 'https://qr.ly/abc123',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        updatedAt: new Date().toISOString(),
        color: '#8B5CF6', // Purple color
        backgroundColor: '#FFFFFF',
        size: 300,
        totalScans: 128,
        isActive: true,
      },
      {
        id: 'qr-2',
        userId,
        name: 'Product Page',
        url: 'https://example.com/product',
        shortUrl: 'https://qr.ly/def456',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        updatedAt: new Date().toISOString(),
        color: '#6E59A5', // Dark purple
        backgroundColor: '#FFFFFF',
        size: 300,
        totalScans: 75,
        isActive: true,
      },
      {
        id: 'qr-3',
        userId,
        name: 'Special Offer',
        url: 'https://example.com/offer',
        shortUrl: 'https://qr.ly/ghi789',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updatedAt: new Date().toISOString(),
        color: '#8B5CF6',
        backgroundColor: '#F3F4F6',
        size: 300,
        totalScans: 42,
        isActive: true,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
      },
    ];
    
    qrCodes = mockQRData as QRCode[];
    
    // Generate mock scan events
    qrCodes.forEach(qr => {
      for (let i = 0; i < qr.totalScans; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const eventTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
        
        scanEvents.push({
          id: `scan-${qr.id}-${i}`,
          qrCodeId: qr.id,
          timestamp: eventTime.toISOString(),
          location: {
            country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
            city: ['New York', 'Los Angeles', 'Toronto', 'London', 'Berlin', 'Paris'][Math.floor(Math.random() * 6)],
          },
          device: {
            type: ['mobile', 'desktop', 'tablet', 'unknown'][Math.floor(Math.random() * 3)] as 'mobile' | 'desktop' | 'tablet' | 'unknown',
            browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
            os: ['iOS', 'Android', 'Windows', 'MacOS'][Math.floor(Math.random() * 4)]
          }
        });
      }
    });
  }
};

export const qrService = {
  getQRCodes: async (userId: string): Promise<QRCode[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    initializeMockData(userId);
    return qrCodes.filter(qr => qr.userId === userId);
  },
  
  getQRCode: async (id: string): Promise<QRCode | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return qrCodes.find(qr => qr.id === id);
  },
  
  createQRCode: async (userId: string, qrData: Partial<QRCode>): Promise<QRCode> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newQRCode: QRCode = {
      id: 'qr-' + Math.random().toString(36).substr(2, 9),
      userId,
      name: qrData.name || 'Untitled QR Code',
      url: qrData.url || '',
      shortUrl: `https://qr.ly/${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: qrData.color || '#8B5CF6',
      backgroundColor: qrData.backgroundColor || '#FFFFFF',
      size: qrData.size || 300,
      totalScans: 0,
      isActive: true,
      expiresAt: qrData.expiresAt,
    };
    
    qrCodes.push(newQRCode);
    return newQRCode;
  },
  
  updateQRCode: async (id: string, updates: Partial<QRCode>): Promise<QRCode> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = qrCodes.findIndex(qr => qr.id === id);
    if (index === -1) {
      throw new Error('QR code not found');
    }
    
    const updatedQR = {
      ...qrCodes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    qrCodes[index] = updatedQR;
    return updatedQR;
  },
  
  deleteQRCode: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    qrCodes = qrCodes.filter(qr => qr.id !== id);
    scanEvents = scanEvents.filter(event => event.qrCodeId !== id);
  },
  
  recordScan: async (qrCodeId: string, scanData: Partial<ScanEvent>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const qrIndex = qrCodes.findIndex(qr => qr.id === qrCodeId);
    if (qrIndex === -1) return;
    
    // Record scan event
    const newScan: ScanEvent = {
      id: `scan-${Math.random().toString(36).substr(2, 9)}`,
      qrCodeId,
      timestamp: new Date().toISOString(),
      ...scanData
    };
    
    scanEvents.push(newScan);
    
    // Update total scans count
    qrCodes[qrIndex].totalScans += 1;
  },
  
  getQRCodeStats: async (qrCodeId: string): Promise<QRCodeStats> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const qrScans = scanEvents.filter(scan => scan.qrCodeId === qrCodeId);
    
    // Process data for stats
    const totalScans = qrScans.length;
    
    // Daily scans for the last 30 days
    const dailyScans: { date: string, count: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = qrScans.filter(scan => {
        const scanDate = new Date(scan.timestamp).toISOString().split('T')[0];
        return scanDate === dateStr;
      }).length;
      
      dailyScans.unshift({ date: dateStr, count });
    }
    
    // Device breakdown
    const deviceCounts = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      unknown: 0
    };
    
    qrScans.forEach(scan => {
      if (scan.device?.type) {
        deviceCounts[scan.device.type] += 1;
      } else {
        deviceCounts.unknown += 1;
      }
    });
    
    // Top locations
    const locationMap = new Map<string, number>();
    qrScans.forEach(scan => {
      if (scan.location?.country) {
        const count = locationMap.get(scan.location.country) || 0;
        locationMap.set(scan.location.country, count + 1);
      }
    });
    
    const topLocations = Array.from(locationMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalScans,
      dailyScans,
      deviceBreakdown: deviceCounts,
      topLocations
    };
  }
};

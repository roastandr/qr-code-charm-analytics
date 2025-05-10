
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface QRCode {
  id: string;
  userId: string;
  name: string;
  url: string;
  shortUrl?: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  logo?: string;
  totalScans: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface ScanEvent {
  id: string;
  qrCodeId: string;
  timestamp: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  device?: {
    type: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    browser?: string;
    os?: string;
  };
  referrer?: string;
}

export interface QRCodeStats {
  totalScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  topLocations: {
    country: string;
    count: number;
  }[];
}

export interface UserStats {
  totalQRCodes: number;
  totalScans: number;
  avgScansPerQR: number;
}

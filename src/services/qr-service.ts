import { supabase } from "@/integrations/supabase/client";
import { QRCode, QRCodeStats, ScanEvent } from '@/types';
import { nanoid } from 'nanoid';

// Helper function to transform database rows to QRCode format
const transformDbRowToQRCode = (row: any): QRCode => {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    url: row.target_url,
    target_url: row.target_url,
    slug: row.slug,
    shortUrl: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    color: row.color,
    backgroundColor: row.background_color,
    isActive: row.is_active,
    expiresAt: row.expires_at,
    totalScans: 0, // Will be populated separately if needed
    // Keep all original fields too for compatibility
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    background_color: row.background_color,
    is_active: row.is_active,
    expires_at: row.expires_at
  };
};

export const qrService = {
  // Get all QR links for the current user
  getQRLinks: async (): Promise<QRCode[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase
      .from('qr_links')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching QR links:', error);
      throw error;
    }
    
    return (data || []).map(transformDbRowToQRCode);
  },
  
  // Get a single QR link by ID
  getQRLink: async (id: string): Promise<QRCode> => {
    const { data, error } = await supabase
      .from('qr_links')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching QR link:', error);
      throw error;
    }
    
    return transformDbRowToQRCode(data);
  },
  
  // Create a new QR link
  createQRLink: async (qrData: { name: string; target_url: string; slug?: string; color?: string; background_color?: string; }): Promise<QRCode> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Not authenticated');
    }
    
    // Generate a random slug if not provided
    const slug = qrData.slug || nanoid(8);
    
    const { data, error } = await supabase
      .from('qr_links')
      .insert([
        { 
          user_id: session.session.user.id,
          name: qrData.name,
          slug,
          target_url: qrData.target_url,
          color: qrData.color || '#8B5CF6',
          background_color: qrData.background_color || '#FFFFFF'
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating QR link:', error);
      if (error.code === '23505') { // Unique violation
        throw new Error('This slug is already taken. Please choose another one.');
      }
      throw error;
    }
    
    return transformDbRowToQRCode(data);
  },
  
  // For backward compatibility with existing code
  createQRCode: async (userId: string, qrCodeData: { name: string; url: string; color?: string; backgroundColor?: string; size?: number; }) => {
    return qrService.createQRLink({
      name: qrCodeData.name,
      target_url: qrCodeData.url,
      color: qrCodeData.color,
      background_color: qrCodeData.backgroundColor
    });
  },
  
  // Update an existing QR link
  updateQRLink: async (id: string, updates: Partial<QRCode>): Promise<QRCode> => {
    // Convert from frontend format to database format
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.target_url) dbUpdates.target_url = updates.target_url;
    if (updates.url) dbUpdates.target_url = updates.url;
    if (updates.slug) dbUpdates.slug = updates.slug;
    if (updates.shortUrl) dbUpdates.slug = updates.shortUrl;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.backgroundColor) dbUpdates.background_color = updates.backgroundColor;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.expiresAt) dbUpdates.expires_at = updates.expiresAt;
    
    const { data, error } = await supabase
      .from('qr_links')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating QR link:', error);
      if (error.code === '23505') { // Unique violation
        throw new Error('This slug is already taken. Please choose another one.');
      }
      throw error;
    }
    
    return transformDbRowToQRCode(data);
  },
  
  // Delete a QR link
  deleteQRLink: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('qr_links')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting QR link:', error);
      throw error;
    }
  },
  
  // Get statistics for a QR link
  getQRCodeStats: async (id: string): Promise<QRCodeStats> => {
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('qr_link_id', id);
      
    if (error) {
      console.error('Error fetching QR link scans:', error);
      throw error;
    }
    
    // Process data for stats
    const totalScans = scans.length;
    
    // Daily scans for the last 30 days
    const dailyScans: { date: string, count: number }[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = scans.filter(scan => {
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
    
    scans.forEach(scan => {
      if (scan.device_type) {
        deviceCounts[scan.device_type as keyof typeof deviceCounts] += 1;
      } else {
        deviceCounts.unknown += 1;
      }
    });
    
    // Top locations
    const locationMap = new Map<string, number>();
    scans.forEach(scan => {
      if (scan.country) {
        const count = locationMap.get(scan.country) || 0;
        locationMap.set(scan.country, count + 1);
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
  },
  
  // Subscribe to real-time scan events
  subscribeToScans: (qrLinkId: string, callback: (scan: ScanEvent) => void) => {
    return supabase
      .channel(`scans:${qrLinkId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'scans',
          filter: `qr_link_id=eq.${qrLinkId}`
        }, 
        payload => {
          callback(payload.new as ScanEvent);
        }
      )
      .subscribe();
  }
};

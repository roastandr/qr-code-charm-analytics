
import { supabase } from "@/integrations/supabase/client";

export interface TrackingResult {
  success: boolean;
  url?: string;
  name?: string;
  error?: string;
}

export const redirectService = {
  // Track a scan when QR code is accessed via short URL
  trackAndRedirect: async (shortCode: string): Promise<TrackingResult> => {
    try {
      console.log(`Processing redirect for code: ${shortCode}`);
      
      // First, get the QR link from the slug
      const { data: qrLink, error: qrError } = await supabase
        .rpc('get_qr_link_by_slug', { slug_param: shortCode });
      
      if (qrError) {
        console.error('QR code lookup error:', qrError);
        return { success: false, error: 'QR code not found' };
      }
      
      if (!qrLink || qrLink.length === 0) {
        console.error('QR code not found for slug:', shortCode);
        return { success: false, error: 'QR code not found' };
      }
      
      const link = qrLink[0];
      console.log('Found QR link:', link);
      
      if (!link.is_active) {
        return { success: false, error: 'QR code is inactive' };
      }
      
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return { success: false, error: 'QR code has expired' };
      }
      
      // Get device info
      const deviceType = detectDeviceType();
      const browserInfo = detectBrowserInfo();
      const osInfo = detectOSInfo();
      
      // Create a unique scan key that includes only the date and hour to prevent duplicate tracking
      // within the same hour, but still allow for tracking multiple scans on different hours of the day
      const now = new Date();
      const scanKey = `scan_${shortCode}_${now.toISOString().substring(0, 13)}`; // Format: 2023-05-10T15
      const recentlySeen = sessionStorage.getItem(scanKey);
      
      if (!recentlySeen) {
        // Record the scan only if not recently seen in this session
        try {
          await supabase.rpc('record_scan', {
            qr_link_id_param: link.id,
            device_type_param: deviceType,
            browser_param: browserInfo,
            os_param: osInfo,
            referrer_param: document.referrer || null,
            // Try to get location data if possible
            country_param: null,
            city_param: null,
            latitude_param: null,
            longitude_param: null
          });
          
          // Set the session storage to prevent duplicate tracking for this hour
          sessionStorage.setItem(scanKey, 'true');
          
          console.log(`Recorded scan for ${shortCode} at ${now.toISOString()}`);
        } catch (error) {
          console.error('Error recording scan:', error);
          // Continue with redirect even if tracking fails
        }
      } else {
        console.log(`Duplicate scan prevented for ${shortCode} within the same hour`);
      }
      
      // Get the name for display purposes
      const { data: qrDetails } = await supabase
        .from('qr_links')
        .select('name')
        .eq('id', link.id)
        .single();
      
      return { 
        success: true, 
        url: link.target_url,
        name: qrDetails?.name
      };
    } catch (error) {
      console.error('Error during redirect:', error);
      return { success: false, error: 'An error occurred during redirect' };
    }
  }
};

// Helper functions to detect device information
function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check if mobile
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))) {
    return 'mobile';
  }
  
  // Check if tablet
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  // Otherwise assume desktop
  return 'desktop';
}

function detectBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    return 'Samsung Browser';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else {
    return 'Unknown';
  }
}

function detectOSInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (/Windows NT 10.0/i.test(userAgent)) {
    return 'Windows 10';
  } else if (/Windows NT 6.3/i.test(userAgent)) {
    return 'Windows 8.1';
  } else if (/Windows NT 6.2/i.test(userAgent)) {
    return 'Windows 8';
  } else if (/Windows NT 6.1/i.test(userAgent)) {
    return 'Windows 7';
  } else if (/Windows NT 6.0/i.test(userAgent)) {
    return 'Windows Vista';
  } else if (/Windows NT 5.1/i.test(userAgent)) {
    return 'Windows XP';
  } else if (/Windows NT 5.0/i.test(userAgent)) {
    return 'Windows 2000';
  } else if (/Mac/i.test(userAgent)) {
    return 'MacOS';
  } else if (/Linux/i.test(userAgent)) {
    return 'Linux';
  } else if (/Android/i.test(userAgent)) {
    return 'Android';
  } else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  } else {
    return 'Unknown';
  }
}

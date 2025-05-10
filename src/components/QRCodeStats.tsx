import { useEffect, useState } from 'react';
import { QRCode, QRCodeStats as QRStats } from '@/types';
import { qrService } from '@/services/qr-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';

interface QRCodeStatsProps {
  qrCode: QRCode;
}

export function QRCodeStats({ qrCode }: QRCodeStatsProps) {
  const [stats, setStats] = useState<QRStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const qrStats = await qrService.getQRCodeStats(qrCode.id);
        setStats(qrStats);
      } catch (error) {
        console.error('Failed to load QR code stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [qrCode.id]);
  
  // Colors for the pie chart
  const COLORS = ['#8B5CF6', '#6E59A5', '#D6BCFA', '#E9D5FF'];
  
  // Format date for charts
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d');
  };
  
  const renderDeviceIcon = (type: string) => {
    switch(type) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics Unavailable</CardTitle>
          <CardDescription>
            We couldn't load the statistics for this QR code. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Process data for device breakdown pie chart
  const deviceData = [
    { name: 'Mobile', value: stats.deviceBreakdown.mobile, color: COLORS[0] },
    { name: 'Desktop', value: stats.deviceBreakdown.desktop, color: COLORS[1] },
    { name: 'Tablet', value: stats.deviceBreakdown.tablet, color: COLORS[2] },
    { name: 'Unknown', value: stats.deviceBreakdown.unknown, color: COLORS[3] }
  ].filter(item => item.value > 0);
  
  // Get today's scans
  const today = new Date().toISOString().split('T')[0];
  const todayScans = stats.dailyScans.find(day => day.date === today)?.count || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Scans</CardDescription>
            <CardTitle className="text-3xl">{stats.totalScans}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Scans</CardDescription>
            <CardTitle className="text-3xl">{todayScans}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Location</CardDescription>
            <CardTitle className="text-xl">
              {stats.topLocations.length > 0 ? stats.topLocations[0].country : 'No data'}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Used Device</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {deviceData.length > 0 && (
                <>
                  {renderDeviceIcon(deviceData.sort((a, b) => b.value - a.value)[0].name.toLowerCase())}
                  <span>{deviceData.sort((a, b) => b.value - a.value)[0].name}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily Scans</TabsTrigger>
          <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Scan Activity</CardTitle>
              <CardDescription>
                Number of scans over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.dailyScans}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval={Math.floor(stats.dailyScans.length / 6)}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} scans`, 'Scans']}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
              <CardDescription>
                Breakdown of devices used to scan your QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderDeviceIcon(device.name.toLowerCase())}
                        <span>{device.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{device.value} scans</span>
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ 
                              width: `${(device.value / stats.totalScans) * 100}%`, 
                              backgroundColor: device.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>
                Countries where your QR code has been scanned the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topLocations}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="country" 
                      type="category"
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} scans`, 'Scans']}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                      {stats.topLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

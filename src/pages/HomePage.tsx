
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/Header';
import { Button } from "@/components/ui/button";
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QrCode, BarChart3, Smartphone, Link } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 qr-grid-bg">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-dark-purple">
                  Create & Track Beautiful QR Codes
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Generate custom QR codes for your business or personal use. Track scans, analyze data, and optimize your campaigns.
                </p>
                <div className="flex flex-wrap gap-4">
                  {user ? (
                    <Button asChild size="lg">
                      <RouterLink to="/dashboard">Go to Dashboard</RouterLink>
                    </Button>
                  ) : (
                    <Button asChild size="lg">
                      <RouterLink to="/login">Get Started</RouterLink>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" asChild>
                    <RouterLink to="/dashboard">View Features</RouterLink>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-light-purple/20 to-transparent blur-3xl rounded-3xl transform -rotate-6 -z-10"></div>
                <div className="bg-white border rounded-xl shadow-lg p-6 transform transition-transform duration-500 hover:scale-[1.01]">
                  <img 
                    src="https://placehold.co/600x400/f5f3ff/8B5CF6?text=QR+Tracker+Demo"
                    alt="QR Code Dashboard Preview" 
                    className="rounded-lg w-full aspect-[4/3] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful QR Code Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground mx-auto max-w-3xl">
                Everything you need to create, manage, and track your QR codes
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Beautiful QR Codes</h3>
                <p className="text-muted-foreground">
                  Customize colors, size, and design to match your brand. Download in high-quality formats.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Analytics</h3>
                <p className="text-muted-foreground">
                  Track scans with detailed insights. View performance metrics and engagement data.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Link className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Redirects</h3>
                <p className="text-muted-foreground">
                  Redirect users to your intended URL while tracking every visit automatically.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Device Detection</h3>
                <p className="text-muted-foreground">
                  Identify device types, browsers, and operating systems used to scan your QR codes.
                </p>
              </div>
              
              {/* More features */}
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border sm:col-span-2 lg:col-span-2">
                <h3 className="text-xl font-bold mb-2">And Much More...</h3>
                <p className="text-muted-foreground mb-4">
                  Geographic heatmaps, user management, bulk generation, scheduled expiration, and API access.
                </p>
                <Button asChild variant="outline">
                  <RouterLink to="/dashboard">Explore All Features</RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Try It Section */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Try It Now
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Create your first QR code in seconds, no account required
              </p>
            </div>
            
            <QRCodeGenerator />
          </div>
        </section>
      </main>
      
      <footer className="border-t bg-background">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <QrCode className="h-5 w-5" />
              <span className="font-semibold">QR Tracker</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} QR Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

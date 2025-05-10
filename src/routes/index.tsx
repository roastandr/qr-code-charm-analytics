
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "../components/ThemeProvider";

// Create a new query client
const queryClient = new QueryClient();

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // If someone accesses /index directly, redirect them to homepage
    if (location.pathname.toLowerCase() === '/index') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="qrtrakr-theme">
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Outlet />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;

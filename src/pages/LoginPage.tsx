
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@/components/Auth';
import { Header } from '@/components/Header';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <Auth onSuccess={handleAuthSuccess} />
      </main>
    </div>
  );
}

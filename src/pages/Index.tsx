
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // If someone accesses /index directly, redirect them to homepage
    if (window.location.pathname.toLowerCase() === '/index') {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  
  // Render the HomePage component directly
  return <HomePage />;
};

export default Index;

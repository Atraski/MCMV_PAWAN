import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, saveToken } from '../services/api';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      console.error('Google OAuth error:', error);
      navigate('/', { 
        state: { 
          error: 'Google authentication failed. Please try again.' 
        } 
      });
      return;
    }

    const handleAuth = async () => {
      if (token) {
        // Save token
        saveToken(token);
        
        // Fetch user data and update auth context
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.user) {
            login(response.user, token);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        
        // Redirect to specified URL or dashboard
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboard';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl, { 
          replace: true,
          state: { 
            success: 'Successfully signed in!' 
          } 
        });
      } else {
        // No token found
        navigate('/', { 
          state: { 
            error: 'Authentication failed. No token received.' 
          } 
        });
      }
    };

    handleAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8DC] to-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
        </div>
        <p className="text-gray-700 text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;



import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogleResponse } = useAuth();

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const error = searchParams.get('error');

    if (error) {
      toast.error(
        error === 'account_conflict_or_disabled'
          ? 'Use your existing AGROBUS password or contact an administrator.'
          : 'Google sign-in failed. Please try again.',
        {
          id: 'google-oauth-error',
        }
      );

      navigate('/login', { replace: true });
      return;
    }

    const values = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const token = values.get('token');
    const email = values.get('email');
    const fullName = values.get('fullName');
    const role = values.get('role');
    const userId = Number(values.get('userId'));
    const pictureUrl = values.get('pictureUrl') || undefined;

    if (
      !token ||
      !email ||
      !fullName ||
      !role ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      toast.error('Invalid Google sign-in response.', {
        id: 'google-oauth-error',
      });

      navigate('/login', { replace: true });
      return;
    }

    toast.dismiss('google-oauth-error');

    loginWithGoogleResponse({
      token,
      email,
      fullName,
      role,
      userId,
      pictureUrl,
      phone: undefined,
    });

    navigate('/dashboard', { replace: true });
  }, [loginWithGoogleResponse, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2
        className="w-8 h-8 animate-spin text-green-600"
        aria-label="Signing in"
      />
    </div>
  );
}
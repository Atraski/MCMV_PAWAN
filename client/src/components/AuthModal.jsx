import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, saveToken } from '../services/api';

const AuthModal = ({ isOpen, onClose, redirectAfterLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authStep, setAuthStep] = useState('initial'); // 'initial', 'email', 'mobile', 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign in and sign up
  const [isNewUser, setIsNewUser] = useState(false); // Track if user is new (for OTP flow)

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setAuthStep('initial');
    setMobileNumber('');
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setSignUpMobile('');
    setOtp('');
    setIsLoading(false);
    setError('');
    setIsSignUp(false);
    setIsNewUser(false);
    onClose();
  };

  const handleBackToInitial = () => {
    setAuthStep('initial');
    setMobileNumber('');
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setSignUpMobile('');
    setOtp('');
    setError('');
    setIsSignUp(false);
    setIsNewUser(false);
  };

  const handleEmailSignIn = () => {
    setAuthStep('email');
    setIsSignUp(false);
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!name || name.trim().length < 2) {
        setError('Please enter a valid name (at least 2 characters)');
        return;
      }
      if (!signUpMobile) {
        setError('Please enter your mobile number');
        return;
      }
      if (!/^\d{10}$/.test(signUpMobile)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isSignUp) {
        // Register
        response = await authAPI.register(
          name.trim(),
          email.trim().toLowerCase(),
          password,
          signUpMobile
        );
      } else {
        // Login
        response = await authAPI.login(email.trim().toLowerCase(), password);
      }

      if (response.success && response.token) {
        saveToken(response.token);
        // Update auth context with user data
        if (response.user) {
          login(response.user, response.token);
        }
        handleClose();
        // Redirect to specified URL or dashboard
        const redirectUrl = redirectAfterLogin || localStorage.getItem('redirectAfterLogin') || '/dashboard';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileContinue = async () => {
    if (!isValidMobileNumber) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.sendMobileOTP(mobileNumber);
      if (response.success) {
        setIsNewUser(response.isNewUser || false);
        setAuthStep('otp');
        // In development, show OTP in console if available
        if (response.otp) {
          console.log('OTP (dev only):', response.otp);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyMobileOTP(mobileNumber, otp);
      if (response.success && response.token) {
        saveToken(response.token);
        // Update auth context with user data
        if (response.user) {
          login(response.user, response.token);
        }
        handleClose();
        // Redirect to specified URL or dashboard
        const redirectUrl = redirectAfterLogin || localStorage.getItem('redirectAfterLogin') || '/dashboard';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await handleMobileContinue();
  };

  // Validate mobile number - must be exactly 10 digits
  const isValidMobileNumber = /^\d{10}$/.test(mobileNumber);

  // Handle mobile number input - only allow digits, max 10
  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  };

  // Handle signup mobile input
  const handleSignUpMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setSignUpMobile(value);
      setError('');
    }
  };

  const isValidSignUpMobile = /^\d{10}$/.test(signUpMobile);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {/* Back Button - Show when not on initial step */}
          {authStep !== 'initial' && (
            <button
              onClick={handleBackToInitial}
              className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            {authStep === 'email' && (isSignUp ? 'Create Account' : 'Sign In')}
            {authStep === 'otp' && 'Verify Mobile Number'}
            {authStep === 'initial' && 'Get Started'}
          </h2>

          {/* Initial View - All Options */}
          {authStep === 'initial' && (
            <>
              {/* Email Button - Primary Authentication Method */}
              <div className="space-y-3 sm:space-y-4 mb-6">
                <button 
                  onClick={handleEmailSignIn}
                  className="w-full bg-[#FFD700] hover:bg-[#FFC700] border border-[#FFD700] rounded-lg py-3 px-4 flex items-center justify-center gap-3 transition-colors shadow-lg transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 font-medium text-sm sm:text-base">Continue with Email</span>
                </button>
              </div>

              {/* OR Separator */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Mobile Number Input */}
              <div className="mb-6">
                <div 
                  className="flex items-center border-b border-gray-300 pb-2 cursor-text"
                  onClick={() => {
                    document.querySelector('#mobile-input')?.focus();
                  }}
                >
                  <span className="text-2xl mr-2">🇮🇳</span>
                  <span className="text-gray-700 font-medium mr-2">+91</span>
                  <input
                    id="mobile-input"
                    type="tel"
                    value={mobileNumber}
                    onChange={handleMobileNumberChange}
                    placeholder="Continue with mobile number"
                    maxLength={10}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base bg-transparent"
                  />
                </div>
              </div>

              {/* Continue Button - Shows when mobile input has value */}
              {mobileNumber && (
                <button 
                  onClick={handleMobileContinue}
                  disabled={!isValidMobileNumber}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 mb-4 ${
                    isValidMobileNumber
                      ? 'bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 shadow-lg transform hover:scale-[1.02] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              )}

              {/* Terms & Conditions */}
              <p className="text-xs sm:text-sm text-gray-600 text-center mt-6">
                I agree to the{' '}
                <a href="/terms" className="underline hover:text-gray-900">Terms & Conditions</a>
                {' '}&{' '}
                <a href="/privacy" className="underline hover:text-gray-900">Privacy Policy</a>
              </p>
            </>
          )}


          {/* Email Sign In View */}
          {authStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">+91</span>
                    <input
                      type="tel"
                      value={signUpMobile}
                      onChange={handleSignUpMobileChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      pattern="\d{10}"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    />
                  </div>
                  {signUpMobile && !isValidSignUpMobile && (
                    <p className="mt-1 text-xs text-red-500">Enter a valid 10-digit number</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-[#FFD700] hover:underline">Forgot password?</a>
                </div>
              )}

              <button 
                type="submit"
                disabled={
                  isLoading || 
                  !email || 
                  !password || 
                  (isSignUp && (!name || !confirmPassword || !signUpMobile || !isValidSignUpMobile))
                }
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 ${
                  !isLoading && email && password && (!isSignUp || (name && confirmPassword && signUpMobile && isValidSignUpMobile))
                    ? 'bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 shadow-lg transform hover:scale-[1.02] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
              
              <p className="text-center text-sm text-gray-600">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setName('');
                    setConfirmPassword('');
                    setSignUpMobile('');
                  }}
                  className="text-[#FFD700] hover:underline font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </form>
          )}

          {/* OTP Verification View */}
          {authStep === 'otp' && (
            <div className="space-y-6">
              {isLoading && !otp ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
                  </div>
                  <p className="text-gray-600">Sending OTP to +91 {mobileNumber}...</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">We've sent a verification code to</p>
                    <p className="text-gray-900 font-semibold">+91 {mobileNumber}</p>
                    {isNewUser && (
                      <p className="text-sm text-[#FFD700] mt-2 font-medium">
                        New user? Your account will be created after verification.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                          setError('');
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-center text-2xl tracking-widest"
                    />
                  </div>
                  <button 
                    onClick={handleOTPVerify}
                    disabled={otp.length !== 6 || isLoading}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 ${
                      otp.length === 6 && !isLoading
                        ? 'bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 shadow-lg transform hover:scale-[1.02] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    <button 
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-[#FFD700] hover:underline font-medium text-sm disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';
import googleIcon from '../../assets/icons/google.svg';

const LoginModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle, signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle email + password login (or signup if new user)
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // First try to sign in
      const { error: signInError } = await signIn({
        email,
        password,
      });

      // If login fails, try to register the user
      if (signInError) {
        console.log("Sign in failed, attempting signup:", signInError.message);
        
        const { error: signUpError, data } = await signUp({
          email,
          password,
          options: {
            data: {
              email_confirmed: true // Additional user metadata
            }
          }
        });

        // If signup also fails, show error
        if (signUpError) {
          // Show a more user-friendly error message
          if (signUpError.message.includes('Password should be at least')) {
            throw new Error('Password must be at least 6 characters long');
          } else if (signUpError.message.includes('Email already registered')) {
            throw new Error('This email is registered but the password is incorrect');
          } else {
            throw signUpError;
          }
        } else if (data?.user) {
          // Signup successful
          console.log("New user created:", data.user);
          // Continue to sign in the newly created user
          const { error: newSignInError } = await signIn({
            email,
            password,
          });
          
          if (newSignInError) throw newSignInError;
        }
      }

      onClose(); // Close modal on success
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;
      alert('Check your email for a password reset link');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sign in / Sign up</h2>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <div className="text-right">
            <button type="button" className="forgot-password-btn" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="primary-button"
            disabled={loading}
          >
            Continue with Email
          </button>
        </form>
        
        <div className="divider">
          <span>Or</span>
        </div>
        
        <button 
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img src={googleIcon} alt="Google" className="google-icon" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginModal; 
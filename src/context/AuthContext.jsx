import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { auth, googleProvider, signInWithPopup } from '../firebase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('job_tracker_user');
    const storedToken = localStorage.getItem('job_tracker_token');
    const storedLocation = localStorage.getItem('job_tracker_location');

    if (storedUser && storedUser !== 'undefined' && storedToken && storedToken !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setUserLocation(storedLocation || 'Remote');
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        // Clean up if corrupt
        localStorage.removeItem('job_tracker_user');
        localStorage.removeItem('job_tracker_token');
        localStorage.removeItem('job_tracker_location');
      }
    }
    setIsLoading(false);
  }, []);

  const registerUser = async (userData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { user: newUser, token: newToken, location } = response.data;
      
      setUser(newUser);
      setToken(newToken);
      setUserLocation(location || 'Remote');

      // Persist in localStorage
      localStorage.setItem('job_tracker_user', JSON.stringify(newUser));
      localStorage.setItem('job_tracker_token', newToken);
      localStorage.setItem('job_tracker_location', location || 'Remote');
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data?.msg || 'Registration failed';
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (userData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', userData);
      const { user: existingUser, token: newToken, location } = response.data;

      setUser(existingUser);
      setToken(newToken);
      setUserLocation(location || 'Remote');

      // Persist in localStorage
      localStorage.setItem('job_tracker_user', JSON.stringify(existingUser));
      localStorage.setItem('job_tracker_token', newToken);
      localStorage.setItem('job_tracker_location', location || 'Remote');
      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data?.msg || 'Login failed';
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const response = await api.post('/auth/google', {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        googleId: firebaseUser.uid,
        idToken,
      });

      const { user: newUser, token: newToken, location } = response.data;
      setUser(newUser);
      setToken(newToken);
      setUserLocation(location || 'Remote');

      localStorage.setItem('job_tracker_user', JSON.stringify(newUser));
      localStorage.setItem('job_tracker_token', newToken);
      localStorage.setItem('job_tracker_location', location || 'Remote');

      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error('Google Sign-In Error:', error);
      throw error.response?.data?.msg || error.message || 'Google Sign-In failed';
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async ({ email, otp }) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      const { user: newUser, token: newToken, location } = response.data;

      if (newToken && newUser) {
        setUser(newUser);
        setToken(newToken);
        setUserLocation(location || 'Remote');

        localStorage.setItem('job_tracker_user', JSON.stringify(newUser));
        localStorage.setItem('job_tracker_token', newToken);
        localStorage.setItem('job_tracker_location', location || 'Remote');
      }

      return response.data;
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data?.msg || 'Verification failed';
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'Failed to resend code';
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'Failed to send password reset code';
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'Failed to reset password';
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setUserLocation('');
    
    // Clear localStorage
    localStorage.removeItem('job_tracker_user');
    localStorage.removeItem('job_tracker_token');
    localStorage.removeItem('job_tracker_location');
  };

  const updateUser = async (userData) => {
    setIsLoading(true);
    try {
      const response = await api.patch('/auth/updateUser', userData);
      const { user: updatedUser, token: newToken, location } = response.data;

      setUser(updatedUser);
      setToken(newToken);
      setUserLocation(location || 'Remote');

      localStorage.setItem('job_tracker_user', JSON.stringify(updatedUser));
      localStorage.setItem('job_tracker_token', newToken);
      localStorage.setItem('job_tracker_location', location || 'Remote');
    } catch (error) {
      setIsLoading(false);
      throw error.response?.data?.msg || 'Profile update failed';
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/auth/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { user: updatedUser } = response.data;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('job_tracker_user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'Resume upload failed';
    }
  };

  const deleteResume = async () => {
    try {
      const response = await api.delete('/auth/delete-resume');
      const { user: updatedUser } = response.data;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('job_tracker_user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'Failed to delete resume';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userLocation,
        isLoading,
        registerUser,
        loginUser,
        googleSignIn,
        verifyEmail,
        resendOTP,
        forgotPassword,
        resetPassword,
        logoutUser,
        updateUser,
        uploadResume,
        deleteResume,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

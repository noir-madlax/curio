import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import LoginModal from '../../auth/LoginModal';
import './Sidebar.css';
import unloginIcon from '../../../assets/icons/unlogin_icon.svg';
import defaultAvatarIcon from '../../../assets/icons/avatar_default_icon.svg';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle logout
  const handleLogout = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      setLoading(true);
      const { error } = await signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // User information component when logged in
  const UserInfo = () => {
    const userEmail = user?.email || '';
    // Check if user has a profile image
    const userImage = user?.user_metadata?.avatar_url;

    return (
      <div className="user-profile">
        {userImage ? (
          <img src={userImage} alt={userEmail} className="user-avatar-img" />
        ) : (
          <img src={defaultAvatarIcon} alt="User" className="user-avatar-img" />
        )}
        <div className="user-info">
          <p className="user-email">{userEmail}</p>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  };

  // Login prompt when not logged in
  const LoginPrompt = () => (
    <div className="user-profile not-logged-in" onClick={() => setShowLoginModal(true)}>
      <img src={unloginIcon} alt="Sign In" className="user-avatar-icon" />
      <div className="user-info">
        <p className="login-prompt">Sign In</p>
      </div>
    </div>
  );

  return (
    <>
      {user ? <UserInfo /> : <LoginPrompt />}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default UserProfile; 
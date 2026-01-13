import React from 'react';
import { logoutUser } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      alert('Logged out');
      navigate('/login');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;

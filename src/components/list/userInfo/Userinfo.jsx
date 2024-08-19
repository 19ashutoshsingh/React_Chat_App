import React from 'react'
import "./userInfo.css"
import { auth } from '../../../lib/firebase';
import { useUserStore } from '../../../lib/userStore'
import { arrayRemove, arrayUnion, updateDoc, doc, deleteField, getDoc  } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useNavigate } from 'react-router-dom';

function Userinfo() {

  const {currentUser, clearUser } = useUserStore()
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out successfully');
        clearUser();  // Clear the user state
        navigate('/login'); // Redirect to the login page
        // You can also redirect the user or perform other actions here
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <div className='userInfo'>
      <div className='user'>
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className='icons'>
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./logout.png" alt="" onClick={handleLogout}/>
      </div>
    </div>
  )
}

export default Userinfo

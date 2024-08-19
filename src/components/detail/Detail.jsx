import React from 'react'
import "./detail.css"
import { auth } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, updateDoc, doc, deleteField, getDoc  } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function Detail() {

  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, clearChatWithUser} = useChatStore()
  const { currentUser, clearUser } = useUserStore()
  const navigate = useNavigate(); // Initialize useNavigate


  const handleBlock = async ()=> {
    if(!user) return
    const userDocRef = doc(db, "users", currentUser.id)

    try{
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id): arrayUnion(user.id),
      })
      changeBlock()
    }catch(err){
      console.log(err)
    }
  }

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

  const handleClearChats = async () => {
    if (!user) return;

    // Implement your logic to clear chats with the specific user
    try {
      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsDoc = await getDoc(userChatsRef);
      const chats = userChatsDoc.data().chats;

      // Filter out chats with the specific user
      const updatedChats = chats.filter(chat => chat.receiverId !== user.id);

      await updateDoc(userChatsRef, {
        chats: updatedChats,
      });

      clearChatWithUser(); // Clear chat state in your store
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className='detail'>
      <div className='user'>
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Alone But Happy 🥹</p>
      </div>
      <div className='info'>
        <div className='options'>
          <div className='title'>
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className='options'>
          <div className='title'>
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className='options'>
          <div className='title'>
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className='photos'>
            <div className='photoItem'>
              <div className='photoDetails'>
                <img src="https://images.pexels.com/photos/27000784/pexels-photo-27000784/free-photo-of-three-men-are-pulling-a-net-on-the-beach.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className='icon' />
            </div>
            <div className='photoItem'>
              <div className='photoDetails'>
                <img src="https://images.pexels.com/photos/27000784/pexels-photo-27000784/free-photo-of-three-men-are-pulling-a-net-on-the-beach.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                <span>photo_2024.png</span>
              </div>
              <img src="./download.png" alt="" className='icon' />
            </div>
            {/* <img src="./download.png" alt="" /> */}
          </div>
        </div>
        <div className='options'>
          <div className='title'>
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" className='icon' />
          </div>
        </div>
        <button onClick={handleBlock}>
        {isCurrentUserBlocked? "You are Blocked": isReceiverBlocked? "User Blocked": "Block User"}
        </button>
        <button onClick={handleClearChats} className='clear'>Clear All Chats</button> {/* Add this button */}

        <button className='logout' onClick={handleLogout}>Log out</button>
      </div>
    </div>
  )
}

export default Detail

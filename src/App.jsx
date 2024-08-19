import { useEffect } from 'react';
import './App.css'
import Chat from './components/chat/Chat'
import Detail from './components/detail/Detail'
import List from './components/list/List'
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';

function App() {
  // const user = false;
  const {currentUser, isLoading, fetchUserInfo, setLoading } = useUserStore()
  const {chatId} = useChatStore()

  useEffect(()=>{
    const unSub = onAuthStateChanged(auth,(user)=>{
      console.log("Auth state changed:",user)
      // fetchUserInfo(user.uid)
      if (user) {
        fetchUserInfo(user.uid);
        //(removed ? from after user)
      } else {
        setLoading(false);
      }
    })
    return () =>{
      unSub()
    }
  },[fetchUserInfo, setLoading])
  console.log(currentUser)

  if(isLoading) return <div className='loading'>Loading...</div>

  return (
    <div className='container'>
      {
        currentUser ? (
          <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
          </>
        ):(
          <Login />
        )
      }
      <Notification />
      
    </div>
  )
}

export default App

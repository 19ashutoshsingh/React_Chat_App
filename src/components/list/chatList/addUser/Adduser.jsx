import React, { useState } from 'react'
import './addUser.css'
import {collection, query, where, getDocs, serverTimestamp, arrayUnion, updateDoc, doc, setDoc } from "firebase/firestore"
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';

function Adduser() {
  const [user, setUser] = useState(null)

  const {currentUser} = useUserStore()
  
  const handleSearch = async (e)=>{
    e.preventDefault()
    if (e.target instanceof HTMLFormElement) {
      const formData = new FormData(e.target)
      const username = formData.get("username")

      try{
        const userRef = collection(db, "users")
        // create a query against the collections.
        const q = query(userRef, where("username", "==", username))

        const querySnapShot = await getDocs(q)
        console.log("Query Snapshot:", querySnapShot);

        if(!querySnapShot.empty){
          setUser(querySnapShot.docs[0].data())
        } else {
          console.log("No user found");
        }
      }catch(err){
        console.log(err)
      }
    }else{
      console.error("FormData constructor was not provided an HTMLFormElement.");
    }
  }

  const handleAdd = async ()=>{
    const chatRef = collection(db, "chats")
    const userChatsRef = collection(db, "userchats")
    try{
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      })

      await updateDoc(doc(userChatsRef, user.id), {
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        })
      })

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        })
      })

      console.log(newChatRef.id)

    }catch(err){
      console.log(err)
    }
  }

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type='text' placeholder='Username' name='username' />
        <button>Search</button>
      </form>
      {user && (
        <div className='user'>
        <div className='detail'>
            <img src={user.avatar || './avatar.png'} alt='' />
            <span>{user.username}</span>
        </div>
        <button onClick={handleAdd}>Add user</button>
      </div>
      )}
    </div>
  )
}

export default Adduser

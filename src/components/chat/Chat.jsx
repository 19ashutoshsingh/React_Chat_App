import React, { useEffect, useRef, useState } from 'react'
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase Storage
const storage = getStorage();

async function upload(file) {
  if (!file) throw new Error("No file provided for upload");
  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

async function updateLastSeen(userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
      lastSeen: new Date()
  });
}

function Chat() {
    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const [img, setImg] = useState({
      file: null,
      url: "",
      timestamp: null,
    })

    // const [selectedUser, setSelectedUser] = useState(null); // State to manage selected user

    const {chatId, user, isCurrentUserBlocked, isReceiverBlocked} = useChatStore()
    const {currentUser} = useUserStore()

    const endRef = useRef(null)

    useEffect(()=>{
      endRef.current?.scrollIntoView({behavior:"smooth"})
    },[chat]) // change kiya hai                                 

    useEffect(()=> {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res)=>{
        setChat(res.data())
      })

      return () =>{
        unSub()
      }
    }, [chatId])

    console.log(chat)

    const handleEmoji = (e) =>{
        setText((prev)=>prev+e.emoji)
        setOpen(false)
    }

    const handleImg = e=>{
      if(e.target.files[0]){
          setImg({
              file:e.target.files[0],
              url: URL.createObjectURL(e.target.files[0]),
              timestamp: new Date() // Set the current timestamp when an image is selected
          })
      }
    }

    const handleSend = async ()=>{
      if(text === "") return;

      let imgUrl = null

      try{
        if(img.file){
          imgUrl = await upload(img.file)
        }

        await updateDoc(doc(db, "chats", chatId),{
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            ...(imgUrl && {img: imgUrl}),
          }),
        })

        // Update the last seen timestamp for the current user
        await updateLastSeen(currentUser.id);

        const userIds = [currentUser.id, user.id]

        userIds.forEach(async (id)=> {
          const userChatsRef = doc(db, "userchats", id)
          const userChatsSnapshot = await getDoc(userChatsRef)

          if(userChatsSnapshot.exists()){
            const userChatsData = userChatsSnapshot.data()

            const chatIndex = userChatsData.chats.findIndex(c=> c.chatId === chatId)

            userChatsData.chats[chatIndex].lastMessage = text
            userChatsData.chats[chatIndex].isSeen = currentUser.id? true: false
            userChatsData.chats[chatIndex].updatedAt = Date.now()

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            })

          }
        })

      }catch(err){
        console.log(err)
      }

      setImg({
        file: null,
        url: "",
      })

      setText("")
    }

    // Format time
    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Format last seen
    // const formatLastSeen = (timestamp) => {
    //   if (!timestamp) return "Offline";

    //   const lastSeenDate = new Date(timestamp.seconds * 1000);
    //   const now = new Date();

    //   if (now.toDateString() === lastSeenDate.toDateString()) {
    //     return `Last seen today at ${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    //   } else {
    //     return `Last seen on ${lastSeenDate.toLocaleDateString()} at ${lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    //   }
    // };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
            <img src={user?.avatar || "./avatar.png"} alt="" />
            <div className='texts'>
                <span>{user?.username}</span>
                {/* <p>Lorem ipsum dolor, sit amet.</p> */}
                {/* <p>{formatLastSeen(user?.lastSeen)}</p> */}
                <p>{user?.lastSeen ? formatTime(user.lastSeen) : "Offline"}</p>
            </div>
        </div>
        <div className='icons'>
        <img src="./phone.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./info.png" alt="" />
        </div>
      </div>

      <div className='center'>
        { chat?.messages?.map((message)=>(
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className='texts'>
            {message.img && <img src={message.img} alt="" />}
              <p>
                {message.text}
              </p>
              {/* Display the formatted time */}
              <span>{formatTime(message.createdAt)}</span>
              
            </div>
          </div>
        ))
          
        }

        {img.url && <div className='message own'>
          <div className='texts'>
            <img src={img.url} alt="" />
            {/* Display the time for unsent images */}
            {/* <span>{formatTime(message.createdAt)}</span> */}
            {/* <span>{formatTime(new Date())}</span> */}
          </div>
        </div>}

        <div ref={endRef}></div>
      </div>

      <div className='bottom'>
        <div className='icons'>
        <label htmlFor='file'>
          <img src="./img.png" alt="" />
        </label>
        <input type="file" id="file" style={{display: "none"}} onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <img src="./camera.png" alt="" />
        
        <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked)? "You cannot send a message": 'Type a message...'} value={text} onChange={e=>setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className='emoji'>
            <img src="./emoji.png" alt="" onClick={()=> setOpen(prev => !prev)}/>
            <div className='picker'>
              <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
            </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat

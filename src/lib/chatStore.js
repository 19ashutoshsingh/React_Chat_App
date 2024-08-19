import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user)=>{
    // const currentUser = useUserStore.getState().currentUser
    const { currentUser } = useUserStore.getState();
    // (added this line and commented above one)

    // check if current user is blocked
    if(user.blocked.includes(currentUser.id)){
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      })
    }

    // check if receiver is blocked
    else if(currentUser.blocked.includes(user.id)){
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      })
    }
    else{
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      })
    }

  },

  changeBlock: () => {
    set((state) => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
  },

  clearChatWithUser: async () => {
    const { currentUser } = useUserStore.getState();
    const { user } = useChatStore.getState();

    if (!currentUser || !user) return;

    try {
      // Assuming chats are stored in a 'chats' collection with documents for each chat
      const chatRef = doc(db, 'chats', `${currentUser.id}_${user.id}`);
      await updateDoc(chatRef, {
        messages: [], // Clear messages
      });

      // Clear chat state
      set({
        chatId: null,
        user: null,
      });
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  }

}))
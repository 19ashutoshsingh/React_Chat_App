import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  setLoading: (loading) => set({ isLoading: loading }),
  fetchUserInfo: async (uid) =>{
    if(!uid){
      console.log("No UID provided, setting to null");
      return set({currentUser: null, isLoading: false})
    }

    try{
        const docRef = doc(db, "users", uid)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists()){
            set({currentUser: docSnap.data(), isLoading: false})
        }else{
            set({currentUser: null, isLoading: false})
        }

    }catch(err){
        console.log("Error: ",err)
        set({currentUser: null, isLoading: false})
        // (here i removed return)
    }
  },

  // Method to clear user state
  clearUser: () => set({ currentUser: null }),


}))
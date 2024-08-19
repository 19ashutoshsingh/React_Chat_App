// userOperations.js
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

// Function to fetch users sorted by 'createdAt'
export const fetchUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc')); // or 'asc' for ascending order
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
};

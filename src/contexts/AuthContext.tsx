import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  registerAdmin: (email: string, password: string, name: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const user: User = {
          uid: userDoc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          role: data.role || 'user',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        setUserData(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      phone: '',
      address: '',
      role: 'user',
      createdAt: serverTimestamp(),
    });
    await fetchUserData(user.uid);
  };

  const registerAdmin = async (email: string, password: string, name: string) => {
    // Check if admin already exists
    const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(adminsQuery);
    
    if (!adminsSnapshot.empty) {
      throw new Error('An admin already exists. Only one admin is allowed.');
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      phone: '',
      address: '',
      role: 'admin',
      createdAt: serverTimestamp(),
    });
    await fetchUserData(user.uid);
  };

  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(user.uid);
  };

  const loginAdmin = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      await signOut(auth);
      throw new Error('Access denied. Admin account required.');
    }
    
    await fetchUserData(user.uid);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
    setCurrentUser(null);
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');
    
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    
    await setDoc(doc(db, 'users', currentUser.uid), updateData, { merge: true });
    await fetchUserData(currentUser.uid);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    isAdmin: userData?.role === 'admin',
    registerAdmin,
    loginAdmin,
    updateUserData,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

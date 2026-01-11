import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Banner } from '@/types';

export const useBanners = (activeOnly = false) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (activeOnly) {
      q = query(collection(db, 'banners'), where('active', '==', true));
    } else {
      q = collection(db, 'banners');
    }
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bannersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          imageUrl: doc.data().imageUrl || '',
          targetUrl: doc.data().targetUrl || '',
          active: doc.data().active ?? true,
        })) as Banner[];
        setBanners(bannersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching banners:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeOnly]);

  return { banners, loading };
};

export const bannerService = {
  async create(banner: Omit<Banner, 'id'>) {
    const docRef = await addDoc(collection(db, 'banners'), banner);
    return docRef.id;
  },

  async update(id: string, data: Partial<Banner>) {
    const updateData: Record<string, any> = { ...data };
    delete updateData.id;
    await updateDoc(doc(db, 'banners', id), updateData);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'banners', id));
  },
};

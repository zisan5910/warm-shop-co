import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Category } from '@/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            price: data.price || 0,
            stock: data.stock || 0,
            categoryId: data.categoryId || '',
            images: data.images || [],
            description: data.description || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Product;
        });
        setProducts(productsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            id: docSnap.id,
            name: data.name || '',
            price: data.price || 0,
            stock: data.stock || 0,
            categoryId: data.categoryId || '',
            images: data.images || [],
            description: data.description || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Product);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
        })) as Category[];
        setCategories(categoriesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading };
};

export const useProductsByCategory = (categoryId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'products'), where('categoryId', '==', categoryId)),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            price: data.price || 0,
            stock: data.stock || 0,
            categoryId: data.categoryId || '',
            images: data.images || [],
            description: data.description || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Product;
        });
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products by category:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  return { products, loading };
};

export const productService = {
  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Product>) {
    const updateData: Record<string, any> = { ...data, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.createdAt;
    await updateDoc(doc(db, 'products', id), updateData);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'products', id));
  },
};

export const categoryService = {
  async create(name: string) {
    const docRef = await addDoc(collection(db, 'categories'), { name });
    return docRef.id;
  },

  async update(id: string, name: string) {
    await updateDoc(doc(db, 'categories', id), { name });
  },

  async delete(id: string) {
    await deleteDoc(doc(db, 'categories', id));
  },
};

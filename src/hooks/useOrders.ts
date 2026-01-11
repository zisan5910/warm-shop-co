import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useOrders = () => {
  const { currentUser, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // For admin, get all orders. For users, get only their orders
    let q;
    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || '',
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            paymentMethod: data.paymentMethod || 'cod',
            paymentStatus: data.paymentStatus || 'pending',
            paymentReference: data.paymentReference || '',
            deliveryAddress: data.deliveryAddress || '',
            deliveryCharge: data.deliveryCharge || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Order;
        });
        setOrders(ordersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAdmin]);

  return { orders, loading, error };
};

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({
            id: docSnap.id,
            userId: data.userId || '',
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            paymentMethod: data.paymentMethod || 'cod',
            paymentStatus: data.paymentStatus || 'pending',
            paymentReference: data.paymentReference || '',
            deliveryAddress: data.deliveryAddress || '',
            deliveryCharge: data.deliveryCharge || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Order);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return { order, loading, error };
};

export const orderService = {
  async create(order: Omit<Order, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateStatus(id: string, status: OrderStatus) {
    await updateDoc(doc(db, 'orders', id), { status });
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    await updateDoc(doc(db, 'orders', id), { paymentStatus });
  },
};

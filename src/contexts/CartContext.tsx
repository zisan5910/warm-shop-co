import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  cartProducts: (CartItem & { product: Product })[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState<(CartItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProductDetails = useCallback(async (cartItems: CartItem[]) => {
    if (cartItems.length === 0) {
      setCartProducts([]);
      return;
    }

    try {
      const productsWithDetails = await Promise.all(
        cartItems.map(async (item: CartItem) => {
          try {
            const productDoc = await getDoc(doc(db, 'products', item.productId));
            if (productDoc.exists()) {
              const data = productDoc.data();
              return {
                ...item,
                product: { 
                  id: productDoc.id, 
                  name: data.name || '',
                  price: data.price || 0,
                  stock: data.stock || 0,
                  categoryId: data.categoryId || '',
                  images: data.images || [],
                  description: data.description || '',
                  createdAt: data.createdAt?.toDate() || new Date(),
                  updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Product,
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching product:', item.productId, error);
            return null;
          }
        })
      );

      setCartProducts(productsWithDetails.filter(Boolean) as (CartItem & { product: Product })[]);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      setCartProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      doc(db, 'carts', currentUser.uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const cartData = docSnap.data();
          const cartItems = cartData.items || [];
          setItems(cartItems);
          await fetchProductDetails(cartItems);
        } else {
          setItems([]);
          setCartProducts([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to cart:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, fetchProductDetails]);

  const saveCart = async (newItems: CartItem[]) => {
    if (!currentUser) throw new Error('Not logged in');
    
    await setDoc(doc(db, 'carts', currentUser.uid), {
      userId: currentUser.uid,
      items: newItems,
      updatedAt: serverTimestamp(),
    });
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!currentUser) throw new Error('Please login to add items to cart');

    const existingItem = items.find((item) => item.productId === productId);
    let newItems: CartItem[];

    if (existingItem) {
      newItems = items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...items, { productId, quantity }];
    }

    await saveCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    await saveCart(newItems);
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter((item) => item.productId !== productId);
    await saveCart(newItems);
  };

  const clearCart = async () => {
    if (!currentUser) return;
    await setDoc(doc(db, 'carts', currentUser.uid), {
      userId: currentUser.uid,
      items: [],
      updatedAt: serverTimestamp(),
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartProducts.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount,
    cartProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

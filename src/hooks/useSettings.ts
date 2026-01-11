import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings } from '@/types';

const DEFAULT_SETTINGS: Settings = {
  paymentMethods: {
    cod: true,
    bkash: true,
  },
  deliveryCharges: {
    default: 60,
    dhaka: 60,
    outside_dhaka: 120,
  },
  appName: 'ShopHub',
  appLogo: '',
  phone: '',
  whatsapp: '',
  email: '',
  bkashNumber: '',
  location: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            paymentMethods: {
              cod: data.paymentMethods?.cod ?? true,
              bkash: data.paymentMethods?.bkash ?? true,
            },
            deliveryCharges: {
              default: data.deliveryCharges?.default ?? 60,
              dhaka: data.deliveryCharges?.dhaka ?? 60,
              outside_dhaka: data.deliveryCharges?.outside_dhaka ?? 120,
              ...data.deliveryCharges,
            },
            appName: data.appName ?? 'ShopHub',
            appLogo: data.appLogo ?? '',
            phone: data.phone ?? '',
            whatsapp: data.whatsapp ?? '',
            email: data.email ?? '',
            bkashNumber: data.bkashNumber ?? '',
            location: data.location ?? '',
          });
        } else {
          // Initialize settings if not exists
          setDoc(doc(db, 'settings', 'main'), DEFAULT_SETTINGS).catch(console.error);
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};

export const settingsService = {
  async updatePaymentMethods(paymentMethods: Settings['paymentMethods']) {
    await setDoc(doc(db, 'settings', 'main'), { paymentMethods }, { merge: true });
  },

  async updateDeliveryCharges(deliveryCharges: Settings['deliveryCharges']) {
    await setDoc(doc(db, 'settings', 'main'), { deliveryCharges }, { merge: true });
  },

  async updateBranding(data: { appName: string; appLogo: string }) {
    await setDoc(doc(db, 'settings', 'main'), data, { merge: true });
  },

  async updateContactInfo(data: { phone: string; whatsapp: string; email: string; location: string }) {
    await setDoc(doc(db, 'settings', 'main'), data, { merge: true });
  },

  async updatePaymentInfo(data: { bkashNumber: string }) {
    await setDoc(doc(db, 'settings', 'main'), data, { merge: true });
  },
};

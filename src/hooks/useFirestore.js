import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

export const useFirestore = (collection, documentId, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    defaultValue = null,
    enableRealtime = true,
    enableOffline = true
  } = options;

  useEffect(() => {
    if (!isFirebaseConfigured || !documentId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collection, documentId);

    if (enableRealtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            setData(doc.data());
          } else {
            setData(defaultValue);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore error:', err);
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } else {
      // One-time fetch
      const fetchData = async () => {
        try {
          const doc = await getDoc(docRef);
          if (doc.exists()) {
            setData(doc.data());
          } else {
            setData(defaultValue);
          }
          setError(null);
        } catch (err) {
          console.error('Firestore error:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [collection, documentId, defaultValue, enableRealtime]);

  const updateData = useCallback(async (newData, merge = true) => {
    if (!isFirebaseConfigured || !documentId) {
      console.warn('Firebase not configured or no document ID');
      return false;
    }

    try {
      const docRef = doc(db, collection, documentId);
      const dataToSave = {
        ...newData,
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, dataToSave, { merge });
      return true;
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err);
      return false;
    }
  }, [collection, documentId]);

  return {
    data,
    loading,
    error,
    updateData,
    isConnected: isFirebaseConfigured
  };
};

export const useFirestoreDoc = (collectionPath, docId, options = {}) => {
  return useFirestore(collectionPath, docId, options);
};
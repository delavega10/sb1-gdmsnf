import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Experience } from '../types';

export function useExperience(id: string) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchExperience() {
      try {
        const docRef = doc(db, 'experiences', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setExperience({ id: docSnap.id, ...docSnap.data() } as Experience);
        } else {
          throw new Error('Experience not found');
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    if (id) {
      fetchExperience();
    }
  }, [id]);

  return { experience, loading, error };
}
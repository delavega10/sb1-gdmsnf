import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SAMPLE_EXPERIENCES } from '../data/experiences';
import type { Experience } from '../types';

export function useExperiences(categoryFilter?: string, limitCount: number = 10) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSampleData() {
      try {
        const experiencesRef = collection(db, 'experiences');
        const snapshot = await getDocs(experiencesRef);
        
        if (snapshot.empty) {
          const batch = [];
          for (const experience of SAMPLE_EXPERIENCES) {
            batch.push(addDoc(collection(db, 'experiences'), experience));
          }
          await Promise.all(batch);
        }
      } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
      }
    }

    async function fetchExperiences() {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        await initializeSampleData();

        const experiencesRef = collection(db, 'experiences');
        let baseQuery;

        if (categoryFilter) {
          baseQuery = query(
            experiencesRef,
            where('category', '==', categoryFilter),
            limit(limitCount)
          );
        } else {
          baseQuery = query(
            experiencesRef,
            limit(limitCount)
          );
        }

        const querySnapshot = await getDocs(baseQuery);
        
        if (!isMounted) return;

        const experiencesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[];

        // Sort experiences by rating client-side to avoid complex indexes
        const sortedExperiences = experiencesData.sort((a, b) => b.rating - a.rating);
        setExperiences(sortedExperiences);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchExperiences();

    return () => {
      isMounted = false;
    };
  }, [categoryFilter, limitCount]);

  return { experiences, loading, error };
}
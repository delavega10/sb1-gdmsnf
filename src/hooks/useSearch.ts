import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Experience } from '../types';

export function useSearch() {
  const [searchResults, setSearchResults] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchExperiences = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const experiencesRef = collection(db, 'experiences');
      const searchLower = searchTerm.toLowerCase();

      // Get all experiences and filter client-side to avoid complex indexes
      const baseQuery = query(experiencesRef, limit(50));
      const snapshot = await getDocs(baseQuery);
      
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Experience))
        .filter(exp => 
          exp.title.toLowerCase().includes(searchLower) ||
          exp.description.toLowerCase().includes(searchLower) ||
          exp.location.toLowerCase().includes(searchLower) ||
          exp.category.toLowerCase().includes(searchLower)
        )
        .sort((a, b) => {
          // Prioritize title matches
          const aTitle = a.title.toLowerCase().includes(searchLower);
          const bTitle = b.title.toLowerCase().includes(searchLower);
          if (aTitle && !bTitle) return -1;
          if (!aTitle && bTitle) return 1;
          return 0;
        })
        .slice(0, 10); // Limit results to top 10 matches

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching experiences:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchResults, loading, error, searchExperiences };
}
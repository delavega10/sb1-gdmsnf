import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react';
import CategoryBar from '../components/CategoryBar';
import ExperienceCard from '../components/ExperienceCard';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categoryIdToLabel } from '../lib/categories';
import type { Experience } from '../types';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const categoryId = searchParams.get('category');

  useEffect(() => {
    async function fetchExperiences() {
      setLoading(true);
      setError(null);
      
      try {
        const experiencesRef = collection(db, 'experiences');
        let baseQuery;

        if (categoryId) {
          const categoryLabel = categoryIdToLabel(categoryId);
          if (categoryLabel) {
            baseQuery = query(
              experiencesRef,
              where('category', '==', categoryLabel),
              limit(50)
            );
          } else {
            baseQuery = query(experiencesRef, limit(50));
          }
        } else {
          baseQuery = query(experiencesRef, limit(50));
        }

        const querySnapshot = await getDocs(baseQuery);
        const experiencesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[];

        // Filter by search query if present
        const filteredExperiences = searchQuery
          ? experiencesData.filter(exp =>
              exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              exp.location.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : experiencesData;

        setExperiences(filteredExperiences);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, [categoryId, searchQuery]);

  return (
    <>
      <CategoryBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center text-red-600 mb-2">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Something went wrong</h3>
            </div>
            <p className="text-gray-500">Please try again later</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
            <p className="text-gray-500">
              {categoryId ? 'Try a different category or' : 'Try'} adjusting your search
            </p>
          </div>
        )}
      </main>
    </>
  );
}
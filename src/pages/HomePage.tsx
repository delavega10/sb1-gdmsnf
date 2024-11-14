import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBar from '../components/CategoryBar';
import ExperienceCard from '../components/ExperienceCard';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Experience } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const q = query(
          collection(db, 'experiences'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const experiencesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[];
        
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  return (
    <>
      <div className="relative h-[70vh] bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3)'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Unique Experiences</h1>
            <p className="text-xl md:text-2xl mb-8">Connect with local hosts and create unforgettable memories</p>
            <button 
              onClick={() => navigate('/explore')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>

      <CategoryBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest Experiences</h2>
          <button 
            onClick={() => navigate('/explore')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
              <div 
                key={experience.id}
                onClick={() => navigate(`/experience/${experience.id}`)}
                className="cursor-pointer"
              >
                <ExperienceCard experience={experience} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No experiences available yet.</p>
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Choose LocalXplore?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Authentic Local Experiences',
                description: 'Connect with passionate local hosts who share their culture and expertise.'
              },
              {
                title: 'Verified Hosts',
                description: 'All our hosts go through a thorough verification process for your safety.'
              },
              {
                title: 'Memorable Adventures',
                description: "Create lasting memories with unique experiences you won't find anywhere else."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ExperienceCard from './ExperienceCard';
import type { Experience } from '../types';

export default function ExperienceList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      if (!user?.id) return;

      try {
        const q = query(
          collection(db, 'experiences'),
          where('host.id', '==', user.id)
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
  }, [user]);

  const handleEditExperience = (id: string) => {
    navigate(`/edit-experience/${id}`);
  };

  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    try {
      await deleteDoc(doc(db, 'experiences', id));
      setExperiences(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Experiences</h2>
        <button
          onClick={() => navigate('/create-experience')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create New Experience
        </button>
      </div>

      {experiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              showEditControls
              onEdit={handleEditExperience}
              onDelete={handleDeleteExperience}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't created any experiences yet.</p>
          <button
            onClick={() => navigate('/create-experience')}
            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create your first experience
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Star, MapPin, Globe, MessageSquare } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { User, Experience } from '../types';
import ExperienceCard from '../components/ExperienceCard';
import MessageModal from '../components/MessageModal';

export default function HostProfilePage() {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [host, setHost] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    async function fetchHostData() {
      if (!hostId) return;

      try {
        // Fetch host data
        const hostDoc = await getDoc(doc(db, 'users', hostId));
        if (!hostDoc.exists()) {
          navigate('/');
          return;
        }
        setHost({ id: hostDoc.id, ...hostDoc.data() } as User);

        // Fetch host's experiences
        const q = query(
          collection(db, 'experiences'),
          where('host.id', '==', hostId)
        );
        const querySnapshot = await getDocs(q);
        const experiencesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[];
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching host data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHostData();
  }, [hostId, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Host not found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            {host.avatar ? (
              <img
                src={host.avatar}
                alt={host.name}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(host.name)}&background=random`;
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-500">
                  {host.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{host.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                {host.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{host.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>Speaks {host.languages?.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {user && user.id !== host.id && (
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Message Host</span>
            </button>
          )}
        </div>

        {host.bio && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-600">{host.bio}</p>
          </div>
        )}

        {host.interests && host.interests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {host.interests.map(interest => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-indigo-50 rounded-full text-sm text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">{host.name}'s Experiences</h2>
        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No experiences available yet.</p>
          </div>
        )}
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        host={host}
      />
    </div>
  );
}
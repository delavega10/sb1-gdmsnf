import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Calendar, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import MessageModal from '../components/MessageModal';
import AuthModal from '../components/AuthModal';
import type { Experience } from '../types';

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBookings(user?.id);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function fetchExperience() {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'experiences', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setExperience({ id: docSnap.id, ...docSnap.data() } as Experience);
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExperience();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
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

  const getAvailableSpots = (date: string) => {
    const booked = experience.bookedParticipants?.[date] || 0;
    return Math.max(0, experience.maxParticipants - booked);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedDate) return;

    const availableSpots = getAvailableSpots(selectedDate);
    if (availableSpots < guests) {
      alert('Not enough spots available for this date');
      return;
    }

    setIsBooking(true);
    try {
      const serviceFee = Math.round(experience.price * guests * 0.12);
      const totalAmount = experience.price * guests + serviceFee;

      await createBooking({
        experienceId: experience.id,
        userId: user.id,
        date: selectedDate,
        numberOfGuests: guests,
        totalAmount,
        status: 'confirmed'
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img
            src={experience.imageUrl}
            alt={experience.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{experience.rating}</span>
                <span className="text-gray-500">({experience.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>{experience.duration}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <MapPin className="w-5 h-5" />
                <span>{experience.location}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600">{experience.description}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">About your host</h2>
            <div className="flex items-center justify-between">
              <Link
                to={`/host/${experience.host.id}`}
                className="flex items-center space-x-4 group"
              >
                <img
                  src={experience.host.avatar}
                  alt={experience.host.name}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64x64?text=Host';
                  }}
                />
                <div>
                  <h3 className="font-medium group-hover:text-indigo-600">
                    {experience.host.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{experience.host.rating}</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setIsMessageModalOpen(true)}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Message Host</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <span className="text-2xl font-bold">{experience.currency}{experience.price}</span>
                <span className="text-gray-500"> / person</span>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select a date</option>
                      {experience.eventDates
                        .filter(date => {
                          const eventDate = new Date(date);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return eventDate >= today && getAvailableSpots(date) > 0;
                        })
                        .sort()
                        .map(date => {
                          const spots = getAvailableSpots(date);
                          return (
                            <option key={date} value={date} disabled={spots < guests}>
                              {new Date(date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {` (${spots} spots left)`}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      {[...Array(8)].map((_, i) => {
                        const num = i + 1;
                        const available = selectedDate ? getAvailableSpots(selectedDate) >= num : true;
                        return (
                          <option key={num} value={num} disabled={!available}>
                            {num} guest{num > 1 ? 's' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {selectedDate && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {experience.currency}{experience.price} × {guests} {guests === 1 ? 'guest' : 'guests'}
                      </span>
                      <span>{experience.currency}{experience.price * guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span>{experience.currency}{Math.round(experience.price * guests * 0.12)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span>
                        {experience.currency}
                        {experience.price * guests + Math.round(experience.price * guests * 0.12)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking || !selectedDate}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isBooking ? 'Processing...' : user ? 'Book Experience' : 'Sign in to Book'}
                </button>

                {!selectedDate && (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Select a date to continue</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <MessageModal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)}
        experience={experience}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { MessageSquare, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Booking, Experience } from '../types';
import MessageModal from './MessageModal';

export default function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { experience: Experience })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.id) return;

      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.id)
        );
        
        const querySnapshot = await getDocs(q);
        const bookingsWithExperiences = await Promise.all(
          querySnapshot.docs.map(async (bookingDoc) => {
            const bookingData = bookingDoc.data();
            const experienceRef = doc(db, 'experiences', bookingData.experienceId);
            const experienceSnap = await getDoc(experienceRef);
            return {
              id: bookingDoc.id,
              ...bookingData,
              experience: experienceSnap.exists() 
                ? { id: experienceSnap.id, ...experienceSnap.data() } 
                : null
            };
          })
        );

        const validBookings = bookingsWithExperiences.filter(
          booking => booking.experience !== null
        ) as (Booking & { experience: Experience })[];
        
        setBookings(validBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{booking.experience.title}</h3>
                  <p className="text-gray-600">
                    {new Date(booking.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {booking.experience.currency}{booking.totalAmount}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsMessageModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Host</span>
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't made any bookings yet.</p>
        </div>
      )}

      {selectedBooking && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedBooking(null);
          }}
          experience={selectedBooking.experience}
          bookingId={selectedBooking.id}
        />
      )}
    </div>
  );
}
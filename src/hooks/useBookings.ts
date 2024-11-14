import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Booking } from '../types';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      if (!userId) return;
      
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        
        setBookings(bookingsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [userId]);

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      // Create the booking
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: new Date().toISOString()
      });

      // Update the experience's booked participants
      const experienceRef = doc(db, 'experiences', bookingData.experienceId);
      await updateDoc(experienceRef, {
        [`bookedParticipants.${bookingData.date}`]: increment(bookingData.numberOfGuests)
      });

      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  return { bookings, loading, error, createBooking };
}
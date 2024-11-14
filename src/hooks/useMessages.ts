import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Message, Conversation } from '../types';

interface SendMessageParams {
  receiverId: string;
  content: string;
  experienceId?: string;
  bookingId?: string;
}

export function useMessages(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupMessagesListener = async () => {
      try {
        // Create a simpler query first
        const q = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', userId),
          limit(50)
        );

        unsubscribe = onSnapshot(
          q, 
          (snapshot) => {
            const conversationsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
            })) as Conversation[];
            
            // Sort conversations by updatedAt client-side
            conversationsData.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            
            setConversations(conversationsData);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Error in messages listener:', err);
            setError(err as Error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up messages listener:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    setupMessagesListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const sendMessage = async ({
    receiverId,
    content,
    experienceId,
    bookingId
  }: SendMessageParams): Promise<string> => {
    if (!userId) throw new Error('User must be logged in to send messages');

    try {
      // Find existing conversation
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const existingConversation = querySnapshot.docs.find(doc => 
        doc.data().participants.includes(receiverId)
      );

      let conversationId: string;

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const newConversationRef = await addDoc(conversationsRef, {
          participants: [userId, receiverId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        conversationId = newConversationRef.id;
      }

      // Create message
      const messageData = {
        conversationId,
        senderId: userId,
        receiverId,
        content: content.trim(),
        timestamp: serverTimestamp(),
        read: false,
        ...(experienceId && { experienceId }),
        ...(bookingId && { bookingId })
      };

      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Update conversation
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          id: messageRef.id,
          content: content.trim(),
          senderId: userId,
          receiverId,
          timestamp: serverTimestamp(),
          read: false,
          ...(experienceId && { experienceId }),
          ...(bookingId && { bookingId })
        },
        updatedAt: serverTimestamp()
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return { 
    conversations, 
    loading, 
    error, 
    sendMessage,
    retryConnection: () => setError(null)
  };
}
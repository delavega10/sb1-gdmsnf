import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../hooks/useMessages';
import type { Message, User, Experience } from '../types';

interface ConversationInfo {
  userName: string;
  experienceTitle?: string;
  userAvatar?: string;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading: loadingConversations, sendMessage } = useMessages(user?.id);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationInfos, setConversationInfos] = useState<Record<string, ConversationInfo>>({});

  // Fetch user and experience info for each conversation
  useEffect(() => {
    async function fetchConversationInfo(conversationId: string, otherUserId: string, experienceId?: string) {
      try {
        // Fetch user info
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        const userData = userDoc.data() as User;
        
        let experienceTitle;
        if (experienceId) {
          const experienceDoc = await getDoc(doc(db, 'experiences', experienceId));
          if (experienceDoc.exists()) {
            const experienceData = experienceDoc.data() as Experience;
            experienceTitle = experienceData.title;
          }
        }

        setConversationInfos(prev => ({
          ...prev,
          [conversationId]: {
            userName: userData?.name || 'Unknown User',
            userAvatar: userData?.avatar,
            experienceTitle
          }
        }));
      } catch (error) {
        console.error('Error fetching conversation info:', error);
      }
    }

    conversations.forEach(conv => {
      const otherUserId = conv.participants.find(id => id !== user?.id);
      if (otherUserId) {
        const experienceId = conv.lastMessage?.experienceId;
        fetchConversationInfo(conv.id, otherUserId, experienceId);
      }
    });
  }, [conversations, user?.id]);

  useEffect(() => {
    if (!selectedConversation || !user) return;

    setLoadingMessages(true);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as Message[];

      // Mark messages as read
      const unreadMessages = messagesData.filter(
        msg => !msg.read && msg.receiverId === user.id
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg =>
            updateDoc(doc(db, 'messages', msg.id), { read: true })
          )
        );
      }

      setMessages(messagesData);
      setLoadingMessages(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [selectedConversation, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const receiverId = conversation.participants.find(id => id !== user.id);
      if (!receiverId) return;

      await sendMessage({
        receiverId,
        content: newMessage,
        experienceId: conversation.lastMessage?.experienceId
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view messages</h1>
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
          {/* Conversations List */}
          <div className="border-r">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            {loadingConversations ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y">
                {conversations.map((conv) => {
                  const info = conversationInfos[conv.id];
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 ${
                        selectedConversation === conv.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {info?.userAvatar ? (
                          <img 
                            src={info.userAvatar}
                            alt={info.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {info?.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">
                              {info?.userName || 'Loading...'}
                            </span>
                            {conv.lastMessage && !conv.lastMessage.read && 
                             conv.lastMessage.receiverId === user.id && (
                              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          {info?.experienceTitle && (
                            <p className="text-sm text-indigo-600 truncate">
                              Re: {info.experienceTitle}
                            </p>
                          )}
                          {conv.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="md:hidden">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="flex items-center text-gray-600"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </button>
                    </div>
                    <div>
                      <h2 className="font-medium">
                        {conversationInfos[selectedConversation]?.userName}
                      </h2>
                      {conversationInfos[selectedConversation]?.experienceTitle && (
                        <p className="text-sm text-indigo-600">
                          {conversationInfos[selectedConversation]?.experienceTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {loadingMessages ? (
                    <div className="text-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading messages...
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              message.senderId === user.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
                            <span className="text-xs opacity-75">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      No messages yet
                    </div>
                  )}
                </div>
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
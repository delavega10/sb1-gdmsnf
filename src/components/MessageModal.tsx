import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../hooks/useMessages';
import type { User, Experience } from '../types';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience;
  host?: User;
  bookingId?: string;
}

export default function MessageModal({ 
  isOpen, 
  onClose, 
  experience,
  host,
  bookingId 
}: MessageModalProps) {
  const { user, isLoading } = useAuth();
  const { sendMessage } = useMessages(user?.id);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || isLoading || !user) return null;

  const receiverId = host?.id || experience?.host.id;
  const receiverName = host?.name || experience?.host.name;

  if (!receiverId || !receiverName) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await sendMessage({
        receiverId,
        content: message,
        experienceId: experience?.id,
        bookingId
      });
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Message {receiverName}
        </h2>

        {experience && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">About the experience:</h3>
            <p className="text-gray-600">{experience.title}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Write your message here..."
              required
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>For your safety:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Keep communication within the platform</li>
              <li>Never share personal contact information</li>
              <li>Report suspicious behavior</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
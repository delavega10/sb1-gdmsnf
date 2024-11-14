import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ImageUpload from './ImageUpload';

export default function ProfileImageUpload() {
  const { user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleImageUploaded = async (imageUrl: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        avatar: imageUrl
      });
      
      // Close the upload modal
      setIsUploadOpen(false);
      // Refresh the page to update the user context
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Failed to update profile image. Please try again.');
    }
  };

  return (
    <>
      <button 
        className="relative group" 
        onClick={() => setIsUploadOpen(true)}
        type="button"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </button>

      {isUploadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile Image</h3>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={user?.avatar}
              folder="profiles"
            />
            <button
              onClick={() => setIsUploadOpen(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
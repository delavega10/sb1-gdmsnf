import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from './ImageUpload';

const SAMPLE_LANGUAGES = [
  'English', 'Danish', 'Swedish', 'Norwegian', 'German', 'French', 
  'Spanish', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean'
];

const SAMPLE_INTERESTS = [
  'Travel', 'Food', 'Music', 'Nature', 'Photography', 'Art', 
  'Sports', 'Technology', 'Reading', 'Writing', 'Cooking', 'Dancing'
];

const SAMPLE_BIO = `Hi, I'm a passionate explorer and experience creator based in Copenhagen! 

With over 5 years of experience in organizing unique local experiences, I specialize in creating authentic cultural exchanges and unforgettable adventures.

My mission is to help travelers discover the real Denmark through immersive experiences that go beyond typical tourist attractions. Whether it's a traditional cooking class, urban photography tour, or hidden gems walking tour, I focus on creating meaningful connections and memories.

I speak multiple Scandinavian languages and love sharing stories about Nordic culture, history, and traditions. When I'm not hosting experiences, you'll find me exploring new neighborhoods, trying out local restaurants, or photographing the beautiful Copenhagen architecture.

Let me help you discover Copenhagen like a local!`;

export default function ProfileEdit() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || SAMPLE_BIO,
    location: user?.location || 'Copenhagen, Denmark',
    languages: user?.languages || ['English', 'Danish', 'Swedish', 'Norwegian'],
    interests: user?.interests || ['Travel', 'Food', 'Music', 'Nature']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'languages' | 'interests', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        languages: formData.languages,
        interests: formData.interests,
        updatedAt: new Date().toISOString()
      });

      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploaded = async (url: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        avatar: url
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Failed to update profile image. Please try again.');
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImageUrl={user?.avatar}
                folder="profiles"
              />
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
                <p className="text-lg text-gray-600">{formData.location}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="prose max-w-none">
              {formData.bio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Languages & Location */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map(language => (
                  <span
                    key={language}
                    className="px-4 py-2 bg-gray-100 rounded-full text-gray-700"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map(interest => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-indigo-50 rounded-full text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Profile Image
            </label>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              currentImageUrl={user?.avatar}
              folder="profiles"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Basic Information
            </label>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              About You
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Tell others about yourself..."
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_LANGUAGES.map(language => (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleArrayChange('languages', language)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    formData.languages.includes(language)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleArrayChange('interests', interest)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    formData.interests.includes(interest)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}